@echo off
REM Card Vault - Quick Run Script

echo.
echo ========================================
echo   Starting Card Vault Flask App
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo ERROR: Virtual environment not found
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Set environment variables
set FLASK_APP=app.py
set FLASK_ENV=development
set FLASK_DEBUG=True

echo Starting Flask application...
echo.
echo ✓ Application will be available at: http://127.0.0.1:5000
echo ✓ Health check: http://127.0.0.1:5000/health
echo ✓ API status: http://127.0.0.1:5000/api/status
echo.
echo Press Ctrl+C to stop the server
echo.

REM Run the application
python app.py
