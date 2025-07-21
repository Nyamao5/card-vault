// Quick Test for Card Vault
// Open browser console and run: testCardVault()

function testCardVault() {
    console.log('🧪 Testing Card Vault...');
    
    // Test 1: Check if app is loaded
    if (!window.fastVault) {
        console.error('❌ FastVault not loaded');
        return;
    }
    console.log('✅ FastVault loaded');
    
    // Test 2: Check if cloud storage is working
    if (!window.cloudStorage) {
        console.error('❌ CloudStorage not loaded');
        return;
    }
    console.log('✅ CloudStorage loaded');
    
    // Test 3: Test encryption/decryption
    try {
        const testData = { name: 'Test User', number: '4111111111111111' };
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(testData), 'test-key').toString();
        const decrypted = CryptoJS.AES.decrypt(encrypted, 'test-key').toString(CryptoJS.enc.Utf8);
        const parsed = JSON.parse(decrypted);
        
        if (parsed.name === 'Test User') {
            console.log('✅ Encryption/Decryption working');
        } else {
            console.error('❌ Encryption/Decryption failed');
        }
    } catch (error) {
        console.error('❌ Encryption test failed:', error);
    }
    
    // Test 4: Test storage
    try {
        const testCard = {
            id: 'test-123',
            encryptedData: 'test-data',
            cardType: 'Test',
            lastFour: '1234'
        };
        
        localStorage.setItem('test-storage', JSON.stringify([testCard]));
        const retrieved = JSON.parse(localStorage.getItem('test-storage'));
        localStorage.removeItem('test-storage');
        
        if (retrieved && retrieved.length === 1 && retrieved[0].id === 'test-123') {
            console.log('✅ Storage working');
        } else {
            console.error('❌ Storage failed');
        }
    } catch (error) {
        console.error('❌ Storage test failed:', error);
    }
    
    console.log('🎉 Test completed! Check results above.');
}

// Auto-run test when console is opened (optional)
// testCardVault();
