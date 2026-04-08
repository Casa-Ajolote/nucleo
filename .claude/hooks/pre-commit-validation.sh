#!/usr/bin/env bash
# ============================================================
# Forge — Pre-Commit Validation Hook (PreToolUse)
# ============================================================
# Runs TypeScript typecheck before git commit.
# Blocks commit if typecheck fails.
# Fail-open: any unexpected error approves the action.
# ============================================================

# Fail-open: on any unexpected error, approve
trap 'printf "{\"decision\":\"approve\"}\n"; exit 0' ERR

# Read hook input from stdin
HOOK_INPUT=$(cat)

# Only run on git commit commands
TOOL_NAME=$(echo "$HOOK_INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')
COMMAND=$(echo "$HOOK_INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

# Only intercept git commit commands
if [[ "$TOOL_NAME" != "Bash" ]] || [[ "$COMMAND" != *"git commit"* ]]; then
  printf '{"decision":"approve"}\n'
  exit 0
fi

# Check if tsc is available
if ! command -v npx &>/dev/null; then
  printf '{"decision":"approve"}\n'
  exit 0
fi

# Check if tsconfig exists
if [ ! -f "tsconfig.json" ]; then
  printf '{"decision":"approve"}\n'
  exit 0
fi

# Run typecheck
TSC_OUTPUT=$(npx tsc --noEmit 2>&1) || true
TSC_EXIT=$?

if [ $TSC_EXIT -ne 0 ] && [ -n "$TSC_OUTPUT" ]; then
  # Count errors
  ERROR_COUNT=$(echo "$TSC_OUTPUT" | grep -c "error TS" || true)

  # Truncate output for readability
  SHORT_OUTPUT=$(echo "$TSC_OUTPUT" | head -20)

  printf '{"decision":"block","reason":"TypeScript typecheck failed (%s errors). Fix before committing:\\n%s"}\n' "$ERROR_COUNT" "$SHORT_OUTPUT"
  exit 0
fi

# Typecheck passed
printf '{"decision":"approve"}\n'
