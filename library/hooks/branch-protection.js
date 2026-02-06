#!/usr/bin/env node
/**
 * Branch Protection Hook
 * Prevents direct commits/pushes to main/master branches.
 *
 * Event: PreToolUse
 * Tool: Bash
 *
 * Usage in .claude/settings.json:
 * {
 *   "hooks": {
 *     "PreToolUse": [{
 *       "type": "command",
 *       "command": "node .claude/hooks/branch-protection.js",
 *       "filter": { "tool": "Bash" }
 *     }]
 *   }
 * }
 */

const { readStdin, allowAndExit, blockAndExit } = require('./hook-utils');

const PROTECTED_BRANCHES = ['main', 'master', 'production'];

// Destructive git patterns blocked on protected branches
const DANGEROUS_PATTERNS = [
    /git\s+push\s+.*--force(?!-with-lease)/i,
    /git\s+push\s+-f\b/i,
    /git\s+reset\s+--hard/i,
    /git\s+checkout\s+--?\s*\./i,
    /git\s+clean\s+-f/i,
    /git\s+restore\s+\./i,
    /git\s+branch\s+-D\b/i,
];

/**
 * Extract the target branch from a git push command.
 * Handles: git push origin main, git push -u origin main,
 * git push origin HEAD:main, git push origin HEAD:refs/heads/main,
 * git push --force origin main, git push origin --delete main
 * @param {string} command
 * @returns {string|null} target branch name, or null if not a push to protected branch
 */
function extractPushTarget(command) {
    // Normalize: strip git and push, then parse remaining args
    const pushMatch = command.match(/git\s+push\b(.*)/i);
    if (!pushMatch) return null;

    const argsStr = pushMatch[1].trim();
    // Split on whitespace, ignoring quoted strings
    const args = argsStr.split(/\s+/).filter(a => a.length > 0);

    // Remove known flags to find positional args (remote and refspec)
    const positionalArgs = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        // Skip flags and their values
        if (arg.startsWith('-')) {
            // Flags that take a value: --repo, --push-option, -o, --receive-pack
            if (/^--(repo|push-option|receive-pack)$/.test(arg) || /^-o$/.test(arg)) {
                i++; // skip next arg (the value)
            }
            // Check for --delete (means deleting a remote branch)
            if (/^--delete$/.test(arg)) {
                // Next positional after remote is the branch to delete
                // We treat this as a push to that branch (dangerous)
            }
            continue;
        }
        positionalArgs.push(arg);
    }

    // positionalArgs[0] = remote (e.g., "origin")
    // positionalArgs[1] = refspec (e.g., "main", "HEAD:main", "HEAD:refs/heads/main")
    if (positionalArgs.length < 2) {
        // "git push" with no refspec -- pushes current branch to its upstream
        // "git push origin" with no refspec -- pushes matching branches
        return null;
    }

    const refspec = positionalArgs[1];

    // Handle refspec formats
    // "main" -> target is "main"
    // "HEAD:main" -> target is "main"
    // "HEAD:refs/heads/main" -> target is "main"
    // "+HEAD:main" -> target is "main" (force push via refspec)
    let targetBranch = refspec;
    if (refspec.includes(':')) {
        targetBranch = refspec.split(':').pop();
    }
    // Strip refs/heads/ prefix
    targetBranch = targetBranch.replace(/^\+?refs\/heads\//, '');
    // Strip leading + (force push marker)
    targetBranch = targetBranch.replace(/^\+/, '');

    if (PROTECTED_BRANCHES.includes(targetBranch)) {
        return targetBranch;
    }

    return null;
}

async function main() {
    const event = await readStdin({ failClosed: true });
    const command = event.tool_input?.command || '';

    // Get current branch
    const { execSync } = require('child_process');
    let currentBranch;
    try {
        currentBranch = execSync('git branch --show-current', {
            encoding: 'utf8',
            timeout: 5000
        }).trim();
    } catch {
        allowAndExit();
    }

    const isProtectedBranch = PROTECTED_BRANCHES.includes(currentBranch);

    // Block destructive operations on protected branches
    if (isProtectedBranch) {
        for (const pattern of DANGEROUS_PATTERNS) {
            if (pattern.test(command)) {
                blockAndExit(
                    `Blocked: Dangerous operation on protected branch '${currentBranch}'.\n` +
                    `Create a feature branch instead: git checkout -b feature/your-feature`
                );
            }
        }
    }

    // Block direct push to protected branches (robust parsing)
    const pushTarget = extractPushTarget(command);
    if (pushTarget) {
        blockAndExit(
            `Blocked: Direct push to '${pushTarget}' not allowed.\n` +
            `Create a PR instead: gh pr create`
        );
    }

    // Block remote branch deletion of protected branches
    if (/git\s+push\s+.*--delete/i.test(command)) {
        const args = command.split(/\s+/);
        const deleteIdx = args.findIndex(a => a === '--delete');
        if (deleteIdx >= 0 && deleteIdx + 1 < args.length) {
            const branchToDelete = args[deleteIdx + 1];
            if (PROTECTED_BRANCHES.includes(branchToDelete)) {
                blockAndExit(
                    `Blocked: Cannot delete protected branch '${branchToDelete}' from remote.\n` +
                    `This is a destructive operation that cannot be undone.`
                );
            }
        }
    }

    allowAndExit();
}

main().catch(err => {
    console.error(`branch-protection error: ${err.message}`);
    process.exit(2);
});
