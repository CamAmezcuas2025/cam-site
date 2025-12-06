import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("child_class_logs")
      .select(`
        id,
        created_at,
        class_name,
        hours,
        logged_by,
        child:child_id (
          id,
          full_name,
          belt_level
        ),
        children!inner (
          parent:parent_id (
            id,
            full_name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching child class logs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten for frontend
    const formatted = (data || []).map((log: any) => ({
      id: log.id,
      date: new Date(log.created_at).toLocaleString("es-MX", {
        timeZone: "America/Tijuana",
      }),
      class_name: log.class_name,
      hours: log.hours,
      child_name: log.child?.full_name || "—",
      belt_level: log.child?.belt_level || "—",
      parent_name: log.children?.[0]?.parent?.full_name || "—",
      logged_by: log.logged_by || "admin",
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("Unexpected error in GET /api/children/child-classes/get-logs:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
