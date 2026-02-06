#!/usr/bin/env node
/**
 * PreToolUse Hook: Commit Message Check
 *
 * Validates git commit messages follow conventional commit format.
 * Blocks commits with invalid messages.
 *
 * Add to settings.json:
 *
 * {
 *   "hooks": {
 *     "PreToolUse": [{
 *       "type": "command",
 *       "command": "node .claude/hooks/commit-message-check.js",
 *       "filter": { "tool": "Bash" }
 *     }]
 *   }
 * }
 */

// Conventional commit pattern
// type(scope)?: subject
const CONVENTIONAL_COMMIT_PATTERN = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,72}/;

// Patterns that indicate a commit command
const COMMIT_PATTERNS = [
    /git\s+commit\s+/i,
    /git\s+commit$/i
];

// Extract commit message from command
function extractCommitMessage(command) {
    // Match -m "message" or -m 'message'
    const shortMatch = command.match(/-m\s+["']([^"']+)["']/);
    if (shortMatch) return shortMatch[1];

    // Match -m followed by unquoted word (less common)
    const unquotedMatch = command.match(/-m\s+(\S+)/);
    if (unquotedMatch && !unquotedMatch[1].startsWith('-')) {
        return unquotedMatch[1];
    }

    // Match HEREDOC pattern: -m "$(cat <<'EOF' ... EOF)"
    const heredocMatch = command.match(/-m\s+"\$\(cat <<['"]?EOF['"]?\s*([\s\S]*?)\s*EOF\s*\)"/);
    if (heredocMatch) {
        // Get first line of HEREDOC content
        return heredocMatch[1].split('\n')[0].trim();
    }

    return null;
}

// Read tool input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    try {
        const toolUse = JSON.parse(input);
        const command = toolUse.tool_input?.command;

        if (!command) {
            process.exit(0); // No command, allow
        }

        // Check if this is a commit command
        const isCommit = COMMIT_PATTERNS.some(pattern => pattern.test(command));
        if (!isCommit) {
            process.exit(0); // Not a commit, allow
        }

        // Extract commit message
        const message = extractCommitMessage(command);

        if (!message) {
            // Can't extract message - might be interactive or --amend
            // Allow but warn
            console.log('Note: Could not verify commit message format');
            process.exit(0);
        }

        // Validate against conventional commit pattern
        if (CONVENTIONAL_COMMIT_PATTERN.test(message)) {
            process.exit(0); // Valid format
        }

        // Invalid format - block the commit
        // Exit 2 blocks the operation; stderr message is shown to Claude
        console.error('BLOCKED: Commit message does not follow conventional commit format.\n');
        console.error('Expected format: type(scope)?: subject');
        console.error('Examples:');
        console.error('  feat: add user authentication');
        console.error('  fix(api): correct pagination offset');
        console.error('  docs: update README with installation steps');
        console.error('\nValid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert');
        console.error(`\nReceived: "${message}"`);

        process.exit(2);

    } catch (e) {
        // Parse error - allow the operation
        process.exit(0);
    }
});
