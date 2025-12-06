import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";
import { cookies } from "next/headers"; // ✅ required if using cookies internally

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { className, date, hours } = body;

  // ✅ must await the async helper
  const supabase = await createServerSupabaseClient();


  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "No user" }, { status: 401 });
  }

  if (!className || !date || !hours) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  const logDate = new Date(date);
  const logHours = Number(hours);

  // Insert to hours_logs for history
  const { error: logError } = await supabase.from("hours_logs").insert({
    user_id: user.id,
    class_name: className,
    date: logDate,
    hours: logHours,
  });

  if (logError) {
    console.error("Log insert error:", logError);
    return NextResponse.json(
      { error: "Error al registrar horas" },
      { status: 500 }
    );
  }

  // Upsert to profiles for totals/streak
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!currentProfile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Calc new totals (sum all logs for class)
  const { data: classLogs } = await supabase
    .from("hours_logs")
    .select("hours")
    .eq("user_id", user.id)
    .eq("class_name", className);

  const totalHours =
    classLogs?.reduce((sum, log) => sum + log.hours, 0) || 0;

  // Simple streak calc (consecutive days with logs—expand later)
  const { data: recentLogs } = await supabase
    .from("hours_logs")
    .select("date")
    .eq("user_id", user.id)
    .gte(
      "date",
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    );

  const streak = recentLogs?.length || 0;

  // Upsert classProgress in profiles (JSONB)
  const classProgress = currentProfile.classProgress || [];
  const classIndex = classProgress.findIndex((p) => p.name === className);

  if (classIndex > -1) {
    classProgress[classIndex].totalHours = totalHours;
  } else {
    classProgress.push({
      name: className,
      weeklyHours: 0,
      monthlyHours: 0,
      totalHours,
    });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      classProgress,
      training: {
        ...currentProfile.training,
        totalHours: (currentProfile.training?.totalHours || 0) + logHours,
      },
      streak,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Profile update error:", updateError);
    return NextResponse.json(
      { error: "Error al actualizar progreso" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
