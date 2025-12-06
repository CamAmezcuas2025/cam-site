// src/app/api/admin/users/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "home";

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";
import { createClient } from "@supabase/supabase-js";

// Load admin emails from env
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

type PatchBody = Partial<{
  student_notes: string | null;
  belt_level: string | null;
}>;

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body: PatchBody = await req.json();

    // 1) Auth: require logged-in user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "No user" }, { status: 401 });
    }

    // 2) Admin check
    const userEmail = user.email?.toLowerCase() ?? "";
    const isAdmin = ADMIN_EMAILS.includes(userEmail);

    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 3) Validate payload
    const updatePayload: Record<string, any> = {};

    if (Object.hasOwn(body, "student_notes")) {
      updatePayload.student_notes = body.student_notes;
    }
    if (Object.hasOwn(body, "belt_level")) {
      updatePayload.belt_level = body.belt_level;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nothing to update",
      });
    }

    // 4) Privileged update
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data, error } = await serviceSupabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", id)
      .select("student_notes, belt_level")
      .single();

    if (error) {
      console.error("Admin update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("PATCH /api/admin/users/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
