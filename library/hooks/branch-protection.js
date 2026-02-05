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

const readline = require('readline');

async function main() {
    // Read stdin
    const rl = readline.createInterface({ input: process.stdin });
    let input = '';

    for await (const line of rl) {
        input += line;
    }

    const event = JSON.parse(input);
    // Claude Code uses snake_case for hook event properties
    const command = event.tool_input?.command || '';

    // Check for dangerous git commands on protected branches
    const protectedBranches = ['main', 'master', 'production'];
    const dangerousPatterns = [
        /git\s+push\s+.*--force/i,
        /git\s+push\s+-f/i,
        /git\s+reset\s+--hard/i,
        /git\s+checkout\s+\./i,
        /git\s+clean\s+-f/i,
    ];

    // Check if on protected branch
    const { execSync } = require('child_process');
    let currentBranch;
    try {
        currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch {
        // Not in a git repo, allow
        process.stdout.write('{}');
        process.exit(0);
    }

    const isProtectedBranch = protectedBranches.includes(currentBranch);

    // Block force push to protected branches
    for (const pattern of dangerousPatterns) {
        if (pattern.test(command) && isProtectedBranch) {
            // Exit 2 blocks the operation; stderr message is shown to Claude
            console.error(`Blocked: Dangerous operation on protected branch '${currentBranch}'.\n` +
                         `Create a feature branch instead: git checkout -b feature/your-feature`);
            process.exit(2);
        }
    }

    // Block direct push to main without PR
    if (/git\s+push\s+origin\s+(main|master)/.test(command)) {
        console.error(`Blocked: Direct push to '${currentBranch}' not allowed.\n` +
                     `Create a PR instead: gh pr create`);
        process.exit(2);
    }

    // Allow all other commands
    process.stdout.write('{}');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
