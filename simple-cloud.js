// Simplified Cloud Storage for Card Vault - Quick Setup

// Simple Firebase Config (replace with your actual config)
const firebaseConfig = {
    apiKey: "demo-key",
    authDomain: "demo.firebaseapp.com", 
    projectId: "demo-project",
    storageBucket: "demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
};

// Simple Supabase Config (replace with your actual config)
const supabaseConfig = {
    url: "https://demo.supabase.co",
    anonKey: "demo-key"
};

// Simplified Storage Manager
class SimpleCloudStorage {
    constructor() {
        this.backend = 'localStorage';
        this.connected = true;
    }

    async setBackend(backend) {
        this.backend = backend;
        
        if (backend === 'localStorage') {
            this.connected = true;
            this.updateStatus('LocalStorage', true);
        } else {
            // For demo - simulate cloud connection
            this.connected = false;
            this.updateStatus(backend, false);
            console.log(`${backend} not configured - using localStorage fallback`);
        }
    }

    async saveCard(card) {
        try {
            // Always use localStorage for simplicity
            const cards = await this.getCards();
            cards.push(card);
            localStorage.setItem('cardVault_cards', JSON.stringify(cards));
            console.log('Card saved. Total cards:', cards.length);
            console.log('Saved card:', card);
        } catch (error) {
            console.error('Error saving card:', error);
            throw error;
        }
    }

    async getCards() {
        try {
            const stored = localStorage.getItem('cardVault_cards');
            const cards = stored ? JSON.parse(stored) : [];
            console.log('Retrieved cards:', cards.length);
            return cards;
        } catch (error) {
            console.error('Error reading cards:', error);
            return [];
        }
    }

    async deleteCard(cardId) {
        const cards = this.getCards();
        const filtered = cards.filter(card => card.id !== cardId);
        localStorage.setItem('cardVault_cards', JSON.stringify(filtered));
    }

    async clearAll() {
        localStorage.removeItem('cardVault_cards');
    }

    updateStatus(type, connected) {
        const statusEl = document.getElementById('storageType');
        const connectionEl = document.getElementById('connectionStatus');
        
        if (statusEl) statusEl.textContent = type;
        if (connectionEl) {
            connectionEl.innerHTML = connected ? 
                '<i class="fas fa-circle text-green-400 text-xs"></i>' :
                '<i class="fas fa-circle text-red-400 text-xs"></i>';
        }
    }
}

// Create global instance
window.cloudStorage = new SimpleCloudStorage();
