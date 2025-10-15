import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Server-only Supabase client (async-safe, same behavior)
export async function createServerSupabaseClient(
  getCookieStore?: () => Promise<ReturnType<typeof cookies>> // <— fixed type (Promise-wrapped)
) {
  const cookieStore = getCookieStore ? await getCookieStore() : cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        return cookieStore.getAll();
      },
      async setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: any }>
      ) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}