@echo off
REM ============================================================
REM  STORMBLADE - LEADERBOARD RESET  (Picksaw Studio)
REM  Wipes the online leaderboards so you can start a fresh
REM  season after shipping an update.
REM
REM  SETUP (once):
REM    1. Edit the two values below (API_URL and ADMIN_KEY).
REM    2. In Cloudflare: your Worker -> Settings ->
REM       "Variables and Secrets" -> Add variable
REM       Name: ADMIN_KEY   Value: (same secret you put below)
REM       Save and Deploy.
REM
REM  USAGE:
REM    reset-leaderboard.bat            -> clears ALL modes
REM    reset-leaderboard.bat battle     -> clears one mode
REM    reset-leaderboard.bat race
REM    reset-leaderboard.bat rush
REM    reset-leaderboard.bat word
REM    reset-leaderboard.bat all wipe   -> ALSO deletes accounts
REM ============================================================

setlocal

REM ---- EDIT THESE TWO LINES -----------------------------------
set "API_URL=https://curly-hall-ecb2.amirpixie82.workers.dev"
set "ADMIN_KEY=change-me-to-a-long-random-secret"
REM -------------------------------------------------------------

set "MODE=%~1"
if "%MODE%"=="" set "MODE=all"

set "WIPE=false"
if /i "%~2"=="wipe" set "WIPE=true"

echo.
echo  ============================================
echo   STORMBLADE - LEADERBOARD RESET
echo  ============================================
echo   Endpoint : %API_URL%
echo   Mode     : %MODE%
echo   Accounts : %WIPE%
echo.

if "%WIPE%"=="true" (
  echo   WARNING: this DELETES every account,
  echo            including coins and unlocked skins.
  echo.
)

set /p CONFIRM="  Type YES to continue: "
if /i not "%CONFIRM%"=="YES" (
  echo.
  echo   Cancelled. Nothing was changed.
  echo.
  pause
  exit /b 0
)

echo.
echo   Sending reset request...
echo.

curl -s -X POST "%API_URL%/reset" ^
  -H "Content-Type: application/json" ^
  -d "{\"key\":\"%ADMIN_KEY%\",\"mode\":\"%MODE%\",\"wipeAccounts\":%WIPE%}"

echo.
echo.
echo   Done. Reload the game to see the empty board.
echo.
pause
endlocal
