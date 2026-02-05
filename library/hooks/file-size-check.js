#!/usr/bin/env node
/**
 * PreToolUse Hook: File Size Check
 *
 * Warns when creating or editing large files that might bloat the repo.
 *
 * Add to settings.json:
 *
 * {
 *   "hooks": {
 *     "PreToolUse": [{
 *       "type": "command",
 *       "command": "node .claude/hooks/file-size-check.js",
 *       "filter": { "tool": ["Write"] }
 *     }]
 *   }
 * }
 */

const path = require('path');

// Configuration
const MAX_FILE_SIZE_KB = 100; // Warn if file content exceeds this
const BLOCK_SIZE_KB = 500;    // Block if file exceeds this

// Files that are expected to be large (don't warn)
const LARGE_FILE_EXCEPTIONS = [
    /package-lock\.json$/,
    /yarn\.lock$/,
    /composer\.lock$/,
    /\.min\.js$/,
    /\.min\.css$/,
    /vendor\//,
    /node_modules\//
];

// Read tool input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    try {
        const toolUse = JSON.parse(input);
        const filePath = toolUse.tool_input?.file_path;
        const content = toolUse.tool_input?.content;

        if (!filePath || !content) {
            process.exit(0);
        }

        // Check if file is in exceptions list
        const isException = LARGE_FILE_EXCEPTIONS.some(pattern => pattern.test(filePath));
        if (isException) {
            process.exit(0);
        }

        // Calculate size
        const sizeBytes = Buffer.byteLength(content, 'utf8');
        const sizeKB = sizeBytes / 1024;

        if (sizeKB > BLOCK_SIZE_KB) {
            console.error(`BLOCKED: File too large (${sizeKB.toFixed(1)}KB)`);
            console.error(`Maximum allowed: ${BLOCK_SIZE_KB}KB`);
            console.error(`File: ${filePath}`);
            console.error('\nConsider:');
            console.error('- Splitting into multiple files');
            console.error('- Moving to external storage');
            console.error('- Adding to .gitignore if temporary');

            console.log(JSON.stringify({
                decision: 'block',
                reason: `File exceeds ${BLOCK_SIZE_KB}KB limit`
            }));

            process.exit(1);
        }

        if (sizeKB > MAX_FILE_SIZE_KB) {
            console.error(`\nWARNING: Large file (${sizeKB.toFixed(1)}KB)`);
            console.error(`File: ${filePath}`);
            console.error('Consider if this file needs to be this large.\n');
        }

        process.exit(0);

    } catch (e) {
        process.exit(0);
    }
});
