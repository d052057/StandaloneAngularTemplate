#!/usr/bin/env bash
# run.sh - generic. Finds <Name>.Server and <Name>.client by itself.
#   ./run.sh            run API + Angular (no debugger)
#   ./run.sh --debug    same, then attach VS Code to the API
cd "$(dirname "$0")" || exit 1
ROOT="$PWD"
PROFILE="WSL"
API_PORT=5001
NG_PORT=4200
APP_URL="https://localhost:$NG_PORT"
SCALAR_URL="https://localhost:$API_PORT/scalar"
DEBUG=0
[ "${1:-}" = "--debug" ] && DEBUG=1

SERVER_DIR=$(ls -d "$ROOT"/*.Server 2>/dev/null | head -1)
CLIENT_DIR=$(ls -d "$ROOT"/*.client "$ROOT"/*.Client 2>/dev/null | head -1)
if [ ! -d "$SERVER_DIR" ] || [ ! -d "$CLIENT_DIR" ]; then
  echo "Cannot find the *.Server and *.client folders in $ROOT"
  exit 1
fi

# 1. Free the ports
for p in "$NG_PORT" "$API_PORT"; do fuser -k "${p}/tcp" 2>/dev/null || true; done
sleep 1

# Ctrl+C stops everything
trap 'trap - EXIT INT TERM; kill 0' EXIT INT TERM

# 2. API
( cd "$SERVER_DIR" && dotnet run --launch-profile "$PROFILE" ) &

# 3. Wait for the API
echo "Waiting for API on $API_PORT..."
for i in $(seq 1 150); do
  nc -z localhost "$API_PORT" && break
  sleep 2
done
nc -z localhost "$API_PORT" || { echo "API did not start in time"; exit 1; }

# 4. Angular
( cd "$CLIENT_DIR" && ASPNETCORE_URLS="https://localhost:$API_PORT" npm start ) &

# 5. Open the Windows browser: Scalar first, then Angular once it is listening
(
  for i in $(seq 1 90); do
    nc -z localhost "$NG_PORT" && break
    sleep 2
  done
  sleep 2
  wslview "$SCALAR_URL" 2>/dev/null || explorer.exe "$SCALAR_URL" || true
  sleep 1
  wslview "$APP_URL" 2>/dev/null || explorer.exe "$APP_URL" || true
) &

# 6. Debug reminder
if [ "$DEBUG" = "1" ]; then
  echo ""
  echo "=== DEBUG MODE ==="
  echo "API is running. In VS Code press F5 and choose: Attach to API"
  echo "Pick the process named $(basename "$SERVER_DIR")."
  echo "For Angular, use Chrome DevTools (F12) > Sources."
  echo "=================="
fi

wait
