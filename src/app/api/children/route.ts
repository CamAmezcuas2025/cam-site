import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";

type ChildPayload = {
  full_name?: string;
  name?: string;
  birthDate?: string | null;
  avatar?: string | null;
  edad?: number | string | null;
  estatura?: number | string | null;
  peso?: number | string | null;
  tiempoEntrenando?: string | null;
  belt_level?: string | null;
  beltLevel?: string | null;
  student_notes?: string | null;
  classes?: string[];
};

// ✅ GET /api/children
export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user)
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const parentId = user.id;

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
        { error: "Una cuenta de menor no puede ver hijos." },
        { status: 403 }
      );

    // ✅ Define service client
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: children, error: fetchErr } = await serviceSupabase
      .from("child_profiles")
      .select(`
        *,
        streak,
        training,
        children!inner(parent_id)
      `)
      .eq("children.parent_id", parentId);

    if (fetchErr)
      return NextResponse.json(
        { error: "No se pudieron cargar los alumnos.", details: fetchErr.message },
        { status: 500 }
      );

    return NextResponse.json({ children: children || [] });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error inesperado.", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

// ✅ POST /api/children
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user)
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const parentId = user.id;

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

    const body = (await req.json()) as ChildPayload;
    console.log("POST children body received:", JSON.stringify(body, null, 2));

    const mappedBody = {
      ...body,
      full_name: body.full_name || body.name,
      belt_level: body.belt_level || body.beltLevel,
    };

    if (!mappedBody.full_name || typeof mappedBody.full_name !== "string")
      return NextResponse.json(
        { error: "El nombre completo del alumno es obligatorio." },
        { status: 400 }
      );

    const num = (v: unknown) =>
      v === null || v === undefined || v === "" ? null : Number(v);

    const childData = {
      full_name: mappedBody.full_name.trim(),
      birthDate: body.birthDate ?? null,
      edad: num(body.edad),
      estatura: num(body.estatura),
      peso: num(body.peso),
      tiempoEntrenando: body.tiempoEntrenando ?? null,
      belt_level: mappedBody.belt_level ?? null,
      student_notes: body.student_notes ?? null,
      classes: Array.isArray(body.classes) ? body.classes : [],
    };

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: newChild, error: childErr } = await serviceSupabase
      .from("child_profiles")
      .insert(childData)
      .select("*")
      .single();

    if (childErr)
      return NextResponse.json(
        { error: "No se pudo crear el perfil del alumno.", details: childErr.message },
        { status: 400 }
      );

    const { data: linkRow, error: linkErr } = await serviceSupabase
      .from("children")
      .insert({ parent_id: parentId, child_id: newChild.id })
      .select("*")
      .single();

    if (linkErr) {
      await serviceSupabase.from("child_profiles").delete().eq("id", newChild.id);
      return NextResponse.json(
        {
          error: "No se pudo vincular el alumno con el padre/madre.",
          details: linkErr.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ child: newChild, link: linkRow }, { status: 201 });
  } catch (e: any) {
    console.error("POST children error:", e);
    return NextResponse.json(
      { error: "Error inesperado.", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

// ✅ PUT /api/children
export async function PUT(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    if (authErr || !user)
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const userId = user.id;

    const { data: userProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, role, is_parent")
      .eq("id", userId)
      .single();

    if (profileErr || !userProfile || userProfile.role === "child")
      return NextResponse.json(
        { error: "Acceso denegado para actualizar alumnos." },
        { status: 403 }
      );

    const { data: rpcData, error: rpcErr } = await serviceSupabase.rpc("is_admin");
    if (rpcErr) console.error("is_admin RPC error:", rpcErr);
    const isAdmin = Array.isArray(rpcData)
      ? rpcData[0]?.is_admin ?? false
      : !!rpcData;

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");
    if (!childId)
      return NextResponse.json(
        { error: "ID del alumno requerido (usa ?childId=uuid)." },
        { status: 400 }
      );

    let link;
    if (!isAdmin) {
      const { data: linkData, error: linkErr } = await supabase
        .from("children")
        .select("id")
        .eq("parent_id", userId)
        .eq("child_id", childId)
        .single();

      if (linkErr && linkErr.code !== "PGRST116")
        return NextResponse.json(
          { error: "Error verificando acceso al alumno.", details: linkErr.message },
          { status: 500 }
        );

      if (!linkData) {
        const { data: newLink, error: createLinkErr } = await serviceSupabase
          .from("children")
          .insert({ parent_id: userId, child_id: childId })
          .select("id")
          .single();

        if (createLinkErr)
          return NextResponse.json(
            { error: "No se pudo vincular el alumno.", details: createLinkErr.message },
            { status: 400 }
          );
        link = newLink;
      } else {
        link = linkData;
      }
    }

    const body = (await req.json()) as Partial<ChildPayload>;
    const mappedBody = {
      ...body,
      full_name: body.full_name || body.name,
      belt_level: body.belt_level || body.beltLevel,
    };

    // Only validate full_name if it's being updated
    if (body.full_name !== undefined && (!mappedBody.full_name || typeof mappedBody.full_name !== "string")) {
      return NextResponse.json(
        { error: "El nombre completo del alumno es obligatorio." },
        { status: 400 }
      );
    }

    const num = (v: unknown) =>
      v === null || v === undefined || v === "" ? null : Number(v);

    const updateData = {
      full_name: mappedBody.full_name !== undefined ? mappedBody.full_name.trim() : undefined,
      birthDate: body.birthDate ?? undefined,
      avatar: body.avatar ?? undefined,
      edad: body.edad !== undefined ? num(body.edad) : undefined,
      estatura: body.estatura !== undefined ? num(body.estatura) : undefined,
      peso: body.peso !== undefined ? num(body.peso) : undefined,
      tiempoEntrenando: body.tiempoEntrenando ?? undefined,
      belt_level: mappedBody.belt_level ?? undefined,
      student_notes: body.student_notes ?? undefined,
      classes: Array.isArray(body.classes) ? body.classes : undefined,
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    // Ensure at least one field to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron campos para actualizar." },
        { status: 400 }
      );
    }

    const { data: updatedChild, error: updateErr } = await serviceSupabase
      .from("child_profiles")
      .update(updateData)
      .eq("id", childId)
      .select("*")
      .single();

    if (updateErr)
      return NextResponse.json(
        { error: "No se pudo actualizar el perfil del alumno.", details: updateErr.message },
        { status: 500 }
      );

    return NextResponse.json({ child: updatedChild }, { status: 200 });
  } catch (e: any) {
    console.error("PUT children error:", e);
    return NextResponse.json(
      { error: "Error inesperado.", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/children - FIXED VERSION
export async function DELETE(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    if (authErr || !user)
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const parentId = user.id;
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");

    if (!childId)
      return NextResponse.json(
        { error: "ID del alumno requerido (usa ?childId=uuid)." },
        { status: 400 }
      );

    // Verify ownership
    const { data: link, error: linkErr } = await supabase
      .from("children")
      .select("id")
      .eq("parent_id", parentId)
      .eq("child_id", childId)
      .single();

    if (linkErr || !link)
      return NextResponse.json(
        { error: "Alumno no encontrado o no autorizado." },
        { status: 404 }
      );

    // ✅ STEP 1: Delete from junction table (children)
    const { error: junctionDeleteErr } = await serviceSupabase
      .from("children")
      .delete()
      .eq("id", link.id);

    if (junctionDeleteErr)
      return NextResponse.json(
        { error: "No se pudo eliminar la relación.", details: junctionDeleteErr.message },
        { status: 500 }
      );

    // ✅ STEP 2: Delete from child_profiles table
    const { error: profileDeleteErr } = await serviceSupabase
      .from("child_profiles")
      .delete()
      .eq("id", childId);

    if (profileDeleteErr)
      return NextResponse.json(
        { error: "No se pudo eliminar el perfil del alumno.", details: profileDeleteErr.message },
        { status: 500 }
      );

    return NextResponse.json({ success: true, message: "Alumno eliminado completamente" }, { status: 200 });
  } catch (e: any) {
    console.error("DELETE children error:", e);
    return NextResponse.json(
      { error: "Error inesperado.", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}