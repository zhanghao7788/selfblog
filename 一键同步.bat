@echo off
chcp 65001 > nul
cd /d "%~dp0"
set PATH=D:\APP\Git\cmd;%PATH%

echo Syncing blog...
echo.

git add .
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo No changes, pushing only...
) else (
    git commit -m "Update blog"
)
git push

echo.
echo Done! Refresh page in 30s.
pause
