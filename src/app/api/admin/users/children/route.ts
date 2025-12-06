// src/app/api/admin/users/children/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "home";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const service = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  try {
    const supaAuth = await createServerSupabaseClient();
    const {
      data: { user },
      error: userErr,
    } = await supaAuth.auth.getUser();

    if (userErr || !user) {
      return cors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    const { data: isAdminRpc, error: rpcErr } = await supaAuth.rpc("is_admin");
    if (rpcErr) {
      console.error("is_admin RPC error:", rpcErr);
      return cors(NextResponse.json({ error: "Role check failed" }, { status: 500 }));
    }
    const isAdmin =
      Array.isArray(isAdminRpc) ? !!isAdminRpc[0]?.is_admin : !!isAdminRpc;
    if (!isAdmin) {
      return cors(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    }

    // 1️⃣ Link rows
    const { data: links, error: linkErr } = await service
      .from("children")
      .select("id, parent_id, child_id, created_at")
      .order("created_at", { ascending: false });

    if (linkErr) throw linkErr;
    if (!links?.length)
      return cors(NextResponse.json([], { headers: { "Cache-Control": "no-store" } }));

    // 2️⃣ Unique IDs
    const parentIds = [...new Set(links.map((r) => r.parent_id).filter(Boolean))];
    const childIds = [...new Set(links.map((r) => r.child_id).filter(Boolean))];

    // 3️⃣ Fetch both sides — removed `avatar` from child_profiles
    const [{ data: parents, error: pErr }, { data: kids, error: cErr }] =
      await Promise.all([
        service
          .from("profiles")
          .select("id, full_name, email, avatar")
          .in("id", parentIds),
        service
          .from("child_profiles")
          .select(
            "id, full_name, edad, estatura, peso, tiempoEntrenando, belt_level, student_notes, classes, training"
          )
          .in("id", childIds),
      ]);

    if (pErr) throw pErr;
    if (cErr) throw cErr;

    const parentsById = Object.fromEntries((parents || []).map((p) => [p.id, p]));
    const childrenById = Object.fromEntries((kids || []).map((c) => [c.id, c]));

    // 4️⃣ Merge and return
    const result = links.map((link) => {
      const parent = parentsById[link.parent_id] || {};
      const child = childrenById[link.child_id] || {};

      return {
        id: link.id,
        created_at: link.created_at,
        parent_id: link.parent_id,
        parent_name: parent.full_name ?? null,
        parent_email: parent.email ?? null,
        parent_avatar: parent.avatar || "/images/default-avatar.png",
        child_id: link.child_id,
        child_name: child.full_name ?? null,
        avatar: "/images/default-avatar.png", // default since child_profiles has no avatar
        edad: child.edad ?? null,
        estatura: child.estatura ?? null,
        peso: child.peso ?? null,
        tiempoEntrenando: child.tiempoEntrenando ?? null,
        belt_level: child.belt_level ?? null,
        student_notes: child.student_notes ?? null,
        classes: Array.isArray(child.classes) ? child.classes : [],
        training:
          child.training && typeof child.training === "object"
            ? child.training
            : { streak: 0, totalHours: 0, weeklyHours: 0, monthlyHours: 0 },
      };
    });

    return cors(
      NextResponse.json(result, { headers: { "Cache-Control": "no-store" } })
    );
  } catch (err: any) {
    console.error("GET /api/admin/users/children error:", err);
    return cors(NextResponse.json({ error: err.message }, { status: 500 }));
  }
}
