#!/usr/bin/env bash
# ============================================================
# Forge — Test Runner Hook (PostToolUse)
# ============================================================
# After file edits, finds and runs related test files.
# Looks for .test.ts/.spec.ts siblings of the edited file.
# Always returns success (never blocks — tests are informational).
# ============================================================

# Fail-open: on any unexpected error, return success
trap 'printf "{}\n"; exit 0' ERR

# Read hook input from stdin
HOOK_INPUT=$(cat)

# Extract tool name and file path
TOOL_NAME=$(echo "$HOOK_INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')
FILE_PATH=$(echo "$HOOK_INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

# Only run on Edit or Write tools
if [[ "$TOOL_NAME" != "Edit" ]] && [[ "$TOOL_NAME" != "Write" ]]; then
  printf '{}\n'
  exit 0
fi

# Skip if no file path
if [ -z "$FILE_PATH" ]; then
  printf '{}\n'
  exit 0
fi

# Only for TypeScript/JavaScript source files
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx)
    # Source file — look for tests
    ;;
  *)
    printf '{}\n'
    exit 0
    ;;
esac

# Skip if file is already a test file
if [[ "$FILE_PATH" == *.test.* ]] || [[ "$FILE_PATH" == *.spec.* ]]; then
  printf '{}\n'
  exit 0
fi

# Derive test file paths
BASE_NAME="${FILE_PATH%.*}"
EXT="${FILE_PATH##*.}"
TEST_FILE="${BASE_NAME}.test.${EXT}"
SPEC_FILE="${BASE_NAME}.spec.${EXT}"

# Find which test file exists
TARGET_TEST=""
if [ -f "$TEST_FILE" ]; then
  TARGET_TEST="$TEST_FILE"
elif [ -f "$SPEC_FILE" ]; then
  TARGET_TEST="$SPEC_FILE"
fi

# No test file found — skip silently
if [ -z "$TARGET_TEST" ]; then
  printf '{}\n'
  exit 0
fi

# Check if vitest is available
if ! npx vitest --version &>/dev/null 2>&1; then
  printf '{}\n'
  exit 0
fi

# Create logs directory
mkdir -p .claude/logs

# Run test and log results (don't block on failure)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
TEST_OUTPUT=$(npx vitest run "$TARGET_TEST" --reporter=verbose 2>&1) || true
TEST_EXIT=$?

# Log results
echo "[$TIMESTAMP] test=$TARGET_TEST exit=$TEST_EXIT" >> .claude/logs/test-runner.log
if [ $TEST_EXIT -ne 0 ]; then
  echo "$TEST_OUTPUT" | tail -20 >> .claude/logs/test-runner.log
  echo "---" >> .claude/logs/test-runner.log
fi

# Always return success — tests are informational, not blocking
printf '{}\n'
