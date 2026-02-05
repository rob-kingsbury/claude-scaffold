#!/bin/bash
# Run Tests Hook
# Runs relevant tests after code changes.
#
# Event: PostToolUse
# Tool: Edit, Write
#
# Usage in .claude/settings.json:
# {
#   "hooks": {
#     "PostToolUse": [{
#       "type": "command",
#       "command": "bash .claude/hooks/run-tests.sh",
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

# Skip if the file itself is a test
if [[ "$FILE" == *test* ]] || [[ "$FILE" == *spec* ]]; then
    exit 0
fi

# Get file extension and name
EXT="${FILE##*.}"
BASENAME=$(basename "$FILE" ".$EXT")
DIR=$(dirname "$FILE")

# Find and run related tests
case "$EXT" in
    js|jsx|ts|tsx)
        # Look for Jest/Vitest test file
        TEST_FILE=""
        for pattern in "${DIR}/${BASENAME}.test.${EXT}" "${DIR}/__tests__/${BASENAME}.test.${EXT}" "tests/${BASENAME}.test.${EXT}"; do
            if [ -f "$pattern" ]; then
                TEST_FILE="$pattern"
                break
            fi
        done

        if [ -n "$TEST_FILE" ]; then
            if [ -f "node_modules/.bin/vitest" ]; then
                npx vitest run "$TEST_FILE" --reporter=dot 2>/dev/null
            elif [ -f "node_modules/.bin/jest" ]; then
                npx jest "$TEST_FILE" --silent 2>/dev/null
            fi

            if [ $? -eq 0 ]; then
                echo '{"feedback": "Tests passed ✓"}'
            else
                echo '{"feedback": "Tests failed ✗"}'
            fi
        fi
        ;;

    php)
        # Look for PHPUnit test file
        TEST_FILE=""
        for pattern in "tests/${BASENAME}Test.php" "${DIR}/${BASENAME}Test.php"; do
            if [ -f "$pattern" ]; then
                TEST_FILE="$pattern"
                break
            fi
        done

        if [ -n "$TEST_FILE" ]; then
            if [ -f "vendor/bin/phpunit" ]; then
                ./vendor/bin/phpunit "$TEST_FILE" --no-coverage 2>/dev/null
            elif [ -f "vendor/bin/pest" ]; then
                ./vendor/bin/pest "$TEST_FILE" --no-coverage 2>/dev/null
            fi

            if [ $? -eq 0 ]; then
                echo '{"feedback": "Tests passed ✓"}'
            else
                echo '{"feedback": "Tests failed ✗"}'
            fi
        fi
        ;;

    py)
        # Look for pytest test file
        TEST_FILE=""
        for pattern in "tests/test_${BASENAME}.py" "${DIR}/test_${BASENAME}.py"; do
            if [ -f "$pattern" ]; then
                TEST_FILE="$pattern"
                break
            fi
        done

        if [ -n "$TEST_FILE" ]; then
            pytest "$TEST_FILE" -q 2>/dev/null

            if [ $? -eq 0 ]; then
                echo '{"feedback": "Tests passed ✓"}'
            else
                echo '{"feedback": "Tests failed ✗"}'
            fi
        fi
        ;;
esac

exit 0
