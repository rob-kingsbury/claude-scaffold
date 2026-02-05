#!/usr/bin/env node
/**
 * PreToolUse Hook: TypeScript Type Check
 *
 * Runs TypeScript type checking before allowing edits to .ts/.tsx files.
 * Advisory only - warns but doesn't block.
 *
 * Add to settings.json:
 *
 * {
 *   "hooks": {
 *     "PreToolUse": [{
 *       "type": "command",
 *       "command": "node .claude/hooks/type-check.js",
 *       "filter": { "tool": ["Edit", "Write"] }
 *     }]
 *   }
 * }
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
    // File extensions to check
    extensions: ['.ts', '.tsx'],
    // Max time to wait for tsc (ms)
    timeout: 30000,
    // Skip if these paths are in the file
    skipPaths: ['node_modules', '.d.ts', 'dist/', 'build/'],
    // Block on errors (false = advisory only)
    blockOnError: false
};

// Find tsconfig.json by walking up from file
function findTsConfig(filePath) {
    let dir = path.dirname(filePath);
    const root = path.parse(dir).root;

    while (dir !== root) {
        const tsconfig = path.join(dir, 'tsconfig.json');
        if (fs.existsSync(tsconfig)) {
            return { configPath: tsconfig, projectRoot: dir };
        }
        dir = path.dirname(dir);
    }

    return null;
}

// Check if tsc is available
function hasTsc(projectRoot) {
    const localTsc = path.join(projectRoot, 'node_modules', '.bin', 'tsc');
    if (fs.existsSync(localTsc) || fs.existsSync(localTsc + '.cmd')) {
        return localTsc;
    }

    // Check global
    try {
        execSync('tsc --version', { stdio: 'ignore', timeout: 5000 });
        return 'tsc';
    } catch {
        return null;
    }
}

// Run type check
function runTypeCheck(tscPath, projectRoot) {
    try {
        execSync(`"${tscPath}" --noEmit --pretty`, {
            cwd: projectRoot,
            stdio: 'pipe',
            timeout: CONFIG.timeout,
            encoding: 'utf8'
        });
        return { success: true, errors: [] };
    } catch (e) {
        // tsc exits with non-zero on type errors
        const output = e.stdout || e.stderr || '';
        const errors = parseTypeErrors(output);
        return { success: false, errors };
    }
}

// Parse tsc output into structured errors
function parseTypeErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    const errorPattern = /^(.+)\((\d+),(\d+)\): error (TS\d+): (.+)$/;

    for (const line of lines) {
        const match = line.match(errorPattern);
        if (match) {
            errors.push({
                file: match[1],
                line: parseInt(match[2]),
                column: parseInt(match[3]),
                code: match[4],
                message: match[5]
            });
        }
    }

    return errors;
}

// Format errors for display
function formatErrors(errors, maxShow = 5) {
    if (errors.length === 0) return '';

    let output = errors.slice(0, maxShow).map(e =>
        `  ${path.basename(e.file)}:${e.line} - ${e.code}: ${e.message}`
    ).join('\n');

    if (errors.length > maxShow) {
        output += `\n  ...and ${errors.length - maxShow} more errors`;
    }

    return output;
}

// Read tool input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    try {
        const toolUse = JSON.parse(input);
        const filePath = toolUse.tool_input?.file_path;

        if (!filePath) {
            process.stdout.write('{}');
            process.exit(0);
        }

        // Check if it's a TypeScript file
        const ext = path.extname(filePath).toLowerCase();
        if (!CONFIG.extensions.includes(ext)) {
            process.stdout.write('{}');
            process.exit(0);
        }

        // Check if in skip paths
        const shouldSkip = CONFIG.skipPaths.some(p => filePath.includes(p));
        if (shouldSkip) {
            process.stdout.write('{}');
            process.exit(0);
        }

        // Find tsconfig
        const tsInfo = findTsConfig(filePath);
        if (!tsInfo) {
            // No tsconfig found, skip check
            process.stdout.write('{}');
            process.exit(0);
        }

        // Check for tsc
        const tscPath = hasTsc(tsInfo.projectRoot);
        if (!tscPath) {
            console.error('\nTypeScript check skipped: tsc not found');
            console.error('Install with: npm install typescript --save-dev\n');
            process.stdout.write('{}');
            process.exit(0);
        }

        // Run type check
        const result = runTypeCheck(tscPath, tsInfo.projectRoot);

        if (!result.success && result.errors.length > 0) {
            console.error(`\n=== TYPE CHECK: ${result.errors.length} error(s) ===\n`);
            console.error(formatErrors(result.errors));
            console.error('\nFix type errors before editing, or they may compound.\n');

            if (CONFIG.blockOnError) {
                // Exit 2 blocks the operation
                process.exit(2);
            }
        }

        // Allow the operation (advisory only by default)
        process.stdout.write('{}');
        process.exit(0);

    } catch (e) {
        // On any error, allow the operation
        process.stdout.write('{}');
        process.exit(0);
    }
});
