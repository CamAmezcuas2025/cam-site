// src/app/lib/middlewareSupabaseClient.ts
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

// Environment variables — make sure these are set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase client that can be safely used inside Next.js middleware.
 * This preserves auth sessions via cookies without causing runtime errors.
 */
export function createMiddlewareSupabaseClient(req: NextRequest) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // ✅ Only pass name and value — NextRequest.cookies.set() takes 2 args in Next.js 15+
        cookiesToSet.forEach(({ name, value }) => {
          try {
            req.cookies.set(name, value);
          } catch {
            // Silent fail — middleware can't persist new cookies anyway
          }
        });
      },
    },
  });
}
