#!/usr/bin/env bash
# ============================================================
#  STORMBLADE - LEADERBOARD RESET  (Picksaw Studio)
#  macOS / Linux version of reset-leaderboard.bat
#
#  SETUP (once):
#    1. Edit API_URL and ADMIN_KEY below.
#    2. In Cloudflare: Worker -> Settings -> Variables and Secrets
#       Add  ADMIN_KEY  with the same secret. Save & Deploy.
#    3. chmod +x reset-leaderboard.sh
#
#  USAGE:
#    ./reset-leaderboard.sh             # clears ALL modes
#    ./reset-leaderboard.sh battle      # one mode
#    ./reset-leaderboard.sh all wipe    # ALSO deletes accounts
# ============================================================

# ---- EDIT THESE TWO LINES ----------------------------------
API_URL="https://curly-hall-ecb2.amirpixie82.workers.dev"
ADMIN_KEY="change-me-to-a-long-random-secret"
# ------------------------------------------------------------

MODE="${1:-all}"
WIPE="false"
[ "${2:-}" = "wipe" ] && WIPE="true"

echo
echo "  ============================================"
echo "   STORMBLADE - LEADERBOARD RESET"
echo "  ============================================"
echo "   Endpoint : $API_URL"
echo "   Mode     : $MODE"
echo "   Accounts : $WIPE"
echo

if [ "$WIPE" = "true" ]; then
  echo "   WARNING: this DELETES every account,"
  echo "            including coins and unlocked skins."
  echo
fi

read -r -p "  Type YES to continue: " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo
  echo "   Cancelled. Nothing was changed."
  exit 0
fi

echo
echo "   Sending reset request..."
echo

curl -s -X POST "$API_URL/reset" \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"$ADMIN_KEY\",\"mode\":\"$MODE\",\"wipeAccounts\":$WIPE}"

echo
echo
echo "   Done. Reload the game to see the empty board."
echo
