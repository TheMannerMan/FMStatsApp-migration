@echo off
setlocal

set "ROOT=%~dp0"

start "FMStats API" powershell -NoProfile -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%ROOT%'; dotnet run --project .\FMStatsApp.Api"
start "FMStats Angular" powershell -NoProfile -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%ROOT%fm-stats-angular'; npm start"

timeout /t 5 /nobreak >nul
start "" "http://localhost:4200"
