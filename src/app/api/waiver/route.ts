import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";

export async function POST(req: NextRequest) {
  try {
    // ✅ Await the async helper so we get the client, not a Promise
    const supabase = await createServerSupabaseClient();

    // Ensure the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Prevent duplicate active waiver for this user
    const { data: existing } = await supabase
      .from("waivers")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "signed")
      .eq("revoked", false)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Ya has firmado el documento." },
        { status: 400 }
      );
    }

    // Map incoming form fields explicitly to existing DB columns
    const isMinor: boolean = !!body.is_minor;

    const participantName: string | null = isMinor
      ? body.minor_name ?? null
      : body.participant_name ?? null;

    const participantAgeRaw = isMinor ? body.minor_age : body.participant_age;
    const participantAge =
      participantAgeRaw !== undefined && participantAgeRaw !== null
        ? Number(participantAgeRaw)
        : null;

    const owners: string[] =
      typeof body.owners === "string" ? body.owners.split(",") : [];
    const gym_owner_1: string | null = owners[0]?.trim() || null;
    const gym_owner_2: string | null = owners[1]?.trim() || null;

    const insertBody = {
      // linkage + status
      user_id: user.id,
      status: "signed" as const,
      revoked: false,

      // participant
      participant_name: participantName,
      participant_email: body.participant_email ?? null,
      participant_age: Number.isFinite(participantAge) ? participantAge : null,
      is_minor: isMinor,

      // guardian (only if minor)
      guardian_name: isMinor ? body.guardian_name ?? null : null,
      guardian_relation: isMinor ? body.guardian_relation ?? null : null,

      // signature proof
      signature_url: body.signature_url ?? null,

      // owners
      gym_owner_1,
      gym_owner_2,

      // consent flags
      accepted_esign_law: !!body.accepted_esign_law,
      allowed_marketing: !!body.allow_image_rights,
    };

    const { data, error } = await supabase
      .from("waivers")
      .insert(insertBody)
      .select("*")
      .single();

    if (error) {
      console.error("Waiver insert error:", error);
      return NextResponse.json(
        { error: "Error al guardar el waiver" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Waiver POST exception:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
