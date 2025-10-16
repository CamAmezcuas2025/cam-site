import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";
import { cookies } from "next/headers";

const ADMIN_EMAILS = [
  "asesorjosueamezkua@gmail.com",
  "andreaonofremarquez@gmail.com",
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ✅ FIXED: must await the helper
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: { data: { full_name: body.name } },
    });

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: authError?.message || "Signup failed" },
        { status: 400 }
      );
    }

    console.log("User signed up:", { id: user.id, email: body.email });

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await serviceSupabase.from("profiles").upsert({
      id: user.id,
      full_name: body.name,
      email: body.email,
      avatar: body.avatar,
      birthDate: body.birthDate,
      nationality: body.nationality,
      hasExperience: body.hasExperience,
      howFound: body.howFound,
      healthInfo: body.healthInfo,
      underage: body.isMinor,
      parentName: body.parentName || "",
      parentPhone: body.parentPhone || "",
      address: body.address,
      joinDate: body.joinDate,
      nextPayment: null,
      classes: body.classes || [],
      classProgress: body.classProgress || [],
      streak: 0,
      training:
        body.training || {
          streak: 0,
          totalHours: 0,
          weeklyHours: 0,
          monthlyHours: 0,
        },
      role: "user",
      belt_level: null,
      student_notes: null,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Profile creation failed" },
        { status: 500 }
      );
    }

    console.log("Profile inserted with default role 'user' for:", body.email);

    if (ADMIN_EMAILS.includes(body.email as any)) {
      const { error: roleError } = await serviceSupabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", user.id);

      if (roleError) {
        console.error(
          "Role update FAILED for admin:",
          body.email,
          roleError
        );
      } else {
        console.log("SUCCESS: Set admin role for:", body.email);
      }
    } else {
      console.log("Non-admin email, role remains 'user':", body.email);
    }

    if (body.membershipType) {
      await serviceSupabase.from("user_memberships").insert({
        user_id: user.id,
        type: body.membershipType,
        start_date: body.joinDate,
      });
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // ✅ FIXED: must await the helper
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("GET auth error:", userError);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("is_admin");
  const isAdmin = Array.isArray(rpcData)
    ? rpcData[0]?.is_admin ?? false
    : rpcData ?? false;

  console.log("RPC is_admin returned:", isAdmin, "for user:", user.id);

  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: profile, error } = await serviceSupabase
    .from("profiles")
    .select(
      `
      id, full_name, email, avatar, birthDate, nationality, hasExperience, howFound, 
      healthInfo, underage, parentName, parentPhone, address, joinDate, nextPayment, 
      classes, created_at, classProgress, streak, training, role, belt_level, student_notes
    `
    )
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  console.log("DB role from fetch:", profile.role, "for email:", profile.email);

  (profile as any).name = profile.full_name;
  delete profile.full_name;

  (profile as any).isMinor = profile.underage;
  delete profile.underage;

  profile.role = isAdmin ? "admin" : profile.role;
  console.log("Final role after override:", profile.role);

  // 👇 Auto-calculate nextPayment if null, based on joinDate anniversary in PST
  if (!profile.nextPayment && profile.joinDate) {
    const anniversaryDay = parseInt(profile.joinDate.split("-")[2]);

    const nowPSTStr = new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [nowMonthStr, nowDayStr, nowYearStr] = nowPSTStr.split("/");
    const nowYear = parseInt(nowYearStr);
    const nowMonth = parseInt(nowMonthStr) - 1;
    const nowDay = parseInt(nowDayStr);

    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

    const thisMonthDays = daysInMonth(nowYear, nowMonth);
    let thisMonthTargetDay = Math.min(anniversaryDay, thisMonthDays);

    let nextDueYear = nowYear;
    let nextDueMonth = nowMonth;
    let nextDueDay = thisMonthTargetDay;

    if (thisMonthTargetDay <= nowDay) {
      nextDueMonth += 1;
      if (nextDueMonth > 11) {
        nextDueMonth = 0;
        nextDueYear += 1;
      }
      const nextMonthDays = daysInMonth(nextDueYear, nextDueMonth);
      nextDueDay = Math.min(anniversaryDay, nextMonthDays);
    }

    const nextMonthPadded = String(nextDueMonth + 1).padStart(2, "0");
    const nextDayPadded = String(nextDueDay).padStart(2, "0");
    profile.nextPayment = `${nextDueYear}-${nextMonthPadded}-${nextDayPadded}`;

    console.log(
      "Computed nextPayment:",
      profile.nextPayment,
      "from joinDate:",
      profile.joinDate
    );
  }

  return NextResponse.json(profile);
}
