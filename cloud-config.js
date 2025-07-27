// Cloud Database Configuration for Card Vault
// Configure your Firebase and Supabase credentials here

// ==================== FIREBASE CONFIGURATION ====================
// Get these values from your Firebase Console:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing one
// 3. Go to Project Settings > General > Your apps
// 4. Add a web app and copy the configuration

const firebaseConfig = {
    // Replace with your Firebase config
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
    
    // Example (DO NOT USE - replace with your own):
    // apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    // authDomain: "card-vault-demo.firebaseapp.com",
    // projectId: "card-vault-demo",
    // storageBucket: "card-vault-demo.appspot.com",
    // messagingSenderId: "123456789012",
    // appId: "1:123456789012:web:abcdef123456789"
};

// ==================== SUPABASE CONFIGURATION ====================
// Get these values from your Supabase Dashboard:
// 1. Go to https://supabase.com/dashboard
// 2. Create a new project or select existing one
// 3. Go to Settings > API
// 4. Copy the URL and anon public key

const supabaseConfig = {
    // ⚠️ REPLACE THESE WITH YOUR REAL SUPABASE CREDENTIALS ⚠️
    // 
    // 1. Go to https://supabase.com/dashboard
    // 2. Select your card-vault project  
    // 3. Go to Settings → API
    // 4. Copy your Project URL and anon public key below:
    
    url: "PASTE_YOUR_PROJECT_URL_HERE",           // e.g., "https://abcdefghijk.supabase.co"
    anonKey: "PASTE_YOUR_ANON_PUBLIC_KEY_HERE"   // Long string starting with "eyJ..."
    
    // Example of what they should look like (DO NOT USE THESE):
    // url: "https://abcdefghijklmnop.supabase.co",
    // anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNTc3MzU5NiwiZXhwIjoxOTUxMzQ5NTU2fQ.your-real-key-here"
};

// ==================== CLOUD STORAGE MANAGER ====================
class CloudStorageManager {
    constructor() {
        this.currentBackend = 'localStorage';
        this.firebase = null;
        this.supabase = null;
        this.userId = this.generateUserId();
        this.isConnected = false;
    }

