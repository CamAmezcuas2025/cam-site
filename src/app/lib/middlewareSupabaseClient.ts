// app/lib/middlewareSupabaseClient.ts
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createMiddlewareSupabaseClient(req: NextRequest) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // ✅ Only pass name and value — new Next.js cookie API
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
      },
    },
  });
}
