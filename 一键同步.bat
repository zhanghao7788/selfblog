@echo off
cd /d "%~dp0"

REM Add Git to PATH so double-click works
set PATH=D:\APP\Git\cmd;%PATH%

echo 正在同步博客...
echo.

git add .

git diff --cached --quiet
if %errorlevel% equ 0 (
    echo 没有新的改动，直接推送...
) else (
    git commit -m "Update blog"
)

git push

echo.
echo 同步完成！30秒后刷新网页。
pause
