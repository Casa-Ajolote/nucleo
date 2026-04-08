#!/usr/bin/env bash
# ============================================================
# Forge — Auto-Format Hook (PostToolUse)
# ============================================================
# Runs Prettier on edited files after Edit/Write operations.
# Silent skip if Prettier is not installed.
# Always returns success (never blocks).
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

# Skip non-formattable files
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.css|*.json|*.md|*.html|*.yaml|*.yml)
    # Formattable — continue
    ;;
  *)
    printf '{}\n'
    exit 0
    ;;
esac

# Skip if file doesn't exist
if [ ! -f "$FILE_PATH" ]; then
  printf '{}\n'
  exit 0
fi

# Check if prettier is available
if ! npx prettier --version &>/dev/null 2>&1; then
  printf '{}\n'
  exit 0
fi

# Run prettier (suppress all output)
npx prettier --write "$FILE_PATH" &>/dev/null 2>&1 || true

# Always return success
printf '{}\n'
