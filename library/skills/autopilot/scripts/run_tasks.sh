#!/bin/bash
# ============================================================
# Autopilot Task Runner
# Executes tasks from TASKS.md one at a time via `claude -p`
# Each session gets a fresh context window with HANDOFF.md
# for continuity.
#
# Safety features:
#   - Branch protection (refuses to run on main/master)
#   - PID lockfile prevents double-run
#   - Per-session timeout prevents hangs
#   - Test requirement before marking tasks complete
#   - Checkpoint tags for easy rollback
#   - Graceful pause via .autopilot-pause file
#   - Max changed files limit
#   - Log rotation prevents disk fill
# ============================================================

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/../../../.." && pwd)"
TASKS_FILE="$PROJECT_DIR/TASKS.md"
HANDOFF_FILE="$PROJECT_DIR/HANDOFF.md"
LOG_DIR="$PROJECT_DIR/.autopilot-logs"
PID_FILE="$LOG_DIR/autopilot.pid"
PAUSE_FILE="$PROJECT_DIR/.autopilot-pause"

# --- Config (override via env vars or .autopilot.yml) ---
MAX_RETRIES="${AUTOPILOT_MAX_RETRIES:-2}"
COOLDOWN="${AUTOPILOT_COOLDOWN:-5}"
MAX_ITERATIONS="${AUTOPILOT_MAX_ITERATIONS:-50}"
AUTO_COMMIT="${AUTOPILOT_AUTO_COMMIT:-true}"
REQUIRE_TESTS="${AUTOPILOT_REQUIRE_TESTS:-true}"
TEST_COMMAND="${AUTOPILOT_TEST_COMMAND:-}"
SESSION_TIMEOUT="${AUTOPILOT_SESSION_TIMEOUT:-600}"
MAX_LOG_FILES="${AUTOPILOT_MAX_LOG_FILES:-100}"
MAX_CHANGED_FILES="${AUTOPILOT_MAX_CHANGED_FILES:-20}"
PROTECTED_BRANCHES="${AUTOPILOT_PROTECTED_BRANCHES:-main,master,production}"

# --- Setup ---
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MASTER_LOG="$LOG_DIR/run_$TIMESTAMP.log"

log() {
  echo "[$(date '+%H:%M:%S')] $1" | tee -a "$MASTER_LOG"
}

# --- Branch protection ---
CURRENT_BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "")
if [ -n "$CURRENT_BRANCH" ]; then
  IFS=',' read -ra PROTECTED <<< "$PROTECTED_BRANCHES"
  for branch in "${PROTECTED[@]}"; do
    if [ "$CURRENT_BRANCH" = "$branch" ]; then
      echo "ERROR: Cannot run autopilot on protected branch '$CURRENT_BRANCH'"
      echo "Create a feature branch first: git checkout -b autopilot/$(date +%Y%m%d)"
      exit 1
    fi
  done
fi

# --- Lockfile: prevent double-run ---
if [ -f "$PID_FILE" ]; then
  EXISTING_PID=$(cat "$PID_FILE" 2>/dev/null || echo "")
  if [ -n "$EXISTING_PID" ] && kill -0 "$EXISTING_PID" 2>/dev/null; then
    echo "ERROR: Autopilot already running (PID $EXISTING_PID)"
    echo "Stop it first: kill $EXISTING_PID"
    exit 1
  else
    # Stale PID file - previous run crashed
    rm -f "$PID_FILE"
  fi
fi
echo $$ > "$PID_FILE"

# Clean up PID file on exit
cleanup() {
  rm -f "$PID_FILE"
  log "Autopilot PID file cleaned up"
}
trap cleanup EXIT

# --- Log rotation: keep only recent logs (cross-platform) ---
rotate_logs() {
  local log_files
  log_files=$(find "$LOG_DIR" -name "session_*.log" -type f 2>/dev/null | wc -l)
  if [ "$log_files" -gt "$MAX_LOG_FILES" ]; then
    # Cross-platform: use ls -t instead of find -printf
    ls -t "$LOG_DIR"/session_*.log 2>/dev/null | tail -n +$((MAX_LOG_FILES + 1)) | xargs rm -f 2>/dev/null || true
    log "Rotated old session logs (kept last $MAX_LOG_FILES)"
  fi
}

