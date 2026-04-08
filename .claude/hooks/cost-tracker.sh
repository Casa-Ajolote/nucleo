#!/usr/bin/env bash
# ============================================================
# Forge — Cost Tracker Hook (PostToolUse)
# ============================================================
# Tracks tool usage per session for cost awareness.
# Appends structured entries to session-costs.log.
# Always returns success (never blocks).
# ============================================================

# Fail-open: on any unexpected error, return success
trap 'printf "{}\n"; exit 0' ERR

# Read hook input from stdin
HOOK_INPUT=$(cat)

# Extract tool name
TOOL_NAME=$(echo "$HOOK_INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')
[ -z "$TOOL_NAME" ] && TOOL_NAME="unknown"

# Create logs directory
mkdir -p .claude/logs

# Session ID: use date-based (one log per day)
SESSION_DATE=$(date '+%Y-%m-%d')
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Append to log
LOG_FILE=".claude/logs/session-costs.log"
echo "[$TIMESTAMP] tool=$TOOL_NAME" >> "$LOG_FILE"

# Every 50 entries, add a summary line
LINE_COUNT=$(wc -l < "$LOG_FILE" 2>/dev/null | tr -d ' ')
if [ "$((LINE_COUNT % 50))" -eq 0 ] && [ "$LINE_COUNT" -gt 0 ]; then
  TOOL_SUMMARY=$(grep "\[$SESSION_DATE" "$LOG_FILE" 2>/dev/null | grep -o 'tool=[^ ]*' | sort | uniq -c | sort -rn | head -5)
  echo "--- Session $SESSION_DATE summary (top 5): $TOOL_SUMMARY ---" >> "$LOG_FILE"
fi

# Always return success
printf '{}\n'
