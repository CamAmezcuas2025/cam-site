export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "home";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";

// Load admin emails safely from env
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
);

function addDaysISO(startISO: string, days: number): string {
  const d = new Date(startISO);
  d.setUTCDate(d.getUTCDate() + (Number.isFinite(days) ? days : 0));
  return d.toISOString();
}

function formatPSTYYYYMMDD(iso: string): string {
  const dt = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(dt);

  const y = parts.find(p => p.type === "year")?.value ?? "0000";
  const m = parts.find(p => p.type === "month")?.value ?? "01";
  const d = parts.find(p => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

function pickActiveMembership(memberships: any[] | null | undefined) {
  if (!memberships || memberships.length === 0) return null;
  const active = memberships.find(m => m.active === true);
  if (active) return active;
  return [...memberships].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )[0];
}

// ---- POST (signup) ---------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const supaAuth = await createServerSupabaseClient();
    const body = await req.json();

    const {
      data: { user },
      error: authError,
    } = await supaAuth.auth.signUp({
      email: body.email,
      password: body.password,
    });

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: authError?.message || "Signup failed" },
        { status: 400 }
      );
    }

    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const isParent = body.isParent || body.is_parent || false;

    const { error: insertError } = await service.from("profiles").upsert({
      id: user.id,
      full_name: body.name,
      email: body.email,
      phone: body.phone ?? "",
      avatar: body.avatar ?? "/images/default-avatar.png",
      birthDate: body.birthDate ?? null,
      nationality: body.nationality ?? "",
      hasExperience: !!body.hasExperience,
      howFound: body.howFound ?? "",
      healthInfo: body.healthInfo ?? "",
      address: body.address ?? "",
      joinDate: body.joinDate ?? null,
      nextPayment: null,
      classes: body.classes || [],
      classProgress: body.classProgress || [],
      streak: 0,
      training: body.training || {
        streak: 0,
        totalHours: 0,
        weeklyHours: 0,
        monthlyHours: 0,
      },
      role: "user",
      belt_level: null,
      student_notes: null,
      edad: body.edad ?? null,
      estatura: body.estatura ?? null,
      peso: body.peso ?? null,
      tiempoEntrenando: body.tiempoEntrenando ?? null,
      is_parent: isParent,
    });

    if (insertError) {
      console.error("Profile insert error:", insertError);
      return NextResponse.json(
        { error: "Profile creation failed" },
        { status: 500 }
      );
    }

    // Auto-promote admins based on email
    if (ADMIN_EMAILS.has((body.email || "").toLowerCase())) {
      await service
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", user.id);
    }

    // Apply membership if provided
    if (typeof body.membershipType === "string" && body.membershipType.trim()) {
      const { data: plan, error: planErr } = await service
        .from("admin_memberships")
        .select("id, duration_days")
        .eq("type", body.membershipType.trim())
        .single();

      if (!planErr && plan) {
        const startISO = body.joinDate
          ? new Date(body.joinDate).toISOString()
          : new Date().toISOString();

        const endISO = addDaysISO(startISO, plan.duration_days || 0);

        await service.from("user_memberships").insert({
          user_id: user.id,
          membership_id: plan.id,
          start_date: startISO,
          end_date: endISO,
          inscription_fee: 400.0,
          active: true,
        });
      }
    }

    return NextResponse.json({ success: true, userId: user.id, isParent });
  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---- GET (profile + membership + children) --------------------------------