# --- Preflight ---
if ! command -v claude &> /dev/null; then
  log "ERROR: 'claude' CLI not found."
  log "Install: npm install -g @anthropic-ai/claude-code"
  exit 1
fi

if [ ! -f "$TASKS_FILE" ]; then
  log "ERROR: TASKS.md not found. Run gather_tasks.py first."
  exit 1
fi

if [ ! -f "$HANDOFF_FILE" ]; then
  log "Creating HANDOFF.md..."
  cat > "$HANDOFF_FILE" << 'EOF'
# Autopilot Handoff

## Last Completed
- (none yet)

## Key Decisions
- (none yet)

## Warnings
- (none yet)

## Current State
- Autopilot initialized

## Do Not Change
- (add invariants here)
EOF
fi

# --- Task counting (matches indented tasks too) ---
count_remaining() {
  grep -cE '^\s*-\s*\[ \]' "$TASKS_FILE" 2>/dev/null || echo 0
}

count_done() {
  grep -cE '^\s*-\s*\[x\]' "$TASKS_FILE" 2>/dev/null || echo 0
}

# --- Detect test command ---
detect_test_command() {
  if [ -n "$TEST_COMMAND" ]; then
    echo "$TEST_COMMAND"
    return
  fi

  # Auto-detect based on project files
  if [ -f "$PROJECT_DIR/package.json" ]; then
    echo "npm test"
  elif [ -f "$PROJECT_DIR/composer.json" ]; then
    echo "composer test"
  elif [ -f "$PROJECT_DIR/pytest.ini" ] || [ -f "$PROJECT_DIR/pyproject.toml" ]; then
    echo "pytest"
  elif [ -f "$PROJECT_DIR/Cargo.toml" ]; then
    echo "cargo test"
  elif [ -f "$PROJECT_DIR/go.mod" ]; then
    echo "go test ./..."
  else
    echo ""
  fi
}

DETECTED_TEST_CMD=$(detect_test_command)

