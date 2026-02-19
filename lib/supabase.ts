
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// LIVE CREDENTIALS FROM USER INPUT
// Note: We derive the URL from the project ref if possible, or use the standard supabase.co format
const PROJECT_REF = "acpousqosysoryaktizv"; // Keep existing ref or replace if you have a new one
const LIVE_URL = `https://${PROJECT_REF}.supabase.co`;
const LIVE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjcG91c3Fvc3lzb3J5YWt0aXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyODQyMzEsImV4cCI6MjA4Njg2MDIzMX0.aR3gkFxh97C22uatffmgMzhApZNna3FvWOii-jg4gKg";

// Safe access to env variables to prevent crashes
const env = (import.meta as any).env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || LIVE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY || LIVE_ANON_KEY;

export let supabase: SupabaseClient;
export let isSupabaseConnected = false;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    isSupabaseConnected = true;
    console.log("Supabase Client Initialized");
  } catch (err) {
    console.warn("Supabase initialization failed.");
    isSupabaseConnected = false;
  }
} else {
    // Mock client fallback
    isSupabaseConnected = false;
    supabase = {} as SupabaseClient;
}
