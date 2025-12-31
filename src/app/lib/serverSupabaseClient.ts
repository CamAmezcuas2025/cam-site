// src/app/lib/serverSupabaseClient.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Explicitly mark this file for server execution
export const runtime = "nodejs";

export async function createServerSupabaseClient() {
  // Add debugging
  console.log("Creating Supabase client with URL:", supabaseUrl ? 'YES' : 'NO');
  console.log("Creating Supabase client with key:", supabaseAnonKey ? 'YES' : 'NO');
  
  const cookieStore = await Promise.resolve(cookies());
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: any }>
      ) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}
