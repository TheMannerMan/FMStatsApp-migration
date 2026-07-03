#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_PID=""
ANGULAR_PID=""

cleanup() {
  if [[ -n "$API_PID" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
  fi

  if [[ -n "$ANGULAR_PID" ]] && kill -0 "$ANGULAR_PID" 2>/dev/null; then
    kill "$ANGULAR_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

cd "$ROOT"
dotnet run --project ./FMStatsApp.Api &
API_PID=$!

cd "$ROOT/fm-stats-angular"
npm start &
ANGULAR_PID=$!

sleep 5
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:4200" >/dev/null 2>&1 || true
fi

echo "FMStats is starting locally."
echo "Frontend: http://localhost:4200"
echo "API:      http://localhost:5215"
echo "Press Ctrl+C to stop both processes."

wait "$API_PID" "$ANGULAR_PID"
