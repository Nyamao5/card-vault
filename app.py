"""
Card Vault - Flask Web Application
A secure client-side credit card storage application with Flask backend
"""

from flask import Flask, render_template, send_from_directory, jsonify, request
from flask_cors import CORS
import os
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, origins=["*"])

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

# Security headers
@app.after_request
def after_request(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

# Static files configuration
@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory('.', filename)

@app.route('/')
def index():
    """Serve the main Card Vault application"""
    try:
        return send_from_directory('.', 'index.html')
    except Exception as e:
        logger.error(f"Error serving index.html: {e}")
        return jsonify({'error': 'Application not found'}), 404

@app.route('/health')
def health_check():
    """Health check endpoint for deployment monitoring"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'service': 'Card Vault'
    })

@app.route('/api/status')
def api_status():
    """API status endpoint"""
    return jsonify({
        'api_status': 'active',
        'encryption': 'AES-256 (client-side)',
        'storage': 'client-side only',
        'security': 'no server-side data storage'
    })

# Serve CSS files
@app.route('/styles.css')
def serve_css():
    """Serve CSS files"""
    return send_from_directory('.', 'styles.css', mimetype='text/css')

# Serve JavaScript files
@app.route('/<path:filename>')
def serve_js_and_files(filename):
    """Serve JavaScript and other static files"""
    if filename.endswith('.js'):
        return send_from_directory('.', filename, mimetype='application/javascript')
    elif filename.endswith('.json'):
        return send_from_directory('.', filename, mimetype='application/json')
    elif filename.endswith('.md'):
        return send_from_directory('.', filename, mimetype='text/markdown')
    elif filename.endswith('.html'):
        return send_from_directory('.', filename, mimetype='text/html')
    else:
        return send_from_directory('.', filename)

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '127.0.0.1')
    
    logger.info(f"Starting Card Vault Flask application on {host}:{port}")
    logger.info(f"Debug mode: {app.config['DEBUG']}")
    
    app.run(
        host=host,
        port=port,
        debug=app.config['DEBUG']
    )
