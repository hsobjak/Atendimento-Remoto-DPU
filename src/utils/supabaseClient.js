import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL: Supabase credentials not found. Check your .env file or hosting environment variables.");
}

// Singleton instance
let supabaseInstance = null;

export const getSupabase = () => {
    if (!supabaseInstance) {
        supabaseInstance = createClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseAnonKey || 'placeholder'
        );
    }
    return supabaseInstance;
};

// Exporting the direct object for legacy static imports if needed, 
// but using getSupabase() or dynamic imports is preferred.
export const supabase = getSupabase();
