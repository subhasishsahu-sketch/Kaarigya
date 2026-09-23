@echo off
echo ============================================
echo   KAARIGYA - Starting Project
echo ============================================
echo.

echo [1/3] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found!
echo.

echo [2/3] Starting Python ML Engine (Backend)...
start cmd /k "cd Backend && conda run -n SIH_Env python ml_api.py"
echo Python ML Engine started in a new window on port 8000.
echo.

echo [3/3] Installing dependencies...
cd /d "%~dp0Frontend"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)

echo.
echo ============================================
echo  Starting Frontend Node server on http://localhost:3001
echo  Open Chrome and go to: http://localhost:3001
echo ============================================
echo.
call npm run dev
pause
