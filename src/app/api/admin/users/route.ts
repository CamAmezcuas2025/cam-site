import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";
import { cookies } from "next/headers";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar?: string;
  joinDate?: string;
  classes?: string[];
  role: string;
  student_notes?: string;
  belt_level?: string;
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient(() => Promise.resolve(cookies()));

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "No user" }, { status: 401 });
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (!isAdmin) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: profiles, error } = await serviceSupabase
    .from("profiles")
    .select("id, full_name, email, avatar, joinDate, classes, role, student_notes, belt_level")
    .eq("role", "user")  // 👇 Uncommented: Filters to only users (excludes admins)
    .order("joinDate", { ascending: false });

  if (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  console.log("Fetched profiles count:", profiles?.length || 0);  // 👇 Debug log

  return NextResponse.json(profiles || []);
}