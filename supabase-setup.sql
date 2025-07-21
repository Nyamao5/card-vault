-- Supabase Database Setup for Card Vault
-- Run these SQL commands in your Supabase SQL Editor

-- Create the card_vault table
CREATE TABLE IF NOT EXISTS card_vault (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    encrypted_data TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    card_type TEXT NOT NULL,
    last_four TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_card_vault_user_id ON card_vault(user_id);

-- Create an index on card_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_card_vault_card_id ON card_vault(card_id);

-- Enable Row Level Security (RLS)
ALTER TABLE card_vault ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to only see their own cards
-- Note: This is a basic policy. In production, you'd want proper user authentication
CREATE POLICY "Users can view their own cards" ON card_vault
    FOR SELECT USING (true); -- Allow all for demo - replace with proper auth

CREATE POLICY "Users can insert their own cards" ON card_vault
    FOR INSERT WITH CHECK (true); -- Allow all for demo - replace with proper auth

CREATE POLICY "Users can update their own cards" ON card_vault
    FOR UPDATE USING (true); -- Allow all for demo - replace with proper auth

CREATE POLICY "Users can delete their own cards" ON card_vault
    FOR DELETE USING (true); -- Allow all for demo - replace with proper auth

-- For production, replace the policies above with proper authentication:
-- Example with auth.uid():
-- CREATE POLICY "Users can view their own cards" ON card_vault
--     FOR SELECT USING (auth.uid()::text = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_card_vault_updated_at 
    BEFORE UPDATE ON card_vault 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for easier querying (without exposing encrypted data structure)
CREATE OR REPLACE VIEW card_vault_summary AS
SELECT 
    card_id,
    user_id,
    card_type,
    last_four,
    created_at,
    updated_at
FROM card_vault;

-- Grant permissions to authenticated users (adjust as needed)
-- GRANT ALL ON card_vault TO authenticated;
-- GRANT ALL ON card_vault_summary TO authenticated;
