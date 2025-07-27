// Fast Card Vault - Simplified Version

class FastCardVault {
    constructor() {
        this.secretKey = 'demo-key-' + Math.random().toString(36);
        this.init();
    }

    init() {
        this.setupEvents();
        this.updateCount();
        this.log('Card Vault ready! 🚀');
    }

    setupEvents() {
        // Form submit
        document.getElementById('cardForm').onsubmit = (e) => {
            e.preventDefault();
            this.saveCard();
        };

        // Buttons
        document.getElementById('clearForm').onclick = () => this.clearForm();
        document.getElementById('viewAllCards').onclick = () => this.viewCards();
        document.getElementById('hideCards').onclick = () => this.hideCards();
        document.getElementById('clearAllCards').onclick = () => this.clearAll();
        document.getElementById('darkModeToggle').onclick = () => this.toggleDark();
        document.getElementById('clearConsole').onclick = () => this.clearLog();        // Storage change with better error handling
        document.getElementById('storageBackend').onchange = async (e) => {
            const selectedBackend = e.target.value;
            this.log(`🔄 Switching to ${selectedBackend} storage...`);
            
            // Show/hide cloud setup info
            const cloudSetupInfo = document.getElementById('cloudSetupInfo');
            if (selectedBackend !== 'localStorage') {
                cloudSetupInfo.classList.remove('hidden');
            } else {
                cloudSetupInfo.classList.add('hidden');
            }
            
            if (window.cloudStorage) {
                try {
                    const success = await window.cloudStorage.setBackend(selectedBackend);
                    if (!success) {
                        // Revert to localStorage if cloud setup fails
                        this.log(`❌ ${selectedBackend} setup failed - reverting to localStorage`);
                        e.target.value = 'localStorage';
                        await window.cloudStorage.setBackend('localStorage');
                        cloudSetupInfo.classList.add('hidden'); // Hide setup info when reverting
                        this.showNotification(`${selectedBackend} connection failed. Check console for details.`, 'error');
                    } else {
                        this.log(`✅ Successfully switched to ${selectedBackend} storage`);
                        if (selectedBackend !== 'localStorage') {
                            this.showNotification(`Connected to ${selectedBackend}!`, 'success');
                        }
                    }
                } catch (error) {
                    this.log(`💥 Error switching to ${selectedBackend}: ${error.message}`);
                    e.target.value = 'localStorage';
                    await window.cloudStorage.setBackend('localStorage');
                    cloudSetupInfo.classList.add('hidden'); // Hide setup info when reverting
                    this.showNotification('Storage connection failed - using localStorage', 'error');
                }
            } else {
                this.log('⚠️ Cloud storage manager not available');
            }
        };

        // Auto-format card number
        document.getElementById('cardNumber').oninput = (e) => {
            let val = e.target.value.replace(/\D/g, '');
            val = val.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = val.substring(0, 19);
        };

        // Auto-format expiry
        document.getElementById('expiryDate').oninput = (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length >= 2) {
                val = val.substring(0, 2) + '/' + val.substring(2, 4);
            }
            e.target.value = val;
        };
    }

    saveCard() {
        const data = {
            name: document.getElementById('cardholderName').value,
            number: document.getElementById('cardNumber').value.replace(/\s/g, ''),
            expiry: document.getElementById('expiryDate').value,
            cvv: document.getElementById('cvv').value,
            id: 'card_' + Date.now(),
            timestamp: new Date().toISOString()
        };

        // Simple validation
        if (!data.name || !data.number || !data.expiry || !data.cvv) {
            alert('Please fill all fields');
            return;
        }

        try {
            // Encrypt
            this.log(`Encrypting card for ${data.name}...`);
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
            
            const cardData = {
                id: data.id,
                encryptedData: encrypted,
                timestamp: data.timestamp,
                cardType: this.getCardType(data.number),
                lastFour: data.number.slice(-4)
            };

            // Save to storage
            if (window.cloudStorage) {
                window.cloudStorage.saveCard(cardData);
            }

            this.log('Card saved successfully! ✅');
            this.clearForm();
            this.updateCount();
            this.showNotification('Card saved!', 'success');
        } catch (error) {
            this.log('Error: ' + error.message);
            alert('Error saving card');
        }
    }

    async viewCards() {
        try {
            const cards = window.cloudStorage ? await window.cloudStorage.getCards() : [];
            
            if (cards.length === 0) {
                alert('No cards stored');
                return;
            }

            this.log(`Decrypting ${cards.length} cards...`);
            
            const display = document.getElementById('cardsDisplay');
            display.innerHTML = '';

            cards.forEach((card, index) => {
                try {
                    // Check if card data exists
                    if (!card || !card.encryptedData) {
                        this.log(`Card ${index + 1}: Missing encrypted data`);
                        return;
                    }

                    const decrypted = CryptoJS.AES.decrypt(card.encryptedData, this.secretKey);
                    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
                    
                    if (!decryptedString) {
                        this.log(`Card ${index + 1}: Failed to decrypt - wrong key or corrupted data`);
                        return;
                    }

                    const data = JSON.parse(decryptedString);
                    
                    const cardDiv = document.createElement('div');
                    cardDiv.className = 'card-item mb-4 relative';
                    
                    // Get card-specific gradient based on card type
                    const gradientClass = this.getCardGradient(card.cardType);
                    cardDiv.style.background = gradientClass;
                    
                    cardDiv.innerHTML = `
                        <div class="flex justify-between items-start mb-3">
                            <h4 class="font-bold text-lg">${data.name || 'Unknown'}</h4>
                            <div class="flex items-center space-x-2">
                                <span class="text-sm opacity-90">${card.cardType || 'Unknown'}</span>
                                ${this.getCardIcon(card.cardType)}
                            </div>
                        </div>
                        <div class="font-mono text-xl mb-4 tracking-wider">${data.number || 'N/A'}</div>
                        <div class="flex justify-between items-center">
                            <div class="text-sm opacity-90">
                                <div>Expires: ${data.expiry || 'N/A'}</div>
                                <div>CVV: ${data.cvv || 'N/A'}</div>
                                <div class="text-xs mt-1">Added: ${new Date(card.timestamp).toLocaleDateString()}</div>
                            </div>
                            <button onclick="fastVault.deleteCard('${card.id}')" 
                                    class="bg-red-500 bg-opacity-80 backdrop-filter backdrop-blur-sm px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-all duration-300 transform hover:scale-105">
                                <i class="fas fa-trash mr-1"></i>Delete
                            </button>
                        </div>
                    `;
                    display.appendChild(cardDiv);
                    this.log(`Card ${index + 1}: Decrypted successfully`);
                } catch (error) {
                    this.log(`Card ${index + 1}: Decryption failed - ${error.message}`);
                    // Add error card display
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'bg-red-500 text-white p-4 rounded-lg';
                    errorDiv.innerHTML = `
                        <div class="flex justify-between items-center">
                            <span>⚠️ Card ${index + 1}: Decryption Error</span>
                            <button onclick="fastVault.deleteCard('${card.id || 'unknown'}')" 
                                    class="bg-red-700 px-2 py-1 rounded text-xs hover:bg-red-800">
                                Remove
                            </button>
                        </div>
                    `;
                    display.appendChild(errorDiv);
                }
            });

            document.getElementById('viewAllCards').classList.add('hidden');
            document.getElementById('hideCards').classList.remove('hidden');
            this.log('Cards display completed! 👀');
        } catch (error) {
            this.log('Error loading cards: ' + error.message);
            alert('Error loading cards: ' + error.message);
        }
    }

    hideCards() {
        document.getElementById('cardsDisplay').innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-eye-slash text-4xl mb-4 opacity-50"></i>
                <p>Cards hidden for security</p>
            </div>
        `;
        document.getElementById('viewAllCards').classList.remove('hidden');
        document.getElementById('hideCards').classList.add('hidden');
        this.log('Cards hidden 🙈');
    }

    async deleteCard(cardId) {
        if (confirm('Delete this card?')) {
            if (window.cloudStorage) {
                await window.cloudStorage.deleteCard(cardId);
            }
            this.updateCount();
            this.viewCards();
            this.log('Card deleted 🗑️');
        }
    }

    async clearAll() {
        if (confirm('Delete ALL cards? This cannot be undone!')) {
            if (window.cloudStorage) {
                await window.cloudStorage.clearAll();
            }
            this.updateCount();
            this.hideCards();
            this.log('All cards cleared! 🧹');
        }
    }

    clearForm() {
        document.getElementById('cardForm').reset();
        this.log('Form cleared 📝');
    }

    async updateCount() {
        try {
            const cards = window.cloudStorage ? await window.cloudStorage.getCards() : [];
            document.getElementById('cardCount').textContent = cards.length;
        } catch {
            document.getElementById('cardCount').textContent = '?';
        }
    }

    getCardType(number) {
        if (number.startsWith('4')) return 'Visa';
        if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
        if (number.startsWith('3')) return 'Amex';
        if (number.startsWith('6')) return 'Discover';
        return 'Unknown';
    }    getCardGradient(cardType) {
        const gradients = {
            'Visa': 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #3B82F6 100%)',
            'Mastercard': 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #8B5CF6 100%)',
            'Amex': 'linear-gradient(135deg, #3730A3 0%, #4F46E5 50%, #6366F1 100%)',
            'Discover': 'linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #1D4ED8 100%)',
            'Unknown': 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #3B82F6 100%)'
        };
        return gradients[cardType] || gradients['Unknown'];
    }

    getCardIcon(cardType) {
        const icons = {
            'Visa': '<i class="fab fa-cc-visa text-2xl opacity-80"></i>',
            'Mastercard': '<i class="fab fa-cc-mastercard text-2xl opacity-80"></i>',
            'Amex': '<i class="fab fa-cc-amex text-2xl opacity-80"></i>',
            'Discover': '<i class="fab fa-cc-discover text-2xl opacity-80"></i>',
            'Unknown': '<i class="fas fa-credit-card text-2xl opacity-80"></i>'
        };
        return icons[cardType] || icons['Unknown'];
    }

    toggleDark() {
        document.body.classList.toggle('dark');
        const icon = document.body.classList.contains('dark') ? 'fa-sun' : 'fa-moon';
        document.getElementById('darkModeToggle').innerHTML = `<i class="fas ${icon} text-xl"></i>`;
        this.log('Dark mode toggled 🌙');
    }

    log(message) {
        const console = document.getElementById('consoleLog');
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'text-green-400 mb-1';
        entry.innerHTML = `[${time}] ${message}`;
        console.appendChild(entry);
        console.scrollTop = console.scrollHeight;
    }

    clearLog() {
        document.getElementById('consoleLog').innerHTML = `
            <div class="text-gray-500">// Card Vault Console</div>
            <div class="text-gray-500">// Console cleared at ${new Date().toLocaleTimeString()}</div>
        `;
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-xl text-white z-50 transform translate-x-full transition-all duration-500 backdrop-filter backdrop-blur-lg border ${
            type === 'success' 
                ? 'bg-green-500 bg-opacity-90 border-green-300 border-opacity-30' 
                : 'bg-red-500 bg-opacity-90 border-red-300 border-opacity-30'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} text-xl"></i>
                <span class="font-medium">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
            notification.classList.add('translate-x-0');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.fastVault = new FastCardVault();
    
    // Validate cloud storage methods are available after initialization
    setTimeout(() => {
        if (window.cloudStorage && typeof window.cloudStorage.validateMethods === 'function') {
            window.cloudStorage.validateMethods();
        }
    }, 1000);
});

// For demo data compatibility
window.cardVault = {
    handleCardSubmission: () => window.fastVault?.saveCard(),
    logToConsole: (msg) => window.fastVault?.log(msg)
};
