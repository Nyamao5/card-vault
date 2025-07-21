// Card Vault - Secure Client-Side Card Storage Application
// Uses AES-256 encryption via CryptoJS

class CardVault {
    constructor() {
        // Generate a secure random key for encryption (in production, this should be derived from user input)
        this.secretKey = this.generateSecureKey();
        this.storageKey = 'cardVault_encryptedCards';
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.cloudStorage = null;
        
        this.init();
    }

    // Generate a secure random key
    generateSecureKey() {
        // In a real application, this should be derived from user password/PIN
        // For demo purposes, we'll use a random key stored in sessionStorage
        let key = sessionStorage.getItem('cardVault_key');
        if (!key) {
            key = CryptoJS.lib.WordArray.random(256/8).toString();
            sessionStorage.setItem('cardVault_key', key);
            this.logToConsole('Generated new encryption key for session', 'info');
        }
        return key;
    }

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.setupDarkMode();
        this.setupCloudStorage();
        this.updateCardCount();
        this.logToConsole('Card Vault initialized successfully', 'success');
        this.logToConsole(`Encryption Key: ${this.secretKey.substring(0, 8)}...`, 'info');
    }

    // Setup cloud storage integration
    setupCloudStorage() {
        // Wait for cloudStorageManager to be available
        if (typeof window.cloudStorageManager !== 'undefined') {
            this.cloudStorage = window.cloudStorageManager;
            this.cloudStorage.updateUI();
        } else {
            // Retry after a short delay
            setTimeout(() => this.setupCloudStorage(), 100);
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Form submission
        document.getElementById('cardForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCardSubmission();
        });

        // Clear form button
        document.getElementById('clearForm').addEventListener('click', () => {
            this.clearForm();
        });

        // View all cards button
        document.getElementById('viewAllCards').addEventListener('click', () => {
            this.viewAllCards();
        });

        // Hide cards button
        document.getElementById('hideCards').addEventListener('click', () => {
            this.hideCards();
        });

        // Clear all cards button
        document.getElementById('clearAllCards').addEventListener('click', () => {
            this.clearAllCards();
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Clear console button
        document.getElementById('clearConsole').addEventListener('click', () => {
            this.clearConsole();
        });

        // Storage backend selection
        document.getElementById('storageBackend').addEventListener('change', (e) => {
            this.changeStorageBackend(e.target.value);
        });

        // Input formatting and validation
        this.setupInputFormatting();
    }

    // Setup input formatting for card fields
    setupInputFormatting() {
        const cardNumberInput = document.getElementById('cardNumber');
        const expiryDateInput = document.getElementById('expiryDate');
        const cvvInput = document.getElementById('cvv');
        const cardholderNameInput = document.getElementById('cardholderName');

        // Card number formatting (add spaces every 4 digits)
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
            let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) {
                formattedValue = formattedValue.substring(0, 19);
            }
            e.target.value = formattedValue;
            this.validateCardNumber(value);
        });

        // Expiry date formatting (MM/YY)
        expiryDateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
            this.validateExpiryDate(value);
        });

        // CVV validation
        cvvInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = value;
            this.validateCVV(value);
        });

        // Cardholder name validation
        cardholderNameInput.addEventListener('input', (e) => {
            this.validateCardholderName(e.target.value);
        });
    }

    // Change storage backend
    async changeStorageBackend(backend) {
        try {
            this.logToConsole(`Switching to ${backend} storage...`, 'info');
            
            if (this.cloudStorage) {
                const success = await this.cloudStorage.setBackend(backend);
                
                if (!success && backend !== 'localStorage') {
                    this.showErrorMessage(`Failed to connect to ${backend}. Check configuration.`);
                    // Revert to localStorage
                    document.getElementById('storageBackend').value = 'localStorage';
                    await this.cloudStorage.setBackend('localStorage');
                }
                
                // Show/hide cloud setup info
                const cloudSetupInfo = document.getElementById('cloudSetupInfo');
                if (backend !== 'localStorage') {
                    cloudSetupInfo.classList.remove('hidden');
                } else {
                    cloudSetupInfo.classList.add('hidden');
                }
                
                // Update card count for new backend
                await this.updateCardCount();
            }
        } catch (error) {
            this.logToConsole(`Error changing storage backend: ${error.message}`, 'error');
            this.showErrorMessage('Failed to change storage backend');
        }
    }
    validateCardNumber(cardNumber) {
        const isValid = this.luhnCheck(cardNumber) && cardNumber.length >= 13 && cardNumber.length <= 19;
        this.showFieldValidation('cardNumber', isValid, isValid ? 'Valid card number' : 'Invalid card number');
        return isValid;
    }

    validateExpiryDate(expiryDate) {
        const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        const isValid = regex.test(expiryDate);
        if (isValid) {
            const [month, year] = expiryDate.split('/');
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            const now = new Date();
            const isNotExpired = expiry > now;
            this.showFieldValidation('expiryDate', isNotExpired, isNotExpired ? 'Valid expiry date' : 'Card has expired');
            return isNotExpired;
        }
        this.showFieldValidation('expiryDate', false, 'Invalid date format (MM/YY)');
        return false;
    }

    validateCVV(cvv) {
        const isValid = cvv.length >= 3 && cvv.length <= 4;
        this.showFieldValidation('cvv', isValid, isValid ? 'Valid CVV' : 'CVV must be 3-4 digits');
        return isValid;
    }

    validateCardholderName(name) {
        const isValid = name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
        this.showFieldValidation('cardholderName', isValid, isValid ? 'Valid name' : 'Name must contain only letters');
        return isValid;
    }

    // Luhn algorithm for card number validation
    luhnCheck(cardNumber) {
        let sum = 0;
        let alternate = false;
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let n = parseInt(cardNumber.charAt(i), 10);
            if (alternate) {
                n *= 2;
                if (n > 9) {
                    n = (n % 10) + 1;
                }
            }
            sum += n;
            alternate = !alternate;
        }
        return (sum % 10) === 0;
    }

    // Show field validation status
    showFieldValidation(fieldId, isValid, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = field.parentNode.querySelector('.error-message');
        
        field.classList.remove('error', 'success');
        field.classList.add(isValid ? 'success' : 'error');
        
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.toggle('hidden', isValid);
        }
    }

    // Handle card form submission
    async handleCardSubmission() {
        const formData = this.getFormData();
        
        // Validate all fields
        const isValid = this.validateAllFields(formData);
        
        if (isValid) {
            try {
                this.logToConsole('Starting card encryption process...', 'info');
                
                // Encrypt and save the card
                const encryptedCard = this.encryptCard(formData);
                await this.saveCard(encryptedCard);
                
                // Clear the form and update UI
                this.clearForm();
                await this.updateCardCount();
                this.showSuccessMessage('Card encrypted and saved successfully!');
                
                this.logToConsole('Card encryption and storage completed', 'success');
            } catch (error) {
                this.logToConsole(`Error saving card: ${error.message}`, 'error');
                this.showErrorMessage('Failed to save card');
            }
        } else {
            this.logToConsole('Card validation failed - please check all fields', 'error');
            this.showErrorMessage('Please fix validation errors before saving');
        }
    }

    // Get form data
    getFormData() {
        return {
            cardholderName: document.getElementById('cardholderName').value.trim(),
            cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, ''),
            expiryDate: document.getElementById('expiryDate').value,
            cvv: document.getElementById('cvv').value,
            timestamp: new Date().toISOString(),
            id: this.generateCardId()
        };
    }

    // Generate unique card ID
    generateCardId() {
        return 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Validate all form fields
    validateAllFields(formData) {
        const validations = [
            this.validateCardholderName(formData.cardholderName),
            this.validateCardNumber(formData.cardNumber),
            this.validateExpiryDate(formData.expiryDate),
            this.validateCVV(formData.cvv)
        ];
        
        return validations.every(validation => validation === true);
    }

    // Encrypt card data
    encryptCard(cardData) {
        try {
            this.logToConsole(`Encrypting card data for ${cardData.cardholderName}...`, 'info');
            this.logToConsole(`Original data: ${JSON.stringify(cardData, null, 2)}`, 'data');
            
            const cardDataString = JSON.stringify(cardData);
            const encrypted = CryptoJS.AES.encrypt(cardDataString, this.secretKey).toString();
            
            this.logToConsole(`Encrypted data length: ${encrypted.length} characters`, 'info');
            this.logToConsole(`Encrypted data preview: ${encrypted.substring(0, 50)}...`, 'data');
            
            return {
                id: cardData.id,
                encryptedData: encrypted,
                timestamp: cardData.timestamp,
                cardType: this.detectCardType(cardData.cardNumber),
                lastFour: cardData.cardNumber.slice(-4)
            };
        } catch (error) {
            this.logToConsole(`Encryption error: ${error.message}`, 'error');
            throw error;
        }
    }

    // Detect card type from card number
    detectCardType(cardNumber) {
        if (cardNumber.startsWith('4')) return 'Visa';
        if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) return 'Mastercard';
        if (cardNumber.startsWith('3')) return 'American Express';
        if (cardNumber.startsWith('6')) return 'Discover';
        return 'Unknown';
    }

    // Save encrypted card to current storage backend
    async saveCard(encryptedCard) {
        try {
            if (this.cloudStorage) {
                await this.cloudStorage.saveCard(encryptedCard);
            } else {
                // Fallback to localStorage
                const existingCards = await this.getStoredCards();
                existingCards.push(encryptedCard);
                localStorage.setItem(this.storageKey, JSON.stringify(existingCards));
                this.logToConsole(`Card saved to localStorage (Total cards: ${existingCards.length})`, 'success');
            }
        } catch (error) {
            this.logToConsole(`Storage error: ${error.message}`, 'error');
            throw error;
        }
    }

    // Get stored cards from current storage backend
    async getStoredCards() {
        try {
            if (this.cloudStorage) {
                return await this.cloudStorage.getStoredCards();
            } else {
                // Fallback to localStorage
                const stored = localStorage.getItem(this.storageKey);
                return stored ? JSON.parse(stored) : [];
            }
        } catch (error) {
            this.logToConsole(`Error reading stored cards: ${error.message}`, 'error');
            return [];
        }
    }

    // Decrypt card data
    decryptCard(encryptedCard) {
        try {
            this.logToConsole(`Decrypting card ending in ${encryptedCard.lastFour}...`, 'info');
            
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedCard.encryptedData, this.secretKey);
            const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
            
            if (!decryptedData) {
                throw new Error('Failed to decrypt card data - invalid key or corrupted data');
            }
            
            const cardData = JSON.parse(decryptedData);
            this.logToConsole(`Successfully decrypted card for ${cardData.cardholderName}`, 'success');
            
            return cardData;
        } catch (error) {
            this.logToConsole(`Decryption error: ${error.message}`, 'error');
            throw error;
        }
    }

    // View all stored cards
    async viewAllCards() {
        try {
            const encryptedCards = await this.getStoredCards();
            
            if (encryptedCards.length === 0) {
                this.showErrorMessage('No cards stored yet');
                return;
            }

            this.logToConsole(`Decrypting ${encryptedCards.length} stored cards...`, 'info');
            
            const cardsDisplay = document.getElementById('cardsDisplay');
            cardsDisplay.innerHTML = '';

            encryptedCards.forEach((encryptedCard, index) => {
                try {
                    const cardData = this.decryptCard(encryptedCard);
                    const cardElement = this.createCardElement(cardData, encryptedCard, index);
                    cardsDisplay.appendChild(cardElement);
                } catch (error) {
                    this.logToConsole(`Failed to decrypt card ${index + 1}: ${error.message}`, 'error');
                }
            });

            // Update button visibility
            document.getElementById('viewAllCards').classList.add('hidden');
            document.getElementById('hideCards').classList.remove('hidden');
            
            this.logToConsole('All cards decrypted and displayed', 'success');
        } catch (error) {
            this.logToConsole(`Error viewing cards: ${error.message}`, 'error');
            this.showErrorMessage('Failed to load cards');
        }
    }

    // Create card display element
    createCardElement(cardData, encryptedCard, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-item card-enter mb-4 relative';
        
        const cardTypeIcon = this.getCardTypeIcon(encryptedCard.cardType);
        const maskedCardNumber = this.maskCardNumber(cardData.cardNumber);
        
        cardDiv.innerHTML = `
            <div class="card-type-icon">${cardTypeIcon}</div>
            <div class="mb-2">
                <h4 class="text-lg font-bold">${cardData.cardholderName}</h4>
                <p class="text-sm opacity-75">${encryptedCard.cardType}</p>
            </div>
            <div class="card-number text-xl mb-3">${maskedCardNumber}</div>
            <div class="flex justify-between items-center text-sm">
                <div>
                    <span class="opacity-75">Expires:</span> ${cardData.expiryDate}
                </div>
                <div>
                    <span class="opacity-75">CVV:</span> ${'*'.repeat(cardData.cvv.length)}
                </div>
            </div>
            <div class="flex justify-between items-center mt-4">
                <span class="text-xs opacity-75">Added: ${new Date(cardData.timestamp).toLocaleDateString()}</span>
                <button onclick="cardVault.deleteCard('${encryptedCard.id}')" 
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300">
                    <i class="fas fa-trash mr-1"></i>Delete
                </button>
            </div>
        `;
        
        return cardDiv;
    }

    // Get card type icon
    getCardTypeIcon(cardType) {
        const icons = {
            'Visa': '<i class="fab fa-cc-visa"></i>',
            'Mastercard': '<i class="fab fa-cc-mastercard"></i>',
            'American Express': '<i class="fab fa-cc-amex"></i>',
            'Discover': '<i class="fab fa-cc-discover"></i>',
            'Unknown': '<i class="fas fa-credit-card"></i>'
        };
        return icons[cardType] || icons['Unknown'];
    }

    // Mask card number for display
    maskCardNumber(cardNumber) {
        if (cardNumber.length <= 4) return cardNumber;
        const lastFour = cardNumber.slice(-4);
        const masked = '**** **** **** ' + lastFour;
        return masked;
    }

    // Delete specific card
    async deleteCard(cardId) {
        if (confirm('Are you sure you want to delete this card?')) {
            try {
                if (this.cloudStorage) {
                    await this.cloudStorage.deleteCard(cardId);
                } else {
                    // Fallback to localStorage
                    const cards = await this.getStoredCards();
                    const filteredCards = cards.filter(card => card.id !== cardId);
                    localStorage.setItem(this.storageKey, JSON.stringify(filteredCards));
                }
                
                await this.updateCardCount();
                await this.viewAllCards(); // Refresh the display
                
                this.logToConsole(`Card deleted successfully (ID: ${cardId})`, 'success');
                this.showSuccessMessage('Card deleted successfully');
            } catch (error) {
                this.logToConsole(`Error deleting card: ${error.message}`, 'error');
                this.showErrorMessage('Failed to delete card');
            }
        }
    }

    // Hide cards display
    hideCards() {
        const cardsDisplay = document.getElementById('cardsDisplay');
        cardsDisplay.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                <i class="fas fa-eye-slash text-4xl mb-4 opacity-50"></i>
                <p>Cards are hidden for security</p>
            </div>
        `;
        
        document.getElementById('viewAllCards').classList.remove('hidden');
        document.getElementById('hideCards').classList.add('hidden');
        
        this.logToConsole('Cards hidden from view', 'info');
    }

    // Clear all stored cards
    async clearAllCards() {
        if (confirm('Are you sure you want to delete ALL stored cards? This action cannot be undone.')) {
            try {
                if (this.cloudStorage) {
                    await this.cloudStorage.clearAllCards();
                } else {
                    // Fallback to localStorage
                    localStorage.removeItem(this.storageKey);
                }
                
                await this.updateCardCount();
                this.hideCards();
                
                this.logToConsole('All cards cleared from storage', 'success');
                this.showSuccessMessage('All cards have been deleted');
            } catch (error) {
                this.logToConsole(`Error clearing cards: ${error.message}`, 'error');
                this.showErrorMessage('Failed to clear cards');
            }
        }
    }

    // Clear form
    clearForm() {
        document.getElementById('cardForm').reset();
        
        // Clear validation classes
        const inputs = document.querySelectorAll('#cardForm input');
        inputs.forEach(input => {
            input.classList.remove('error', 'success');
            const errorDiv = input.parentNode.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.classList.add('hidden');
            }
        });
        
        this.logToConsole('Form cleared', 'info');
    }

    // Update card count display
    async updateCardCount() {
        try {
            const cards = await this.getStoredCards();
            document.getElementById('cardCount').textContent = cards.length;
        } catch (error) {
            this.logToConsole(`Error updating card count: ${error.message}`, 'error');
            document.getElementById('cardCount').textContent = '?';
        }
    }

    // Setup dark mode
    setupDarkMode() {
        if (this.darkMode) {
            document.body.classList.add('dark');
            document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun text-xl"></i>';
        }
    }

    // Toggle dark mode
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        document.body.classList.toggle('dark');
        
        const toggleIcon = document.getElementById('darkModeToggle');
        toggleIcon.innerHTML = this.darkMode ? 
            '<i class="fas fa-sun text-xl"></i>' : 
            '<i class="fas fa-moon text-xl"></i>';
        
        localStorage.setItem('darkMode', this.darkMode.toString());
        this.logToConsole(`Dark mode ${this.darkMode ? 'enabled' : 'disabled'}`, 'info');
    }

    // Console logging
    logToConsole(message, type = 'info') {
        const console = document.getElementById('consoleLog');
        const timestamp = new Date().toLocaleTimeString();
        
        const colors = {
            info: 'text-blue-400',
            success: 'text-green-400',
            error: 'text-red-400',
            data: 'text-yellow-400'
        };
        
        const icons = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            data: '📊'
        };
        
        const logEntry = document.createElement('div');
        logEntry.className = `${colors[type]} mb-1`;
        logEntry.innerHTML = `[${timestamp}] ${icons[type]} ${message}`;
        
        console.appendChild(logEntry);
        console.scrollTop = console.scrollHeight;
        
        // Also log to browser console for debugging
        console[type === 'error' ? 'error' : 'log'](`[Card Vault] ${message}`);
    }

    // Clear console
    clearConsole() {
        document.getElementById('consoleLog').innerHTML = `
            <div class="text-gray-500">// Card Vault Console - Encryption/Decryption Logs</div>
            <div class="text-gray-500">// Console cleared at ${new Date().toLocaleTimeString()}</div>
        `;
    }

    // Show success message
    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    // Show error message
    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    // Show notification
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
        notification.className += type === 'success' ? ' bg-green-500 text-white' : ' bg-red-500 text-white';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the Card Vault application
const cardVault = new CardVault();

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                cardVault.logToConsole('Service Worker registered successfully', 'success');
            })
            .catch(error => {
                cardVault.logToConsole(`Service Worker registration failed: ${error}`, 'error');
            });
    });
}
