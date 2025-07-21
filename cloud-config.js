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
    // Replace with your Supabase config
    url: "https://your-project.supabase.co",
    anonKey: "your-anon-key-here"
    
    // Example (DO NOT USE - replace with your own):
    // url: "https://abcdefghijklmnop.supabase.co",
    // anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
    }

    // Initialize Supabase
    async initializeSupabase() {
        try {
            if (!supabaseConfig.url || supabaseConfig.url === "https://your-project.supabase.co") {
                throw new Error('Supabase configuration not set. Please update cloud-config.js');
            }

            const { createClient } = supabase;
            this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
            this.isConnected = true;
            
            // Test connection
            const { data, error } = await this.supabase.from('card_vault').select('count').limit(1);
            if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is OK
                throw error;
            }
            
            cardVault.logToConsole('Supabase initialized successfully', 'success');
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
    }

    // Get stored cards from current backend
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
    }

    // Clear all cards from current backend
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
    }

    getFromLocalStorage() {
        try {
            const stored = localStorage.getItem('cardVault_encryptedCards');
            return stored ? JSON.parse(stored) : [];
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
    }

    getBackendDisplayName() {
        switch (this.currentBackend) {
            case 'firebase': return 'Firebase Firestore';
            case 'supabase': return 'Supabase';
            case 'localStorage': return 'LocalStorage';
            default: return 'Unknown';
        }
    }
}

// Initialize the cloud storage manager
window.cloudStorageManager = new CloudStorageManager();
