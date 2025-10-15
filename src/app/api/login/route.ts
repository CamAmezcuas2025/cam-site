import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createServerSupabaseClient(() => Promise.resolve(cookies()));

    // Sign in
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (signInError || !user) {
      console.error("Login error:", signInError);
      return NextResponse.json({ error: signInError?.message || "Invalid credentials" }, { status: 401 });
    }

    console.log("User logged in:", { id: user.id, email: body.email });

    // Check role via RPC (or fallback to DB fetch if RPC unavailable)
    const { data: rpcData } = await supabase.rpc("is_admin");
    const isAdmin = Array.isArray(rpcData) ? rpcData[0]?.is_admin ?? false : rpcData ?? false;

    // Determine redirect
    const redirect = isAdmin ? '/admin' : '/profile';

    console.log("Redirecting to:", redirect, "for email:", body.email);

    // Server-side redirect: browser/client follows automatically, no flash
    return NextResponse.redirect(new URL(redirect, req.url));
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}