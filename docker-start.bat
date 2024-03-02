@echo off
set DOCKER_IMAGE=youtubeaudiosaver

echo Check for builded image
docker images %DOCKER_IMAGE% | findstr "%DOCKER_IMAGE%" >nul
if %errorlevel% neq 0 (
    echo %DOCKER_IMAGE% not found. building
    call docker build -t youtubeaudiosaver:1.0 .
)

echo Starting docker-compose
call docker-compose up