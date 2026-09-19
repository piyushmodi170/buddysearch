@echo off
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed. Install it from https://nodejs.org then run this file again.
  pause
  exit /b 1
)

if not exist "frontend\node_modules" (
  echo Installing frontend packages...
  cd frontend
  call npm install
  cd ..
)
if not exist "backend\node_modules" (
  echo Installing backend packages...
  cd backend
  call npm install
  cd ..
)

echo Starting BuddySearch. Keep the two new windows open.
echo When they say Ready, open: http://localhost:3000
echo.

start "BuddySearch API" cmd /k "cd /d "%~dp0backend" && npm run dev"
start "BuddySearch Web" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 >nul
start http://localhost:3000
