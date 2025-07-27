# Supabase Setup Guide for Card Vault

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `card-vault` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 2. Setup Database
1. Wait for project to be ready (2-3 minutes)
2. Go to **SQL Editor** in the left sidebar
3. Copy and paste the contents of `supabase-setup.sql`
4. Click "Run" to execute the SQL

### 3. Get Configuration Details
1. Go to **Settings** → **API** in the left sidebar
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **Project API Key** (anon public key)

### 4. Update Configuration
Open `cloud-config.js` and replace the placeholder values:

```javascript
const supabaseConfig = {
    url: "https://your-actual-project.supabase.co",  // Replace with your Project URL
    anonKey: "your-actual-anon-key-here"            // Replace with your API Key
};
```

### 5. Test Connection
1. Open your Card Vault application
2. In the Storage Backend dropdown, select "Supabase (Cloud)"
3. Check the console for connection status
4. If successful, you'll see "Supabase initialized successfully"

## 🔧 Troubleshooting

### Common Issues

**Error: "Supabase configuration not set"**
- Make sure you've updated the `url` and `anonKey` in `cloud-config.js`
- Remove the placeholder text completely

**Error: "Table 'card_vault' doesn't exist"**
- Make sure you ran the SQL setup script in Step 2
- Check the SQL Editor for any error messages

**Error: "Invalid API key"**
- Double-check you copied the correct anon public key
- Make sure there are no extra spaces or characters

**Error: "Network error"**
- Check your internet connection
- Verify the Project URL is correct
- Make sure the Supabase project is active

### Checking Connection Status
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for Supabase-related messages
4. Check the application's console section for detailed logs

## 📋 Database Schema

The setup creates a `card_vault` table with:
- `id` - Primary key
- `user_id` - User identifier
- `card_id` - Unique card identifier
- `encrypted_data` - AES encrypted card data
- `timestamp` - When card was created
- `card_type` - Visa, Mastercard, etc.
- `last_four` - Last 4 digits (for identification)
- `created_at` / `updated_at` - Timestamps

## 🔒 Security Features

- **Row Level Security (RLS)** enabled
- **Encrypted data storage** (AES-256 client-side)
- **No plain text card data** stored on server
- **User isolation** policies (ready for authentication)

## 🚀 Production Considerations

For production deployment:
1. Enable proper user authentication
2. Update RLS policies to use `auth.uid()`
3. Set up proper environment variables
4. Enable additional security features
5. Configure backup and monitoring

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] SQL setup script executed
- [ ] Configuration updated in `cloud-config.js`
- [ ] Connection test successful
- [ ] Cards can be saved and retrieved
- [ ] Console shows no errors

Once completed, your Card Vault will support cloud storage with Supabase! 🎉
