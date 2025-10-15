import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";
import { cookies } from "next/headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const supabase = await createServerSupabaseClient(() => Promise.resolve(cookies()));

    // Auth check
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "No user" }, { status: 401 });
    }

    // Admin check via RPC
    const { data: rpcData } = await supabase.rpc("is_admin");
    const isAdmin = Array.isArray(rpcData) ? rpcData[0]?.is_admin ?? false : rpcData ?? false;

    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update profile
    const { data, error } = await supabase
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
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    console.log(`Updated notes for user ${params.id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}