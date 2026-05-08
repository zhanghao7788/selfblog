@echo off
cd /d "%~dp0"
git add .
git commit -m "Update blog"
git push
echo.
echo 同步完成！30秒后刷新网页即可。
pause
