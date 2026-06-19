@echo off
setlocal
title Train&Dare - Deploy website

set "GIT=C:\Program Files\Git\cmd\git.exe"
if not exist "%GIT%" set "GIT=git"

cd /d "%~dp0"

echo.
echo ==========================================
echo  Train&Dare - Auto deploy to GitHub
echo ==========================================
echo.
echo This will commit your local changes and push them to GitHub.
echo Netlify and Render will redeploy automatically after the push.
echo.

"%GIT%" status --short --branch
if errorlevel 1 goto git_error

echo.
echo Adding changed files...
"%GIT%" add .
if errorlevel 1 goto git_error

"%GIT%" diff --cached --quiet
if errorlevel 2 goto git_error
if not errorlevel 1 (
  echo.
  echo No changes to deploy.
  goto done
)

set "COMMIT_MESSAGE=Update website"
if not "%~1"=="" set "COMMIT_MESSAGE=%*"

echo.
echo Creating commit: %COMMIT_MESSAGE%
"%GIT%" commit -m "%COMMIT_MESSAGE%"
if errorlevel 1 goto git_error

echo.
echo Pushing to GitHub...
"%GIT%" push
if errorlevel 1 goto git_error

echo.
echo Done. GitHub received the update.
echo Netlify will update the frontend, and Render will update the backend.
goto done

:git_error
echo.
echo Deployment failed. Check the message above.

:done
echo.
pause
