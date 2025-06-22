@echo off
REM Resolve the directory this script is in
cd /d %~dp0\g4rt-webui-devops\local-desktop

REM Copy .env.example to .env if it doesn't exist
IF NOT EXIST ".env" (
    COPY ".env.example" ".env"
    ECHO ✅ .env created from .env.example
) ELSE (
    ECHO ℹ️ .env already exists
)

REM Set DISPLAY for Docker (Windows uses IP address or host.docker.internal)
set DISPLAY=host.docker.internal:0.0
echo 🔍 DISPLAY is set to: %DISPLAY%

REM Launch docker-compose
docker-compose up