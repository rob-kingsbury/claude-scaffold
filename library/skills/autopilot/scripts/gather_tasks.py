#!/usr/bin/env python3
"""
Autopilot Task Gatherer
Collects tasks from multiple sources and generates a prioritized TASKS.md

Sources supported:
  - GitHub Issues (via `gh` CLI)
  - HANDOFF.md (warnings, blockers, unfinished work)
  - Roadmap docs (any markdown with checkboxes)
  - Inline TODOs in source code
  - Custom task files

Security notes:
  - No shell=True in subprocess calls (prevents shell injection)
  - All file writes use atomic temp-file + rename pattern
  - GitHub label inputs are sanitized before use
  - File paths are resolved and validated against project root
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

# --- Defaults ---

DEFAULT_CONFIG = {
    "sources": {
        "github_issues": {
            "enabled": True,
            "labels": ["autopilot", "ready"],
            "exclude_labels": ["blocked", "wontfix"],
            "max": 20,
        },
        "handoff": {"enabled": True},
        "roadmap": {
            "enabled": True,
            "files": ["ROADMAP.md", ".claude/context.md"],
        },
        "todos": {
            "enabled": True,
            "paths": ["src/", "lib/", "app/"],
            "exclude": ["node_modules/", "vendor/", ".git/", "dist/", "build/"],
            "max": 50,
        },
        "custom": {"enabled": False, "files": []},
    },
    "priority_order": ["github_issues", "handoff", "roadmap", "todos", "custom"],
    "invariants": [],
}

# --- Helpers ---

def load_config(project_dir, config_path=None):
    """Load .autopilot.yml or return defaults."""
    if config_path:
        cfg_file = Path(config_path)
    else:
        cfg_file = Path(project_dir) / ".autopilot.yml"

    if cfg_file.exists():
        if HAS_YAML:
            with open(cfg_file) as f:
                user_cfg = yaml.safe_load(f) or {}
            cfg = DEFAULT_CONFIG.copy()
            cfg["sources"] = DEFAULT_CONFIG["sources"].copy()
            if "sources" in user_cfg:
                for src, vals in user_cfg["sources"].items():
                    if src in cfg["sources"]:
                        cfg["sources"][src] = {**cfg["sources"][src], **vals}
                    else:
                        cfg["sources"][src] = vals
            if "priority_order" in user_cfg:
                cfg["priority_order"] = user_cfg["priority_order"]
            if "invariants" in user_cfg:
                cfg["invariants"] = user_cfg["invariants"]
            if "runner" in user_cfg:
                cfg["runner"] = user_cfg["runner"]
            return cfg
        else:
            print("WARNING: PyYAML not installed. Using defaults.")
            print("  Install with: pip install pyyaml")

    return DEFAULT_CONFIG


def sanitize_label(label):
    """Sanitize a GitHub label to prevent injection."""
    return re.sub(r"[^a-zA-Z0-9\-_ .]", "", str(label).strip())


def validate_path_within_project(filepath, project_dir):
    """Ensure a path resolves within the project directory (path traversal guard)."""
    resolved = Path(project_dir, filepath).resolve()
    project_resolved = Path(project_dir).resolve()
    if not str(resolved).startswith(str(project_resolved)):
        print(f"  ! Path escapes project directory: {filepath}")
        return None
    return resolved


def run_cmd(cmd_list, cwd=None, timeout=30):
    """Run a command as a list (no shell=True). Returns stdout or None."""
    try:
        result = subprocess.run(
            cmd_list,
            capture_output=True,
            text=True,
            cwd=cwd,
            timeout=timeout,
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError) as e:
        print(f"  ! Command failed: {e}")
        return None


def atomic_write(filepath, content):
    """Write file atomically: temp file + rename. Prevents corruption on interrupt."""
    dirpath = os.path.dirname(os.path.abspath(filepath))
    tmp_path = None
    try:
        fd, tmp_path = tempfile.mkstemp(dir=dirpath, suffix=".tmp", prefix=".autopilot_")
        with os.fdopen(fd, "w") as f:
            f.write(content)
        shutil.move(tmp_path, filepath)
    except OSError as e:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise RuntimeError(f"Failed to write {filepath}: {e}") from e


# --- Source: GitHub Issues ---

def gather_github_issues(project_dir, config):
    """Fetch open issues from GitHub using `gh` CLI."""
    tasks = []
    cfg = config["sources"].get("github_issues", {})
    if not cfg.get("enabled", False):
        return tasks

    if not shutil.which("gh"):
        print("  ! `gh` CLI not found - skipping GitHub issues")
        return tasks

    if not run_cmd(["git", "rev-parse", "--is-inside-work-tree"], cwd=project_dir):
        print("  ! Not a git repo - skipping GitHub issues")
        return tasks

    labels = [sanitize_label(l) for l in cfg.get("labels", ["autopilot", "ready"]) if sanitize_label(l)]
    exclude = [sanitize_label(l) for l in cfg.get("exclude_labels", ["blocked", "wontfix"])]
    max_issues = min(int(cfg.get("max", 20)), 100)

    # Build command as list - no shell injection possible
    cmd = [
        "gh", "issue", "list",
        "--state", "open",
        "--limit", str(max_issues),
        "--json", "number,title,labels,body",
    ]
    if labels:
        cmd.extend(["--label", ",".join(labels)])

    result = run_cmd(cmd, cwd=project_dir)

    # If labeled query returns nothing, warn but do NOT silently fetch all issues
    if not result and labels:
        print(f"  ! No issues found with labels: {', '.join(labels)}")
        print(f"    To fetch all issues, set labels: [] in .autopilot.yml")
        return tasks

    if not result:
        print("  ! Could not fetch GitHub issues")
        return tasks

    try:
        issues = json.loads(result)
    except json.JSONDecodeError:
        print("  ! Could not parse GitHub issues response")
        return tasks

    for issue in issues:
        issue_labels = [l.get("name", "") for l in issue.get("labels", [])]

        if any(el in issue_labels for el in exclude):
            continue

        title = issue.get("title", "Untitled")
        number = issue.get("number", "?")
        body = issue.get("body", "")

        context = ""
        if body:
            first_line = body.strip().split("\n")[0][:100]
            if first_line and first_line != title:
                context = f" - {first_line}"

        tasks.append({
            "text": f"{title} (#{number}){context}",
            "source": "GitHub Issues",
            "priority": "critical" if "bug" in issue_labels else "high",
        })

    print(f"  + GitHub Issues: {len(tasks)} tasks")
    return tasks


# --- Source: HANDOFF.md ---

def gather_handoff(project_dir, config):
    """Extract actionable items from HANDOFF.md warnings and incomplete work."""
    tasks = []
    cfg = config["sources"].get("handoff", {})
    if not cfg.get("enabled", False):
        return tasks

    handoff_path = Path(project_dir) / "HANDOFF.md"
    if not handoff_path.exists():
        print("  - HANDOFF.md not found - skipping")
        return tasks

    try:
        content = handoff_path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        print(f"  ! Could not read HANDOFF.md: {e}")
        return tasks

    warnings_match = re.search(
        r"## Warnings\s*\n(.*?)(?=\n## |\Z)", content, re.DOTALL
    )
    if warnings_match:
        for line in warnings_match.group(1).strip().split("\n"):
            line = line.strip().lstrip("- ").strip()
            if line and line != "(none yet)" and not line.startswith("#"):
                tasks.append({
                    "text": f"[HANDOFF WARNING] {line}",
                    "source": "HANDOFF.md",
                    "priority": "high",
                })

    for line in content.split("\n"):
        match = re.match(r"^\s*-\s*\[ \]\s*(.*)", line)
        if match:
            tasks.append({
                "text": match.group(1).strip(),
                "source": "HANDOFF.md",
                "priority": "high",
            })

    print(f"  + HANDOFF.md: {len(tasks)} tasks")
    return tasks


# --- Source: Roadmap Docs ---

def gather_roadmap(project_dir, config):
    """Pull unchecked items from roadmap/planning markdown files."""
    tasks = []
    cfg = config["sources"].get("roadmap", {})
    if not cfg.get("enabled", False):
        return tasks

    files = cfg.get("files", ["ROADMAP.md", ".claude/context.md"])

    for filepath in files:
        full_path = validate_path_within_project(filepath, project_dir)
        if not full_path or not full_path.exists():
            continue

        try:
            content = full_path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue

        current_section = "Roadmap"
        for line in content.split("\n"):
            header_match = re.match(r"^#{1,3}\s+(.*)", line)
            if header_match:
                current_section = header_match.group(1).strip()
                continue

            task_match = re.match(r"^\s*-\s*\[ \]\s*(.*)", line)
            if task_match:
                task_text = task_match.group(1).strip()
                tasks.append({
                    "text": f"{task_text} (from {filepath}: {current_section})",
                    "source": f"Roadmap ({filepath})",
                    "priority": "normal",
                })

    print(f"  + Roadmap docs: {len(tasks)} tasks")
    return tasks


# --- Source: Inline TODOs ---

TODO_EXTENSIONS = [
    "*.ts", "*.tsx", "*.js", "*.jsx", "*.py", "*.php", "*.rb", "*.go", "*.rs",
    "*.java", "*.c", "*.cpp", "*.h", "*.cs", "*.swift", "*.kt",
]

def gather_todos(project_dir, config):
    """Scan source files for TODO, FIXME, HACK comments."""
    tasks = []
    cfg = config["sources"].get("todos", {})
    if not cfg.get("enabled", False):
        return tasks

    search_paths = cfg.get("paths", ["src/", "lib/", "app/"])
    exclude_dirs = cfg.get("exclude", ["node_modules/", "vendor/", ".git/", "dist/", "build/"])
    max_todos = cfg.get("max", 50)

    if not shutil.which("grep"):
        print("  ! grep not available - skipping TODO scan")
        return tasks

    for search_path in search_paths:
        full_path = validate_path_within_project(search_path, project_dir)
        if not full_path or not full_path.exists():
            continue

        # Command as list - no shell injection
        cmd = ["grep", "-rn", "-E", r"(TODO|FIXME|HACK|XXX):", str(full_path)]
        for d in exclude_dirs:
            cmd.extend(["--exclude-dir", d.rstrip("/")])
        for ext in TODO_EXTENSIONS:
            cmd.extend(["--include", ext])

        result = run_cmd(cmd, cwd=project_dir, timeout=15)
        if not result:
            continue

        count = 0
        for line in result.split("\n"):
            if not line.strip() or count >= max_todos:
                break

            parts = line.split(":", 2)
            if len(parts) < 3:
                continue

            filepath_str = parts[0]
            line_num = parts[1]
            content = parts[2].strip()

            for marker in ["TODO:", "FIXME:", "HACK:", "XXX:"]:
                if marker in content:
                    todo_text = content.split(marker, 1)[1].strip().rstrip("*/").strip()
                    rel_path = os.path.relpath(filepath_str, project_dir)
                    tasks.append({
                        "text": f"{marker} {todo_text} ({rel_path}:{line_num})",
                        "source": "Inline TODOs",
                        "priority": "low",
                    })
                    count += 1
                    break

    print(f"  + Inline TODOs: {len(tasks)} tasks")
    return tasks


# --- Source: Custom Files ---

def gather_custom(project_dir, config):
    """Pull unchecked tasks from arbitrary markdown files."""
    tasks = []
    cfg = config["sources"].get("custom", {})
    if not cfg.get("enabled", False):
        return tasks

    files = cfg.get("files", [])

    for filepath in files:
        full_path = validate_path_within_project(filepath, project_dir)
        if not full_path or not full_path.exists():
            continue

        try:
            content = full_path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue

        for line in content.split("\n"):
            task_match = re.match(r"^\s*-\s*\[ \]\s*(.*)", line)
            if task_match:
                tasks.append({
                    "text": task_match.group(1).strip(),
                    "source": f"Custom ({filepath})",
                    "priority": "normal",
                })

    print(f"  + Custom files: {len(tasks)} tasks")
    return tasks


# --- Gatherer Registry ---

GATHERERS = {
    "github_issues": gather_github_issues,
    "handoff": gather_handoff,
    "roadmap": gather_roadmap,
    "todos": gather_todos,
    "custom": gather_custom,
}


# --- Generate TASKS.md ---

PRIORITY_MAP = {
    "critical": "Critical",
    "high": "High Priority",
    "normal": "Normal",
    "low": "Low Priority",
}

PRIORITY_ORDER = ["critical", "high", "normal", "low"]


def generate_tasks_md(all_tasks, existing_tasks_path=None):
    """Generate TASKS.md content, preserving completed tasks."""
    completed = []
    if existing_tasks_path and Path(existing_tasks_path).exists():
        try:
            for line in Path(existing_tasks_path).read_text(encoding="utf-8").split("\n"):
                if re.match(r"^\s*-\s*\[x\]\s*", line):
                    completed.append(line.strip())
        except (OSError, UnicodeDecodeError):
            pass

    # Deduplicate: skip tasks whose text matches a completed one
    completed_texts = set()
    for c in completed:
        match = re.match(r"^\s*-\s*\[x\]\s*(.*)", c)
        if match:
            completed_texts.add(match.group(1).strip().lower())

    filtered_tasks = [
        t for t in all_tasks
        if t["text"].strip().lower() not in completed_texts
    ]

    grouped = {}
    for task in filtered_tasks:
        pri = task.get("priority", "normal")
        grouped.setdefault(pri, []).append(task)

    lines = [
        "# Tasks",
        f"# Auto-generated by Autopilot on {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"# Sources: {', '.join(sorted(set(t['source'] for t in all_tasks)))}",
        "",
    ]

    if completed:
        lines.append("## Completed")
        lines.extend(completed)
        lines.append("")

    for pri in PRIORITY_ORDER:
        tasks = grouped.get(pri, [])
        if not tasks:
            continue

        label = PRIORITY_MAP.get(pri, pri.title())
        sources = sorted(set(t["source"] for t in tasks))
        source_note = f" (from {sources[0]})" if len(sources) == 1 else ""
        lines.append(f"## {label}{source_note}")

        for task in tasks:
            source_tag = f" [{task['source']}]" if not source_note else ""
            lines.append(f"- [ ] {task['text']}{source_tag}")

        lines.append("")

    lines.append("---")
    lines.append("*Format: `- [ ]` = pending, `- [x]` = done, `- [?]` = blocked*")

    return "\n".join(lines)


# --- Main ---

def main():
    parser = argparse.ArgumentParser(description="Gather tasks from multiple sources")
    parser.add_argument("--project-dir", default=".", help="Project root directory")
    parser.add_argument("--output", default="TASKS.md", help="Output file path")
    parser.add_argument("--config", default=None, help="Path to .autopilot.yml")
    parser.add_argument("--dry-run", action="store_true", help="Print without writing")
    parser.add_argument("--source", action="append", help="Only gather from specific source(s)")
    args = parser.parse_args()

    project_dir = os.path.abspath(args.project_dir)
    print(f"Gathering tasks from: {project_dir}\n")

    config = load_config(project_dir, args.config)

    all_tasks = []
    source_order = config.get("priority_order", list(GATHERERS.keys()))

    for source_name in source_order:
        if args.source and source_name not in args.source:
            continue
        gatherer = GATHERERS.get(source_name)
        if gatherer:
            try:
                tasks = gatherer(project_dir, config)
                all_tasks.extend(tasks)
            except Exception as e:
                print(f"  ! Error gathering from {source_name}: {e}")

    if not all_tasks:
        print("\n! No tasks found from any source.")
        print("  - Check that sources are configured in .autopilot.yml")
        print("  - Ensure GitHub issues are labeled correctly")
        print("  - Verify roadmap files exist and have unchecked items")
        sys.exit(0)

    output_path = os.path.join(project_dir, args.output)
    content = generate_tasks_md(all_tasks, existing_tasks_path=output_path)

    print(f"\n{'=' * 50}")
    print(f"Total tasks gathered: {len(all_tasks)}")
    print(f"{'=' * 50}")

    if args.dry_run:
        print(f"\n--- {args.output} (dry run) ---")
        print(content)
    else:
        atomic_write(output_path, content)
        print(f"\n+ Written to {output_path}")


if __name__ == "__main__":
    main()
