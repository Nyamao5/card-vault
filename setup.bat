@echo off
REM Card Vault - Flask Development Setup Script for Windows

echo.
echo ========================================
echo   Card Vault - Flask Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo ✓ Python found
echo.

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo ✓ Virtual environment created
) else (
    echo ✓ Virtual environment exists
)

echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ✓ Dependencies installed
echo.

REM Set environment variables
set FLASK_APP=app.py
set FLASK_ENV=development
set FLASK_DEBUG=True

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To run the application:
echo   1. Activate venv: venv\Scripts\activate
echo   2. Run app: python app.py
echo.
echo Application will be available at:
echo   http://127.0.0.1:5000
echo.

pause
