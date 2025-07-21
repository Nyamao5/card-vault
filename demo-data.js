// Demo Test Cards for Card Vault Testing
// These are test card numbers that pass Luhn validation but are not real cards

const demoCards = [
    {
        cardholderName: "John Doe",
        cardNumber: "4532015112830366", // Test Visa
        expiryDate: "12/25",
        cvv: "123"
    },
    {
        cardholderName: "Jane Smith", 
        cardNumber: "5425233430109903", // Test Mastercard
        expiryDate: "06/26",
        cvv: "456"
    },
    {
        cardholderName: "Bob Wilson",
        cardNumber: "374245455400126", // Test American Express
        expiryDate: "09/24",
        cvv: "789"
    },
    {
        cardholderName: "Alice Johnson",
        cardNumber: "6011514433546201", // Test Discover
        expiryDate: "03/27",
        cvv: "321"
    }
];

// Function to load demo data (for testing purposes)
function loadDemoData() {
    if (confirm('Load demo card data? This will add 4 test cards to your vault.')) {
        try {
            demoCards.forEach((card, index) => {
                console.log(`Loading demo card ${index + 1}:`, card.cardholderName);
                
                // Create card data object directly
                const cardData = {
                    name: card.cardholderName,
                    number: card.cardNumber,
                    expiry: card.expiryDate,
                    cvv: card.cvv,
                    id: 'demo_card_' + Date.now() + '_' + index,
                    timestamp: new Date().toISOString()
                };

                // Encrypt the card data
                if (window.fastVault) {
                    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(cardData), window.fastVault.secretKey).toString();
                    
                    const encryptedCard = {
                        id: cardData.id,
                        encryptedData: encrypted,
                        timestamp: cardData.timestamp,
                        cardType: window.fastVault.getCardType(cardData.number),
                        lastFour: cardData.number.slice(-4)
                    };

                    // Save directly to storage
                    if (window.cloudStorage) {
                        window.cloudStorage.saveCard(encryptedCard);
                    }
                    
                    window.fastVault.log(`Demo card ${index + 1} (${card.cardholderName}) loaded successfully! ✅`);
                } else {
                    console.error('FastVault instance not found');
                }
            });
            
            if (window.fastVault) {
                window.fastVault.log('All 4 demo cards loaded successfully! 🎉');
                window.fastVault.updateCount();
            }
            alert('All 4 demo cards loaded! Click "Decrypt & View All Cards" to see them.');
        } catch (error) {
            console.error('Error loading demo data:', error);
            alert('Error loading demo data: ' + error.message);
        }
    }
}

// Add demo button to the page
document.addEventListener('DOMContentLoaded', () => {
    const demoButton = document.createElement('button');
    demoButton.textContent = 'Load Demo Data';
    demoButton.className = 'bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors duration-300';
    demoButton.onclick = loadDemoData;
    
    // Add button to header
    const header = document.querySelector('header');
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'mt-4';
    buttonContainer.appendChild(demoButton);
    header.appendChild(buttonContainer);
});
