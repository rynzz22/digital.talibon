import { createClient, SupabaseClient } from '@supabase/supabase-js';

// In a real app, these come from environment variables (import.meta.env.VITE_...)
// For this demo, if these are missing, the App will fallback to MOCK data automatically.
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export let supabase: SupabaseClient;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  // Create a safe fallback object that allows the app to load.
  // The 'isConnected' check in db.ts will fail (as intended) because supabaseUrl is empty,
  // causing the app to use Mock Data instead of crashing.
  supabase = {
    supabaseUrl: '',
    supabaseKey: '',
    from: () => ({ select: () => ({}), insert: () => ({}), update: () => ({}), eq: () => ({}) }),
    auth: { signInWithPassword: () => ({}), signOut: () => ({}) }
  } as unknown as SupabaseClient;
}