// Firebase Firestore Security Rules for Card Vault
// Copy these rules to your Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Card Vault collection rules
    match /card_vault/{document} {
      // Allow read/write if the document belongs to the requesting user
      // Note: This is a basic rule for demo. In production, implement proper authentication
      
      // For demo purposes - allow all operations (replace with proper auth)
      allow read, write: if true;
      
      // For production with Firebase Auth, use rules like:
      // allow read, write: if request.auth != null && 
      //   resource.data.userId == request.auth.uid;
      
      // More secure example rules:
      // allow read: if request.auth != null && 
      //   resource.data.userId == request.auth.uid;
      
      // allow create: if request.auth != null && 
      //   request.resource.data.userId == request.auth.uid &&
      //   validateCardData(request.resource.data);
      
      // allow update: if request.auth != null && 
      //   resource.data.userId == request.auth.uid &&
      //   request.resource.data.userId == request.auth.uid;
      
      // allow delete: if request.auth != null && 
      //   resource.data.userId == request.auth.uid;
    }
    
    // Helper function to validate card data structure
    function validateCardData(data) {
      return data.keys().hasAll(['id', 'encryptedData', 'timestamp', 'cardType', 'lastFour', 'userId', 'createdAt']) &&
             data.id is string &&
             data.encryptedData is string &&
             data.timestamp is string &&
             data.cardType is string &&
             data.lastFour is string &&
             data.userId is string;
    }
    
    // Deny all other document access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

// Additional security considerations for production:
//
// 1. Enable Firebase Authentication
// 2. Use Firebase Auth UIDs for user identification
// 3. Implement proper user registration/login
// 4. Add data validation rules
// 5. Set up Firebase App Check for additional security
// 6. Monitor usage with Firebase Security Rules simulator
// 7. Consider implementing rate limiting
// 8. Add audit logging for sensitive operations
