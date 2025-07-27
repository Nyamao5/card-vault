// Supabase Debug Helper for Card Vault
// This script helps debug Supabase integration issues

class SupabaseDebugger {
    constructor() {
        this.logPrefix = '[Supabase Debug]';
    }

    // Check if Supabase client is loaded
    checkSupabaseLibrary() {
        console.log(`${this.logPrefix} Checking Supabase library...`);
        
        if (typeof window.supabase === 'undefined') {
            console.error(`${this.logPrefix} ❌ Supabase library not found`);
            console.log(`${this.logPrefix} Make sure @supabase/supabase-js@2 is loaded in your HTML`);
            return false;
        }
        
        if (typeof window.supabase.createClient !== 'function') {
            console.error(`${this.logPrefix} ❌ Supabase createClient method not found`);
            console.log(`${this.logPrefix} Wrong Supabase version? Make sure you're using v2`);
            return false;
        }
        
        console.log(`${this.logPrefix} ✅ Supabase library loaded correctly`);
        return true;
    }

    // Check configuration
    checkConfig() {
        console.log(`${this.logPrefix} Checking configuration...`);
        
        if (typeof supabaseConfig === 'undefined') {
            console.error(`${this.logPrefix} ❌ supabaseConfig not found`);
            return false;
        }
        
        if (!supabaseConfig.url || supabaseConfig.url === 'https://demo.supabase.co') {
            console.warn(`${this.logPrefix} ⚠️ Demo configuration detected`);
            console.log(`${this.logPrefix} Update cloud-config.js with your actual Supabase project details`);
            return false;
        }
        
        if (!supabaseConfig.anonKey || supabaseConfig.anonKey === 'demo-key') {
            console.warn(`${this.logPrefix} ⚠️ Demo API key detected`);
            console.log(`${this.logPrefix} Update cloud-config.js with your actual Supabase anon key`);
            return false;
        }
        
        console.log(`${this.logPrefix} ✅ Configuration looks valid`);
        console.log(`${this.logPrefix} URL: ${supabaseConfig.url}`);
        console.log(`${this.logPrefix} Key: ${supabaseConfig.anonKey.substring(0, 20)}...`);
        return true;
    }

    // Test connection
    async testConnection() {
        console.log(`${this.logPrefix} Testing connection...`);
        
        if (!this.checkSupabaseLibrary() || !this.checkConfig()) {
            return false;
        }
        
        try {
            const client = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
            console.log(`${this.logPrefix} ✅ Client created successfully`);
            
            // Test basic query
            const { data, error } = await client.from('card_vault').select('id').limit(1);
            
            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
                    console.warn(`${this.logPrefix} ⚠️ Table 'card_vault' not found`);
                    console.log(`${this.logPrefix} Run the SQL setup script in your Supabase dashboard`);
                    return 'table_missing';
                } else {
                    console.error(`${this.logPrefix} ❌ Connection error:`, error);
                    return false;
                }
            }
            
            console.log(`${this.logPrefix} ✅ Connection successful!`);
            return true;
        } catch (error) {
            console.error(`${this.logPrefix} ❌ Connection failed:`, error);
            return false;
        }
    }

    // Run full diagnostics
    async runDiagnostics() {
        console.log(`${this.logPrefix} Running full diagnostics...`);
        console.log(`${this.logPrefix} =====================================`);
        
        const libraryOk = this.checkSupabaseLibrary();
        const configOk = this.checkConfig();
        
        if (libraryOk && configOk) {
            const connectionResult = await this.testConnection();
            
            if (connectionResult === true) {
                console.log(`${this.logPrefix} 🎉 All checks passed! Supabase is ready to use.`);
            } else if (connectionResult === 'table_missing') {
                console.log(`${this.logPrefix} 📋 Connection OK, but table setup needed.`);
            } else {
                console.log(`${this.logPrefix} ❌ Connection issues detected.`);
            }
        } else {
            console.log(`${this.logPrefix} ❌ Configuration issues detected.`);
        }
        
        console.log(`${this.logPrefix} =====================================`);
        return { libraryOk, configOk };
    }
}

// Create global debugger instance
window.supabaseDebugger = new SupabaseDebugger();

// Auto-run diagnostics on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.supabaseDebugger.runDiagnostics();
    }, 1000);
});

console.log('Supabase Debugger loaded. Run supabaseDebugger.runDiagnostics() manually anytime.');
