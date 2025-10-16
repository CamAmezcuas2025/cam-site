import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ✅ FIX: remove argument — your helper doesn't take one anymore
    const supabase = await createServerSupabaseClient();

    // ✅ Login with Supabase Auth
    const {
      data: { user },
      error: signInError,
    } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (signInError || !user) {
      console.error("Login error:", signInError);
      return NextResponse.json(
        { error: signInError?.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("✅ User logged in:", { id: user.id, email: body.email });

    // ✅ Check admin role via RPC
    const { data: rpcData } = await supabase.rpc("is_admin");
    const isAdmin = Array.isArray(rpcData)
      ? rpcData[0]?.is_admin ?? false
      : rpcData ?? false;

    const redirect = isAdmin ? "/admin" : "/profile";
    console.log("Redirecting to:", redirect, "for email:", body.email);

    // ✅ Redirect correctly in Next.js API
    return NextResponse.redirect(new URL(redirect, req.url));
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
