"use client";

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client component client (for session checks, realtime, etc.)
export function createClientSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Optional: Test connection (unchanged)
export async function testSupabaseConnection() {
  const supabase = createClientSupabaseClient();
  const { data, error } = await supabase.from("test_table").select("*").limit(1);
  console.log("Supabase test:", { data, error });
}