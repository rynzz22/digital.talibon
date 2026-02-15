import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Helper to safely access env variables in browser environments
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env[key];
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const SUPABASE_URL = getEnv('REACT_APP_SUPABASE_URL');
const SUPABASE_KEY = getEnv('REACT_APP_SUPABASE_ANON_KEY');

export let supabase: SupabaseClient;
export let isSupabaseConnected = false;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  isSupabaseConnected = true;
} else {
  // Create a safe fallback object that allows the app to load.
  // The 'isConnected' check in db.ts will fail (as intended) because supabaseUrl is empty,
  // causing the app to use Mock Data instead of crashing.
  console.warn("Supabase credentials not found. Switching to MOCK DATA mode.");
  supabase = {
    supabaseUrl: '',
    supabaseKey: '',
    from: () => ({ select: () => ({}), insert: () => ({}), update: () => ({}), eq: () => ({}) }),
    auth: { signInWithPassword: () => ({}), signOut: () => ({}) }
  } as unknown as SupabaseClient;
  isSupabaseConnected = false;
}