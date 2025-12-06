import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const body = await req.json() as any;
    console.log("Waiver body received:", body);

    // Validate required fields
    if (!body.participant_name || !body.signature_url || !body.accepted_esign_law) {
      return NextResponse.json({ error: "Campos obligatorios faltantes." }, { status: 400 });
    }

    // Check for existing waiver (prevent duplicates)
    const { data: existing, error: checkErr } = await supabase
      .from("waivers")
      .select("id")
      .eq("user_id", user.id)
      .eq("revoked", false)
      .single();

    if (!checkErr && existing) {
      return NextResponse.json({ error: "Ya has firmado la carta responsiva." }, { status: 409 });
    }

    // Service client for insert
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const waiverData = {
      participant_name: body.participant_name,
      participant_email: body.participant_email,
      participant_age: Number(body.participant_age),
      is_minor: !!body.is_minor,
      guardian_name: body.guardian_name || null,
      guardian_relation: body.guardian_relation || null,
      signature_url: body.signature_url,
      gym_owner_1: body.gym_owner_1,
      gym_owner_2: body.gym_owner_2,
      accepted_esign_law: !!body.accepted_esign_law,
      allowed_marketing: !!body.allowed_marketing,
      user_id: user.id,
      status: "signed",
      revoked: false,
    };

    const { data: newWaiver, error: insertErr } = await service
      .from("waivers")
      .insert(waiverData)
      .select("*")
      .single();

    if (insertErr) {
      console.error("Waiver insert error:", insertErr);
      return NextResponse.json({ error: "Error al guardar la firma." }, { status: 500 });
    }

    return NextResponse.json({ success: true, waiverId: newWaiver.id }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/waiver error:", err);
    return NextResponse.json({ error: "Error del servidor." }, { status: 500 });
  }
}