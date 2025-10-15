import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Server-only Supabase client — fully type-safe for Next.js 15+
export async function createServerSupabaseClient(
  getCookieStore?: () => ReturnType<typeof cookies>
) {
  // cookies() is synchronous — don’t await it
  const cookieStore = getCookieStore ? getCookieStore() : cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // ✅ Not async — returns an array directly
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        // ✅ Works fine; NextResponseCookies.set() still accepts options
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}
