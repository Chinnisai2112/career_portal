@echo off
cd /d "%~dp0"
echo Starting Career Portal frontend...
call npm start
if errorlevel 1 pause
