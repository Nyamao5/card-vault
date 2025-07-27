# Card Vault - Flask Deployment Guide

## 🚀 Flask Integration Complete

Your Card Vault application has been successfully integrated with Flask for easy deployment!

## 📁 New Files Added

- **`app.py`** - Main Flask application
- **`requirements.txt`** - Python dependencies
- **`Procfile`** - Heroku deployment configuration
- **`config.py`** - Environment configurations
- **`.env`** - Environment variables template
- **`.gitignore`** - Git ignore patterns

## 🛠️ Local Development Setup

### 1. Install Python Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Run the Application

```bash
# Method 1: Direct Python
python app.py

# Method 2: Using Flask CLI
flask run

# Method 3: With custom port
python app.py
# or
flask run --port 8000
```

### 3. Access Your Application

- **Local Development**: http://127.0.0.1:5000
- **Health Check**: http://127.0.0.1:5000/health
- **API Status**: http://127.0.0.1:5000/api/status

## 🌐 Deployment Options

### Option 1: Heroku Deployment

```bash
# Install Heroku CLI first
# Then:

# Login to Heroku
heroku login

# Create app
heroku create your-card-vault-app

# Set environment variables
heroku config:set SECRET_KEY=your-production-secret-key
heroku config:set FLASK_ENV=production

# Deploy
git add .
git commit -m "Add Flask integration"
git push heroku main

# Open app
heroku open
```

### Option 2: Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Option 3: Railway Deployment

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy automatically

### Option 4: PythonAnywhere

1. Upload files to PythonAnywhere
2. Configure WSGI file
3. Set up virtual environment

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key | `dev-secret-key` |
| `FLASK_ENV` | Environment | `development` |
| `FLASK_DEBUG` | Debug mode | `True` |
| `HOST` | Server host | `127.0.0.1` |
| `PORT` | Server port | `5000` |

### Production Checklist

- [ ] Set strong `SECRET_KEY`
- [ ] Set `FLASK_ENV=production`
- [ ] Set `FLASK_DEBUG=False`
- [ ] Configure HTTPS
- [ ] Set up monitoring
- [ ] Configure backups (if needed)

## 🔍 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main application |
| `/health` | GET | Health check |
| `/api/status` | GET | API status |
| `/static/<file>` | GET | Static files |

## 🛡️ Security Features

- **Client-side encryption**: All card data encrypted in browser
- **No server storage**: No sensitive data stored on server
- **Secure headers**: Security headers configured
- **HTTPS ready**: Production-ready security settings

## 📊 Monitoring

The Flask app includes:
- Health check endpoint (`/health`)
- Logging configuration
- Error handling
- API status monitoring

## 🔄 Development Workflow

1. **Local Development**:
   ```bash
   python app.py
   ```

2. **Testing**:
   ```bash
   # Test health endpoint
   curl http://localhost:5000/health
   ```

3. **Deployment**:
   ```bash
   git add .
   git commit -m "Update"
   git push heroku main
   ```

## 📝 Notes

- The Flask app serves your existing HTML/CSS/JS files
- All encryption remains client-side
- No database required - app uses browser storage
- Production-ready with gunicorn server
- CORS enabled for API calls

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   python app.py
   # Try different port:
   PORT=8000 python app.py
   ```

2. **Module not found**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Permission errors**:
   ```bash
   # Activate virtual environment first
   venv\Scripts\activate
   ```

## 🚀 Quick Deploy Commands

```bash
# Quick Heroku deploy
heroku create your-app-name
git add .
git commit -m "Flask deployment"
git push heroku main

# Quick local run
pip install -r requirements.txt
python app.py
```

Your Card Vault is now Flask-ready and deployment-ready! 🎉
