# Card Vault - Secure Client-Side Card Storage

A secure web application that demonstrates client-side AES encryption for credit card data storage. This application encrypts sensitive card information in the browser and stores it locally, ensuring data is never transmitted or stored unencrypted.

## 🔐 Security Features

- **AES-256 Encryption**: Uses CryptoJS library for robust encryption
- **Client-Side Only**: All encryption/decryption happens in the browser
- **Secure Key Generation**: Random encryption keys generated per session
- **Input Validation**: Comprehensive validation including Luhn algorithm for card numbers
- **No Server Transmission**: Data never leaves your browser

## ✨ Features

### Core Functionality
- **Secure Card Storage**: Encrypt and store credit card information
- **Real-time Validation**: Live validation of card numbers, expiry dates, and CVV
- **Card Type Detection**: Automatically detects Visa, Mastercard, American Express, etc.
- **Encrypted Display**: View stored cards with masked card numbers
- **Individual Deletion**: Remove specific cards from storage
- **Bulk Operations**: Clear all stored cards at once

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Modern UI**: Clean, professional interface with smooth animations
- **Input Formatting**: Automatic formatting for card numbers and expiry dates
- **Visual Feedback**: Color-coded validation and status indicators

### Developer Features
- **Console Logging**: Real-time encryption/decryption process visibility
- **Error Handling**: Comprehensive error catching and user feedback
- **Form Validation**: Multi-layer validation with user-friendly messages
- **localStorage Management**: Efficient local storage with error recovery

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- No server or installation required - runs entirely client-side

### Usage
1. Open `index.html` in your web browser
2. Fill in the card details:
   - **Cardholder Name**: Full name (letters only)
   - **Card Number**: 13-19 digits (automatically validated with Luhn algorithm)
   - **Expiry Date**: MM/YY format
   - **CVV**: 3-4 digit security code
3. Click "Encrypt & Save" to store the card securely
4. Use "Decrypt & View All Cards" to see your stored cards
5. Monitor the console for encryption/decryption details

## 🔧 Technical Implementation

### Encryption Process
```javascript
// Encryption
const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(cardData), secretKey).toString();

// Decryption
const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
const originalData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
```

### File Structure
```
Card Vault/
├── index.html          # Main HTML file with UI structure
├── app.js             # Core JavaScript functionality
├── styles.css         # Custom CSS styling
└── README.md          # This documentation file
```

### Key Components

#### CardVault Class
- **Encryption/Decryption**: AES-256 implementation using CryptoJS
- **Validation**: Luhn algorithm for card numbers, expiry date validation
- **Storage Management**: localStorage operations with error handling
- **UI Management**: Dynamic card display and user interactions

#### Security Features
- **Key Generation**: Secure random key generation per session
- **Data Masking**: Card numbers displayed with asterisks except last 4 digits
- **Input Sanitization**: Removes invalid characters and formats input
- **Error Recovery**: Graceful handling of decryption failures

## 🛡️ Security Considerations

### What's Secure
- **Client-Side Encryption**: Data encrypted before storage
- **No Network Transmission**: Everything happens locally
- **Session-Based Keys**: New encryption key per browser session
- **Input Validation**: Prevents malformed data injection

### Important Notes
- **Demo Application**: This is for educational/demonstration purposes
- **Production Use**: In production, implement additional security measures:
  - User-derived encryption keys (password/PIN based)
  - Secure key storage mechanisms
  - Additional authentication layers
  - Regular security audits

### Browser Storage
- Data stored in localStorage (persists until manually cleared)
- Encryption key stored in sessionStorage (cleared when tab closes)
- No cookies or external storage used

## 🎨 Customization

### Styling
- Built with Tailwind CSS for responsive design
- Custom CSS variables for easy theme modification
- Dark mode implementation with system preference detection

### Functionality Extensions
- Add cloud storage integration (Firebase, Supabase)
- Implement user authentication
- Add export/import functionality
- Create mobile app version

## 🔍 Console Monitoring

The application includes a built-in console that shows:
- Encryption/decryption processes
- Key generation events
- Storage operations
- Validation results
- Error messages

Monitor this console to understand the security operations happening behind the scenes.

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized touch interface
- **Mobile**: Compact, thumb-friendly design

## 🌙 Dark Mode

Toggle between light and dark themes:
- Click the moon/sun icon in the header
- Preference saved to localStorage
- Smooth transition animations

## ⚠️ Disclaimers

1. **Educational Purpose**: This application is designed for learning about client-side encryption
2. **Not Production Ready**: Additional security measures needed for production use
3. **Browser Dependency**: Requires modern browser with JavaScript and Web Crypto API support
4. **Local Storage Only**: Data stored locally - no backup or sync functionality

## 🤝 Contributing

This is a demonstration project. Feel free to:
- Fork and modify for your own learning
- Report issues or suggest improvements
- Extend functionality for your use cases

## 📄 License

This project is open source and available under the MIT License.

---

**Remember**: This is a demonstration of client-side encryption techniques. For production applications handling real financial data, consult with security professionals and implement additional security measures according to industry standards and regulations.
