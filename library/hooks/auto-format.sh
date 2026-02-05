#!/bin/bash
# Auto-Format Hook
# Runs formatters after code edits.
#
# Event: PostToolUse
# Tool: Edit, Write
#
# Usage in .claude/settings.json:
# {
#   "hooks": {
#     "PostToolUse": [{
#       "type": "command",
#       "command": "bash .claude/hooks/auto-format.sh",
#       "filter": { "tool": ["Edit", "Write"] }
#     }]
#   }
# }

# Read event from stdin
EVENT=$(cat)
FILE=$(echo "$EVENT" | jq -r '.toolInput.file_path // .toolInput.filePath // empty')

if [ -z "$FILE" ]; then
    exit 0
fi

# Get file extension
EXT="${FILE##*.}"

case "$EXT" in
    js|jsx|ts|tsx|json|css|scss|md)
        # Prettier
        if command -v npx &> /dev/null && [ -f "node_modules/.bin/prettier" ]; then
            npx prettier --write "$FILE" 2>/dev/null
            echo '{"feedback": "Formatted with Prettier"}'
        fi
        ;;
    php)
        # PHP CS Fixer or Pint
        if command -v ./vendor/bin/pint &> /dev/null; then
            ./vendor/bin/pint "$FILE" 2>/dev/null
            echo '{"feedback": "Formatted with Pint"}'
        elif command -v ./vendor/bin/php-cs-fixer &> /dev/null; then
            ./vendor/bin/php-cs-fixer fix "$FILE" 2>/dev/null
            echo '{"feedback": "Formatted with PHP CS Fixer"}'
        fi
        ;;
    py)
        # Black
        if command -v black &> /dev/null; then
            black "$FILE" 2>/dev/null
            echo '{"feedback": "Formatted with Black"}'
        fi
        ;;
    go)
        # gofmt
        if command -v gofmt &> /dev/null; then
            gofmt -w "$FILE" 2>/dev/null
            echo '{"feedback": "Formatted with gofmt"}'
        fi
        ;;
    rs)
        # rustfmt
        if command -v rustfmt &> /dev/null; then
            rustfmt "$FILE" 2>/dev/null
            echo '{"feedback": "Formatted with rustfmt"}'
        fi
        ;;
    *)
        # No formatter for this file type
        ;;
esac

exit 0
