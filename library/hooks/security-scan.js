#!/usr/bin/env node
/**
 * PreToolUse Hook: Security Scan
 *
 * Scans code for common security issues before allowing edits/writes.
 * Warns about potential security problems without blocking.
 *
 * Add to settings.json:
 *
 * {
 *   "hooks": {
 *     "PreToolUse": [{
 *       "type": "command",
 *       "command": "node .claude/hooks/security-scan.js",
 *       "filter": { "tool": ["Edit", "Write"] }
 *     }]
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

// Security patterns to check
const SECURITY_PATTERNS = [
    {
        name: 'Hardcoded Secret',
        pattern: /(api[_-]?key|secret|password|token|auth)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
        severity: 'HIGH',
        message: 'Possible hardcoded secret detected. Use environment variables instead.'
    },
    {
        name: 'SQL Injection Risk',
        pattern: /query\s*\(\s*['"`].*\$\{.*\}.*['"`]/gi,
        severity: 'HIGH',
        message: 'Possible SQL injection. Use parameterized queries.'
    },
    {
        name: 'eval() Usage',
        pattern: /\beval\s*\(/g,
        severity: 'HIGH',
        message: 'eval() is dangerous. Avoid dynamic code execution.'
    },
    {
        name: 'innerHTML Assignment',
        pattern: /\.innerHTML\s*=/g,
        severity: 'MEDIUM',
        message: 'innerHTML can lead to XSS. Use textContent or sanitize input.'
    },
    {
        name: 'document.write',
        pattern: /document\.write\s*\(/g,
        severity: 'MEDIUM',
        message: 'document.write is dangerous. Use DOM methods instead.'
    },
    {
        name: 'Disabled Security',
        pattern: /(verify\s*[:=]\s*false|rejectUnauthorized\s*[:=]\s*false)/gi,
        severity: 'HIGH',
        message: 'SSL/TLS verification should not be disabled in production.'
    },
    {
        name: 'Exposed .env',
        pattern: /require\s*\(\s*['"]\.env['"]\s*\)/g,
        severity: 'MEDIUM',
        message: 'Direct .env require. Ensure .env is gitignored.'
    },
    {
        name: 'Shell Injection Risk',
        pattern: /exec\s*\(\s*['"`].*\$\{.*\}.*['"`]/gi,
        severity: 'HIGH',
        message: 'Possible shell injection. Sanitize command inputs.'
    },
    {
        name: 'Weak Crypto',
        pattern: /\b(md5|sha1)\s*\(/gi,
        severity: 'MEDIUM',
        message: 'MD5/SHA1 are weak. Use SHA256 or bcrypt for passwords.'
    },
    {
        name: 'Insecure Random',
        pattern: /Math\.random\s*\(\s*\)/g,
        severity: 'LOW',
        message: 'Math.random() is not cryptographically secure. Use crypto.randomBytes() for security-sensitive values.'
    },
    {
        name: 'CORS Wildcard',
        pattern: /Access-Control-Allow-Origin['":\s]+\*/gi,
        severity: 'MEDIUM',
        message: 'CORS wildcard (*) allows any origin. Consider restricting.'
    },
    {
        name: 'Debug Mode',
        pattern: /(DEBUG\s*[:=]\s*true|debug\s*[:=]\s*true)/gi,
        severity: 'LOW',
        message: 'Debug mode should be disabled in production.'
    }
];

// Read tool input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    try {
        const toolUse = JSON.parse(input);
        const filePath = toolUse.tool_input?.file_path;
        const newContent = toolUse.tool_input?.content || toolUse.tool_input?.new_string;

        if (!filePath) {
            process.exit(0);
        }

        // Skip non-code files
        const ext = path.extname(filePath).toLowerCase();
        const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.php', '.py', '.rb', '.java', '.go', '.rs'];
        if (!codeExtensions.includes(ext)) {
            process.exit(0);
        }

        // Get content to scan
        let contentToScan = newContent || '';

        // If editing, also check existing file content
        if (toolUse.tool === 'Edit' && fs.existsSync(filePath)) {
            try {
                contentToScan += '\n' + fs.readFileSync(filePath, 'utf8');
            } catch (e) {
                // Can't read file, just check new content
            }
        }

        if (!contentToScan) {
            process.exit(0);
        }

        // Run security checks
        const findings = [];

        for (const check of SECURITY_PATTERNS) {
            const matches = contentToScan.match(check.pattern);
            if (matches) {
                findings.push({
                    name: check.name,
                    severity: check.severity,
                    message: check.message,
                    count: matches.length
                });
            }
        }

        // Report findings
        if (findings.length > 0) {
            console.error(`\n=== SECURITY SCAN: ${filePath} ===\n`);

            const high = findings.filter(f => f.severity === 'HIGH');
            const medium = findings.filter(f => f.severity === 'MEDIUM');
            const low = findings.filter(f => f.severity === 'LOW');

            if (high.length > 0) {
                console.error('HIGH SEVERITY:');
                high.forEach(f => console.error(`  - ${f.name}: ${f.message}`));
            }

            if (medium.length > 0) {
                console.error('\nMEDIUM SEVERITY:');
                medium.forEach(f => console.error(`  - ${f.name}: ${f.message}`));
            }

            if (low.length > 0) {
                console.error('\nLOW SEVERITY:');
                low.forEach(f => console.error(`  - ${f.name}: ${f.message}`));
            }

            console.error('\n(Security scan is advisory - operation will proceed)\n');
        }

        // Always allow - this is advisory only
        // Change to process.exit(1) to block on HIGH severity
        process.exit(0);

    } catch (e) {
        process.exit(0);
    }
});
