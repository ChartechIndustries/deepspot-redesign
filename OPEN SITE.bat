@echo off
cd /d "%~dp0"
start "DeepSpot server" python serve.py 8765
timeout /t 1 >nul
start "" http://localhost:8765/
