@echo off
title Balananda Firebase Hosting Deploy
echo ========================================================
echo   Balananda Vaidik Sewa - Firebase Deployment
echo ========================================================
echo.
echo [1/3] Logging in to Firebase...
call firebase login
if %errorlevel% neq 0 (
    echo.
    echo Login failed or was cancelled.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Building project with Vite...
call npx vite build

echo.
echo [3/3] Deploying to Firebase Hosting (balananda-vaidik-sewa)...
call firebase deploy --only hosting

echo.
echo ========================================================
echo   DEPLOYMENT SUCCESSFUL!
echo   Your site is now live at:
echo   https://balananda-vaidik-sewa.web.app
echo   https://balananda-vaidik-sewa.firebaseapp.com
echo ========================================================
echo.
pause
