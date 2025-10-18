import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

type ChildPayload = {
  full_name: string;
  birthDate?: string | null;
  edad?: number | string | null;
  estatura?: number | string | null;
  peso?: number | string | null;
  tiempoEntrenando?: string | null;
  belt_level?: string | null;
  student_notes?: string | null;
  classes?: string[];
};

// POST /api/children
export async function POST(req: Request) {
  try {
    // ✅ FIX for Next.js 15+: pass cookies function directly (do NOT await)
    const supabase = createRouteHandlerClient({ cookies });

    // 1️⃣ Who is the parent?
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user)
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const parentId = user.id;

    // 2️⃣ Make sure parent profile exists
    const { data: parentProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", parentId)
      .single();

    if (profileErr || !parentProfile)
      return NextResponse.json(
        { error: "Perfil de padre/madre no encontrado." },
        { status: 404 }
      );

    if (parentProfile.role === "child")
      return NextResponse.json(
        { error: "Una cuenta de menor no puede registrar hijos." },
        { status: 403 }
      );

    // 3️⃣ Parse and validate body
    const body = (await req.json()) as ChildPayload;
    if (!body.full_name || typeof body.full_name !== "string")
      return NextResponse.json(
        { error: "El nombre completo del alumno es obligatorio." },
        { status: 400 }
      );

    const num = (v: unknown) =>
      v === null || v === undefined || v === "" ? null : Number(v);

    const childData = {
      full_name: body.full_name.trim(),
      birthDate: body.birthDate ?? null,
      edad: num(body.edad),
      estatura: num(body.estatura),
      peso: num(body.peso),
      tiempoEntrenando: body.tiempoEntrenando ?? null,
      belt_level: body.belt_level ?? null,
      student_notes: body.student_notes ?? null,
      classes: Array.isArray(body.classes) ? body.classes : [],
    };

    // 4️⃣ Insert into child_profiles
    const { data: newChild, error: childErr } = await supabase
      .from("child_profiles")
      .insert(childData)
      .select("*")
      .single();

    if (childErr)
      return NextResponse.json(
        {
          error: "No se pudo crear el perfil del alumno.",
          details: childErr.message,
        },
        { status: 400 }
      );

    // 5️⃣ Link to parent
    const { data: linkRow, error: linkErr } = await supabase
      .from("children")
      .insert({ parent_id: parentId, child_id: newChild.id })
      .select("*")
      .single();

    if (linkErr) {
      await supabase.from("child_profiles").delete().eq("id", newChild.id);
      return NextResponse.json(
        {
          error: "No se pudo vincular el alumno con el padre/madre.",
          details: linkErr.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { child: newChild, link: linkRow },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error inesperado.", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
