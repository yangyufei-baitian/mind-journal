@echo off
chcp 65001 >nul
cd /d "%~dp0frontend"

echo.
echo ========================================
echo   心灵日记 - 手机测试服务器
echo ========================================
echo.

REM 获取当前 IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    set IP=!IP: =!
    if not "!IP!"=="127.0.0.1" (
        if not "!IP!"=="" (
            echo   手机浏览器打开:
            echo.
            echo   http://!IP!:8888
            echo.
            goto :found
        )
    )
)
:found

echo   按 Ctrl+C 关闭服务器
echo ========================================
echo.

python -m http.server 8888 --bind 0.0.0.0
pause
