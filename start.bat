@echo off
title Train&Dare - Backend + Frontend
echo Demarrage du backend et du frontend...
echo.
start "Backend (port 3001)" cmd /k "cd /d "%~dp0train-dare-backend" && npm run dev"
timeout /t 2 /nobreak >nul
start "Frontend (port 5173)" cmd /k "cd /d "%~dp0train-dare-frontend" && npm run dev"
echo.
echo Backend : http://localhost:3001
echo Frontend : http://localhost:5173
echo.
echo Deux fenetres ouvertes. Fermez-les pour arreter les serveurs.
pause
