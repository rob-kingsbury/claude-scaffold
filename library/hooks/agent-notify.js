/**
 * agent-notify.js
 * PostToolUse hook for Task tool completions
 *
 * Features:
 * - Desktop notifications when background agents complete
 * - Persistent history in .claude/agent-history.json
 *
 * Installation:
 * Add to your .claude/settings.json:
 * {
 *   "hooks": {
 *     "PostToolUse": [
 *       {
 *         "matcher": { "toolName": "Task" },
 *         "command": "node path/to/agent-notify.js"
 *       }
 *     ]
 *   }
 * }
 *
 * Or for project-level, add to .claude/settings.local.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read hook input from stdin
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const hookData = JSON.parse(input);
    handleTaskComplete(hookData);
  } catch (e) {
    // Silent fail - hooks should not break the workflow
    process.exit(0);
  }
});

function handleTaskComplete(hookData) {
  const { tool_input, tool_result } = hookData;

  // Only process completed tasks (not launches)
  // Completed tasks have "agentId:" in the result
  if (!tool_result || !tool_result.includes('agentId:')) {
    process.exit(0);
  }

  // Check if this is a background task completion notification
  // vs initial launch (which also has agentId but says "launched")
  if (tool_result.includes('launched successfully')) {
    process.exit(0);
  }

  // Extract agent info
  const agentMatch = tool_result.match(/agentId:\s*(\w+)/);
  const agentId = agentMatch ? agentMatch[1].substring(0, 7) : 'unknown';
  const description = tool_input?.description || 'Background agent';

  // Extract token usage if available
  const tokenMatch = tool_result.match(/total_tokens:\s*(\d+)/);
  const tokens = tokenMatch ? parseInt(tokenMatch[1]) : null;

  // Extract duration if available
  const durationMatch = tool_result.match(/duration_ms:\s*(\d+)/);
  const durationMs = durationMatch ? parseInt(durationMatch[1]) : null;

  // Send desktop notification
  sendNotification(description, agentId);

  // Persist to history
  persistHistory({
    id: agentId,
    description,
    tokens,
    durationMs,
    completedAt: new Date().toISOString()
  });

  process.exit(0);
}

function sendNotification(description, agentId) {
  const title = 'Agent Complete';
  const message = `${description} (${agentId})`;

  try {
    if (process.platform === 'win32') {
      // Windows - try PowerShell toast (BurntToast module)
      // Falls back to msg.exe if BurntToast not available
      try {
        execSync(
          `powershell -Command "New-BurntToastNotification -Text '${title}', '${message.replace(/'/g, "''")}'"`,
          { stdio: 'ignore', timeout: 5000 }
        );
      } catch {
        // Fallback: use PowerShell basic notification
        execSync(
          `powershell -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('${message.replace(/'/g, "''")}', '${title}', 'OK', 'Information')"`,
          { stdio: 'ignore', timeout: 5000 }
        );
      }
    } else if (process.platform === 'darwin') {
      // macOS
      execSync(
        `osascript -e 'display notification "${message}" with title "${title}"'`,
        { stdio: 'ignore', timeout: 5000 }
      );
    } else {
      // Linux - notify-send
      execSync(
        `notify-send "${title}" "${message}"`,
        { stdio: 'ignore', timeout: 5000 }
      );
    }
  } catch (e) {
    // Notification failed - non-critical, continue silently
  }
}

function persistHistory(entry) {
  // Find .claude directory (check cwd and parents)
  let dir = process.cwd();
  let claudeDir = null;

  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, '.claude');
    if (fs.existsSync(candidate)) {
      claudeDir = candidate;
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  if (!claudeDir) {
    // Create .claude in cwd if it doesn't exist
    claudeDir = path.join(process.cwd(), '.claude');
    try {
      fs.mkdirSync(claudeDir, { recursive: true });
    } catch {
      return; // Can't create directory, skip persistence
    }
  }

  const historyPath = path.join(claudeDir, 'agent-history.json');

  // Read existing history
  let history = [];
  try {
    const content = fs.readFileSync(historyPath, 'utf8');
    history = JSON.parse(content);
    if (!Array.isArray(history)) history = [];
  } catch {
    // File doesn't exist or invalid JSON - start fresh
  }

  // Add new entry
  history.push(entry);

  // Keep last 100 entries
  if (history.length > 100) {
    history = history.slice(-100);
  }

  // Write back
  try {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  } catch {
    // Write failed - non-critical
  }
}
