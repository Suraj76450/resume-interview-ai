@echo off
cd /d "%~dp0"
start "Resume Interview Server" /min py server.py
echo Server starting at http://127.0.0.1:4173
