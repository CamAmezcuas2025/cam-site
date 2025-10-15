import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-only Supabase client (async for proper cookie awaiting)
export async function createServerSupabaseClient(getCookieStore?: () => Promise<ReturnType<typeof cookies>>) {
  const cookieStore = getCookieStore ? await getCookieStore() : await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        return cookieStore.getAll();
      },
      async setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: any }>
      ) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}