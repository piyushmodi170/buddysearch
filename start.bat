@echo off
echo Starting BuddySearch Backend API on port 4000...
start "BuddySearch Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo Starting BuddySearch Frontend App on port 3000...
start "BuddySearch Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers starting!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:4000
echo.
pause
