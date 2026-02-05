#!/usr/bin/env node
/**
 * PreToolUse Hook: Lint Check
 *
 * Runs linter on files being edited to catch issues before changes.
 * Add to settings.json:
 *
 * {
 *   "hooks": {
 *     "PreToolUse": [{
 *       "type": "command",
 *       "command": "node .claude/hooks/lint-check.js",
 *       "filter": { "tool": ["Edit", "Write"] }
 *     }]
 *   }
 * }
 */

const { execSync } = require('child_process');
const path = require('path');

// Read tool input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    try {
        const toolUse = JSON.parse(input);
        const filePath = toolUse.tool_input?.file_path;

        if (!filePath) {
            process.exit(0); // No file path, allow
        }

        const ext = path.extname(filePath).toLowerCase();

        // Determine linter based on file type
        let lintCommand = null;

        switch (ext) {
            case '.js':
            case '.jsx':
            case '.ts':
            case '.tsx':
                lintCommand = `npx eslint "${filePath}" --max-warnings 0`;
                break;
            case '.php':
                lintCommand = `php -l "${filePath}"`;
                break;
            case '.py':
                lintCommand = `python -m py_compile "${filePath}"`;
                break;
            case '.css':
            case '.scss':
                lintCommand = `npx stylelint "${filePath}"`;
                break;
        }

        if (!lintCommand) {
            process.exit(0); // No linter for this file type
        }

        // Run lint check
        try {
            execSync(lintCommand, { stdio: 'pipe' });
            // Lint passed - allow the edit
            process.exit(0);
        } catch (lintError) {
            // Lint failed - warn but don't block
            // Change to process.exit(1) to block edits on lint failure
            console.error(`Lint warning for ${filePath}:`);
            console.error(lintError.stdout?.toString() || lintError.message);
            process.exit(0); // Still allow, just warn
        }

    } catch (e) {
        // Parse error - allow the operation
        process.exit(0);
    }
});