    // Generate a unique user ID (in production, use proper authentication)
    generateUserId() {
        let userId = localStorage.getItem('cardVault_userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cardVault_userId', userId);
        }
        return userId;
    }

    // Initialize Firebase
    async initializeFirebase() {
        try {
            if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your-api-key-here") {
                throw new Error('Firebase configuration not set. Please update cloud-config.js');
            }

            // Import Firebase modules
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
            const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
            
            const app = initializeApp(firebaseConfig);
            this.firebase = getFirestore(app);
            this.isConnected = true;
            
            cardVault.logToConsole('Firebase Firestore initialized successfully', 'success');
            return true;
        } catch (error) {
            cardVault.logToConsole(`Firebase initialization failed: ${error.message}`, 'error');
            this.isConnected = false;
            return false;
        }
    }    // Initialize Supabase
    async initializeSupabase() {        try {
            // Check for demo/placeholder URLs
            if (!supabaseConfig.url || 
                supabaseConfig.url === "https://demo.supabase.co" ||
                supabaseConfig.url === "https://xyzcompany.supabase.co" ||
                supabaseConfig.url === "PASTE_YOUR_PROJECT_URL_HERE" ||
                supabaseConfig.anonKey === "demo-key" ||
                supabaseConfig.anonKey === "PASTE_YOUR_ANON_PUBLIC_KEY_HERE" ||
                supabaseConfig.anonKey.includes("demo-key-for-testing")) {
                
                cardVault.logToConsole('⚠️ Using placeholder Supabase configuration - you need to set up real credentials!', 'error');
                cardVault.logToConsole('📋 SETUP STEPS:', 'info');
                cardVault.logToConsole('1. Go to https://supabase.com/dashboard', 'info');
                cardVault.logToConsole('2. Create a new project called "card-vault"', 'info');
                cardVault.logToConsole('3. Wait for setup to complete (2-3 minutes)', 'info');
                cardVault.logToConsole('4. Go to Settings → API', 'info');
                cardVault.logToConsole('5. Copy Project URL and anon public key', 'info');
                cardVault.logToConsole('6. Replace the placeholder values in cloud-config.js', 'info');
                cardVault.logToConsole('7. Run the SQL setup script in the SQL Editor', 'info');
                
                // Simulate connection attempt for demo purposes
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error('Placeholder Supabase configuration detected - please set up real credentials to use cloud storage');
            }

            // Check if Supabase v2 client is loaded
            if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
                throw new Error('Supabase v2 client not loaded. Make sure @supabase/supabase-js@2 is included in your HTML');
            }

            // Create Supabase client
            this.supabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
            
            // Test connection by attempting to query the table
            cardVault.logToConsole('Testing Supabase connection...', 'info');
            const { data, error } = await this.supabase.from('card_vault').select('id').limit(1);
            
            if (error) {
                // If table doesn't exist, that's okay for initial setup
                if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
                    cardVault.logToConsole('Supabase connected but card_vault table not found. Please run the SQL setup script.', 'warning');
                } else {
                    throw error;
                }
            }
            
            this.isConnected = true;
            cardVault.logToConsole('Supabase client initialized successfully', 'success');
            return true;
        } catch (error) {
            cardVault.logToConsole(`Supabase initialization failed: ${error.message}`, 'error');
            this.isConnected = false;
            return false;
        }
    }

    // Set storage backend
    async setBackend(backend) {
        this.currentBackend = backend;
        this.isConnected = false;
        
        cardVault.logToConsole(`Switching to ${backend} storage...`, 'info');
        
        switch (backend) {
            case 'firebase':
                await this.initializeFirebase();
                break;
            case 'supabase':
                await this.initializeSupabase();
                break;
            case 'localStorage':
                this.isConnected = true;
                cardVault.logToConsole('Using local storage', 'info');
                break;
        }
        
        this.updateUI();
        return this.isConnected;
    }

    // Save encrypted card to current backend
    async saveCard(encryptedCard) {
        switch (this.currentBackend) {
            case 'firebase':
                return await this.saveToFirebase(encryptedCard);
            case 'supabase':
                return await this.saveToSupabase(encryptedCard);
            case 'localStorage':
            default:
                return this.saveToLocalStorage(encryptedCard);
        }
    }    // Get stored cards from current backend
    async getStoredCards() {
        switch (this.currentBackend) {
            case 'firebase':
                return await this.getFromFirebase();
            case 'supabase':
                return await this.getFromSupabase();
            case 'localStorage':
            default:
                return this.getFromLocalStorage();
        }
    }

    // Alias for backward compatibility
    async getCards() {
        return await this.getStoredCards();
    }

    // Delete card from current backend
    async deleteCard(cardId) {
        switch (this.currentBackend) {
            case 'firebase':
                return await this.deleteFromFirebase(cardId);
            case 'supabase':
                return await this.deleteFromSupabase(cardId);
            case 'localStorage':
            default:
                return this.deleteFromLocalStorage(cardId);
        }
    }    // Clear all cards from current backend
    async clearAllCards() {
        switch (this.currentBackend) {
            case 'firebase':
                return await this.clearFirebase();
            case 'supabase':
                return await this.clearSupabase();
            case 'localStorage':
            default:
                return this.clearLocalStorage();
        }
    }

    // Alias for backward compatibility
    async clearAll() {
        return await this.clearAllCards();
    }

    // ==================== FIREBASE METHODS ====================
    async saveToFirebase(encryptedCard) {
        if (!this.firebase) throw new Error('Firebase not initialized');
        
        const { doc, setDoc, collection } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        
        const cardDoc = doc(collection(this.firebase, 'card_vault'), `${this.userId}_${encryptedCard.id}`);
        await setDoc(cardDoc, {
            ...encryptedCard,
            userId: this.userId,
            createdAt: new Date()
        });
        
        cardVault.logToConsole(`Card saved to Firebase (ID: ${encryptedCard.id})`, 'success');
    }

    async getFromFirebase() {
        if (!this.firebase) throw new Error('Firebase not initialized');
        
        const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        
        const q = query(
            collection(this.firebase, 'card_vault'),
            where('userId', '==', this.userId)
        );
        
        const querySnapshot = await getDocs(q);
        const cards = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            cards.push({
                id: data.id,
                encryptedData: data.encryptedData,
                timestamp: data.timestamp,
                cardType: data.cardType,
                lastFour: data.lastFour
            });
        });
        
        cardVault.logToConsole(`Retrieved ${cards.length} cards from Firebase`, 'success');
        return cards;
    }

    async deleteFromFirebase(cardId) {
        if (!this.firebase) throw new Error('Firebase not initialized');
        
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        
        await deleteDoc(doc(this.firebase, 'card_vault', `${this.userId}_${cardId}`));
        cardVault.logToConsole(`Card deleted from Firebase (ID: ${cardId})`, 'success');
    }

    async clearFirebase() {
        if (!this.firebase) throw new Error('Firebase not initialized');
        
        const cards = await this.getFromFirebase();
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        
        for (const card of cards) {
            await deleteDoc(doc(this.firebase, 'card_vault', `${this.userId}_${card.id}`));
        }
        
        cardVault.logToConsole('All cards cleared from Firebase', 'success');
    }

    // ==================== SUPABASE METHODS ====================
    async saveToSupabase(encryptedCard) {
        if (!this.supabase) throw new Error('Supabase not initialized');
        
        const { data, error } = await this.supabase
            .from('card_vault')
            .insert([{
                id: `${this.userId}_${encryptedCard.id}`,
                user_id: this.userId,
                card_id: encryptedCard.id,
                encrypted_data: encryptedCard.encryptedData,
                timestamp: encryptedCard.timestamp,
                card_type: encryptedCard.cardType,
                last_four: encryptedCard.lastFour,
                created_at: new Date()
            }]);
        
        if (error) throw error;
        cardVault.logToConsole(`Card saved to Supabase (ID: ${encryptedCard.id})`, 'success');
    }

    async getFromSupabase() {
        if (!this.supabase) throw new Error('Supabase not initialized');
        
        const { data, error } = await this.supabase
            .from('card_vault')
            .select('*')
            .eq('user_id', this.userId);
        
        if (error) throw error;
        
        const cards = data.map(row => ({
            id: row.card_id,
            encryptedData: row.encrypted_data,
            timestamp: row.timestamp,
            cardType: row.card_type,
            lastFour: row.last_four
        }));
        
        cardVault.logToConsole(`Retrieved ${cards.length} cards from Supabase`, 'success');
        return cards;
    }

    async deleteFromSupabase(cardId) {
        if (!this.supabase) throw new Error('Supabase not initialized');
        
        const { error } = await this.supabase
            .from('card_vault')
            .delete()
            .eq('id', `${this.userId}_${cardId}`);
        
        if (error) throw error;
        cardVault.logToConsole(`Card deleted from Supabase (ID: ${cardId})`, 'success');
    }

    async clearSupabase() {
        if (!this.supabase) throw new Error('Supabase not initialized');
        
        const { error } = await this.supabase
            .from('card_vault')
            .delete()
            .eq('user_id', this.userId);
        
        if (error) throw error;
        cardVault.logToConsole('All cards cleared from Supabase', 'success');
    }

    // ==================== LOCAL STORAGE METHODS ====================
    saveToLocalStorage(encryptedCard) {
        const existing = this.getFromLocalStorage();
        existing.push(encryptedCard);
        localStorage.setItem('cardVault_encryptedCards', JSON.stringify(existing));
        cardVault.logToConsole(`Card saved to localStorage (ID: ${encryptedCard.id})`, 'success');
    }    getFromLocalStorage() {
        try {
            // Check for cards in new format first
            let stored = localStorage.getItem('cardVault_encryptedCards');
            if (stored) {
                return JSON.parse(stored);
            }
            
            // Check for cards in old format (from simple-cloud.js)
            stored = localStorage.getItem('cardVault_cards');
            if (stored) {
                const oldCards = JSON.parse(stored);
                // Migrate to new format if any old cards exist
                if (oldCards.length > 0) {
                    localStorage.setItem('cardVault_encryptedCards', JSON.stringify(oldCards));
                    localStorage.removeItem('cardVault_cards'); // Clean up old storage
                    cardVault.logToConsole(`Migrated ${oldCards.length} cards to new storage format`, 'info');
                }
                return oldCards;
            }
            
            return [];
        } catch (error) {
            cardVault.logToConsole(`Error reading localStorage: ${error.message}`, 'error');
            return [];
        }
    }

    deleteFromLocalStorage(cardId) {
        const cards = this.getFromLocalStorage();
        const filtered = cards.filter(card => card.id !== cardId);
        localStorage.setItem('cardVault_encryptedCards', JSON.stringify(filtered));
        cardVault.logToConsole(`Card deleted from localStorage (ID: ${cardId})`, 'success');
    }

    clearLocalStorage() {
        localStorage.removeItem('cardVault_encryptedCards');
        cardVault.logToConsole('All cards cleared from localStorage', 'success');
    }

    // Update UI elements
    updateUI() {
        const storageTypeElement = document.getElementById('storageType');
        const connectionStatusElement = document.getElementById('connectionStatus');
        
        if (storageTypeElement) {
            storageTypeElement.textContent = this.getBackendDisplayName();
        }
        
        if (connectionStatusElement) {
            if (this.currentBackend === 'localStorage') {
                connectionStatusElement.innerHTML = '<i class="fas fa-circle text-green-400 text-xs"></i>';
            } else {
                const icon = this.isConnected ? 
                    '<i class="fas fa-circle text-green-400 text-xs" title="Connected"></i>' : 
                    '<i class="fas fa-circle text-red-400 text-xs" title="Disconnected"></i>';
                connectionStatusElement.innerHTML = icon;
            }
        }
    }    getBackendDisplayName() {
        switch (this.currentBackend) {
            case 'firebase': return 'Firebase Firestore';
            case 'supabase': return 'Supabase';
            case 'localStorage': return 'LocalStorage';
            default: return 'Unknown';
        }
    }

    // Validate all required methods exist (for debugging)
    validateMethods() {
        const requiredMethods = ['setBackend', 'saveCard', 'getCards', 'deleteCard', 'clearAll'];
        const missing = [];
        
        for (const method of requiredMethods) {
            if (typeof this[method] !== 'function') {
                missing.push(method);
            }
        }
        
        if (missing.length > 0) {
            console.error('CloudStorageManager missing methods:', missing);
            return false;
        }
        
        console.log('CloudStorageManager: All required methods available');
        return true;
    }
}

// Initialize the cloud storage manager
window.cloudStorageManager = new CloudStorageManager();
window.cloudStorage = window.cloudStorageManager; // Alias for backward compatibility

// Wait for DOM and initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initial UI update
    window.cloudStorageManager.updateUI();
    
    console.log('Cloud Storage Manager initialized');
    console.log('Available backends: localStorage, firebase, supabase');
});
