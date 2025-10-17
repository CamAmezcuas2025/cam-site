import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers"; // ✅ keep this
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";
import { createClient } from "@supabase/supabase-js"; // ✅ NEW import (service client)

export async function PATCH(req: NextRequest, context: any) {
  try {
    const { params } = context as { params: { id: string } };
    const body = await req.json();

    // ✅ Await the async helper
    const supabase = await createServerSupabaseClient();

    // ✅ Auth check
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user)
      return NextResponse.json({ error: "No user" }, { status: 401 });

    // ✅ Admin check
    const { data: rpcData } = await supabase.rpc("is_admin");
    const isAdmin = Array.isArray(rpcData)
      ? rpcData[0]?.is_admin ?? false
      : rpcData ?? false;

    if (!isAdmin)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    // ✅ Use service role client for privileged update
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // ✅ Update record using service client (bypasses RLS safely)
    const { data, error } = await serviceSupabase
      .from("profiles")
      .update({
        student_notes: body.student_notes,
        belt_level: body.belt_level,
      })
      .eq("id", params.id)
      .select("student_notes, belt_level")
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Updated notes for user ${params.id}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