# --- Build prompt ---
build_prompt() {
  local test_instruction=""
  local commit_instruction=""

  if [ "$REQUIRE_TESTS" = "true" ] && [ -n "$DETECTED_TEST_CMD" ]; then
    test_instruction="- After making changes, run tests: $DETECTED_TEST_CMD
- Only mark the task complete if tests PASS
- If tests fail, fix the issue or mark task as '- [?]' with explanation"
  fi

  if [ "$AUTO_COMMIT" = "true" ]; then
    commit_instruction="- Commit your work with a conventional commit message (e.g., feat:, fix:, chore:)."
  fi

  cat << PROMPT
You are running in autopilot mode inside a project directory.

READ these files first:
1. TASKS.md - the full task checklist
2. HANDOFF.md - context from the previous session
3. CLAUDE.md - project governance (if it exists)

YOUR JOB:
- Complete the NEXT UNCHECKED task (marked with '- [ ]')
- Do the actual work: write code, create files, run commands, install deps
$test_instruction
- Mark that task complete in TASKS.md (change '- [ ]' to '- [x]')
- Update HANDOFF.md:
  - "## Last Completed" - what you just did
  - "## Key Decisions" - append any new decisions (don't remove old ones)
  - "## Warnings" - anything the next session needs to know
  - "## Current State" - current project status
- Do NOT modify the "## Do Not Change" section in HANDOFF.md
- Complete ONLY ONE task, then stop
- If a task is blocked or unclear, mark it '- [?]' with a note, then do the next task
$commit_instruction

RULES:
- Make reasonable decisions and document them - do NOT ask questions
- Follow existing code patterns and conventions in the project
- If CLAUDE.md exists, follow its rules
- Keep changes focused on the current task only
- Prefer small, incremental changes over large rewrites
PROMPT
}

# --- Check changed files limit ---
check_changed_files() {
  local changed
  changed=$(git -C "$PROJECT_DIR" diff --name-only 2>/dev/null | wc -l)
  if [ "$changed" -gt "$MAX_CHANGED_FILES" ]; then
    log "WARNING: $changed files changed (limit: $MAX_CHANGED_FILES)"
    log "Pausing for review. Remove .autopilot-pause to continue."
    touch "$PAUSE_FILE"
    return 1
  fi
  return 0
}

# --- Create checkpoint ---
create_checkpoint() {
  local iteration=$1
  git -C "$PROJECT_DIR" tag -f "autopilot-checkpoint-$iteration" 2>/dev/null || true
}

# --- Main loop ---
ITERATION=0
FAILURES=0

log "========================================="
log "AUTOPILOT STARTING (PID $$)"
log "Project: $PROJECT_DIR"
log "Branch: ${CURRENT_BRANCH:-detached}"
log "Remaining: $(count_remaining) | Done: $(count_done)"
log "Max iterations: $MAX_ITERATIONS | Cooldown: ${COOLDOWN}s | Timeout: ${SESSION_TIMEOUT}s"
if [ -n "$DETECTED_TEST_CMD" ]; then
  log "Test command: $DETECTED_TEST_CMD"
fi
log "========================================="

while [ "$(count_remaining)" -gt 0 ] && [ "$ITERATION" -lt "$MAX_ITERATIONS" ]; do
  # Check for pause file
  if [ -f "$PAUSE_FILE" ]; then
    log "PAUSED: .autopilot-pause file detected"
    log "Remove the file to resume: rm .autopilot-pause"
    sleep 10
    continue
  fi

  ITERATION=$((ITERATION + 1))
  REMAINING=$(count_remaining)
  DONE=$(count_done)
  SESSION_LOG="$LOG_DIR/session_${ITERATION}_$(date +%H%M%S).log"

  log ""
  log "--- Session $ITERATION | Done: $DONE | Remaining: $REMAINING ---"

  # Create checkpoint before starting
  create_checkpoint "$ITERATION"

  # Next task preview (for log readability only - not passed to claude)
  NEXT_TASK=$(grep -m1 -E '^\s*-\s*\[ \]' "$TASKS_FILE" | sed 's/^\s*- \[ \] //' || echo "unknown")
  log "Next: $NEXT_TASK"

  # Run session with timeout
  PROMPT=$(build_prompt)
  cd "$PROJECT_DIR"

  if timeout "$SESSION_TIMEOUT" claude -p "$PROMPT" > "$SESSION_LOG" 2>&1; then
    log "+ Session $ITERATION completed"
    FAILURES=0

    # Check changed files limit
    check_changed_files || true
  else
    EXIT_CODE=$?
    FAILURES=$((FAILURES + 1))

    if [ "$EXIT_CODE" -eq 124 ]; then
      log "x Session $ITERATION TIMED OUT after ${SESSION_TIMEOUT}s (streak: $FAILURES)"
    else
      log "x Session $ITERATION FAILED (exit: $EXIT_CODE, streak: $FAILURES)"
    fi

    if [ "$FAILURES" -ge "$MAX_RETRIES" ]; then
      log "ERROR: $MAX_RETRIES consecutive failures. Stopping."
      log "Last log: $SESSION_LOG"
      break
    fi
  fi

  # Periodic log rotation
  if [ $((ITERATION % 10)) -eq 0 ]; then
    rotate_logs
  fi

  sleep "$COOLDOWN"
done

# --- Summary ---
log ""
log "========================================="
log "AUTOPILOT COMPLETE"
log "Sessions: $ITERATION | Done: $(count_done) | Remaining: $(count_remaining)"
log "Logs: $LOG_DIR"
log "Checkpoints: git tag -l 'autopilot-checkpoint-*'"
log "========================================="