export async function GET(_req: NextRequest) {
  try {
    const supaAuth = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supaAuth.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // ✅ FIXED: Added admin_notes to the SELECT
    const { data: prof, error: profErr } = await service
      .from("profiles")
      .select(`
        id, full_name, email, phone, avatar, birthDate, nationality, hasExperience, howFound,
        healthInfo, address, joinDate, nextPayment, classes, created_at, classProgress,
        streak, training, role, belt_level, student_notes, admin_notes, edad, estatura, peso,
        tiempoEntrenando, is_parent,
        user_memberships (
          id, start_date, end_date, active, inscription_fee, total_paid,
          admin_memberships:membership_id (
            id, type, name, category, price, duration_days, currency
          )
        )
      `)
      .eq("id", user.id)
      .single();

    if (profErr || !prof) {
      console.error("Profile fetch error:", profErr);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const picked = pickActiveMembership(prof.user_memberships);
    let membership = null;

    if (picked) {
      const durationDays = picked.admin_memberships?.duration_days ?? 0;
      const startISO = picked.start_date ?? null;
      const nextISO = startISO ? addDaysISO(startISO, durationDays) : null;

      membership = {
        id: picked.id,
        start_date: picked.start_date ?? null,
        end_date: picked.end_date ?? null,
        active: !!picked.active,
        plan: {
          id: picked.admin_memberships?.id ?? "",
          type: picked.admin_memberships?.type ?? null,
          name: picked.admin_memberships?.name ?? null,
          category: picked.admin_memberships?.category ?? null,
          price: picked.admin_memberships?.price ?? null,
          duration_days: picked.admin_memberships?.duration_days ?? null,
          currency: picked.admin_memberships?.currency ?? null,
        },
        nextPaymentPST: nextISO ? formatPSTYYYYMMDD(nextISO) : null,
      };
    }

    // ✅ FIXED: Added admin_notes to child query
    const { data: childLinks } = await service
      .from("children")
      .select(`
        id,
        child:child_id (
          id, full_name, "birthDate", avatar, edad, estatura, peso, "tiempoEntrenando",
          belt_level, student_notes, admin_notes, classes, created_at, streak, training
        )
      `)
      .eq("parent_id", user.id);

    const children = (childLinks || [])
      .map((row: any) => row.child)
      .filter(Boolean);

    const output: any = {
      id: prof.id,
      email: prof.email,
      phone: prof.phone,
      avatar: prof.avatar,
      birthDate: prof.birthDate,
      nationality: prof.nationality,
      hasExperience: prof.hasExperience,
      howFound: prof.howFound,
      healthInfo: prof.healthInfo,
      address: prof.address,
      joinDate: prof.joinDate,
      nextPayment: prof.nextPayment ?? (membership?.nextPaymentPST ?? null),
      classes: prof.classes,
      created_at: prof.created_at,
      classProgress: prof.classProgress,
      streak: prof.streak,
      training: prof.training,
      role: ADMIN_EMAILS.has((prof.email || "").toLowerCase())
        ? "admin"
        : prof.role,
      belt_level: prof.belt_level,
      student_notes: prof.student_notes,
      admin_notes: prof.admin_notes, // ✅ ADDED: Return admin_notes to user
      edad: prof.edad,
      estatura: prof.estatura,
      peso: prof.peso,
      tiempoEntrenando: prof.tiempoEntrenando,
      name: prof.full_name,
      isParent: prof.is_parent,
      membership,
      children,
    };

    return NextResponse.json(output);
  } catch (err) {
    console.error("GET /api/profile failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---- PUT: update profile ----------------------------------------------------
export async function PUT(req: NextRequest) {
  try {
    const supaAuth = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supaAuth.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const valid = new Set([
      "full_name","email","avatar","birthDate","nationality","hasExperience","howFound",
      "healthInfo","address","joinDate","nextPayment","classes","classProgress","streak",
      "training","role","belt_level","student_notes","edad","estatura","peso",
      "tiempoEntrenando","is_parent","phone"
    ]);

    const payload: Record<string, any> = {};

    if (body.full_name || body.fullName)
      payload.full_name = body.full_name || body.fullName;
    if ("edad" in body) payload.edad = body.edad === null ? null : Number(body.edad);
    if ("estatura" in body)
      payload.estatura = body.estatura === null ? null : Number(body.estatura);
    if ("peso" in body) payload.peso = body.peso === null ? null : Number(body.peso);
    if ("tiempoEntrenando" in body)
      payload.tiempoEntrenando = body.tiempoEntrenando;
    if ("is_parent" in body || "isParent" in body)
      payload.is_parent = body.is_parent ?? body.isParent;
    if ("phone" in body) payload.phone = body.phone;

    for (const k of Object.keys(body)) {
      if (valid.has(k) && !(k in payload)) payload[k] = body[k];
    }

    const { error: upErr } = await service
      .from("profiles")
      .update(payload)
      .eq("id", user.id);

    if (upErr) {
      console.error("Profile update error:", upErr);
      return NextResponse.json(
        { error: "Profile update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---- PATCH: avatar upload ---------------------------------------------------
export async function PATCH(req: NextRequest) {
  try {
    const supaAuth = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supaAuth.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const bucket = "avatars";
    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadErr } = await service.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
        contentType: (file as any).type,
      });

    if (uploadErr) {
      console.error("Avatar upload error:", uploadErr);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: publicData } = service.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const publicUrl = publicData?.publicUrl ?? null;

    const { error: updateErr } = await service
      .from("profiles")
      .update({ avatar: publicUrl })
      .eq("id", user.id);

    if (updateErr) {
      console.error("Avatar URL update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, avatarUrl: publicUrl });
  } catch (err) {
    console.error("PATCH /api/profile avatar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}