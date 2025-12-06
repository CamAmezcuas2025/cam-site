import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { reminderTemplate } from "@/app/emails/reminder-template";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// ✅ EXISTING GET METHOD (bulk reminders - keeps working as before)
export async function GET() {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const { data: expiring, error } = await supabase
      .from("user_memberships")
      .select(
        `
        id,
        user_id,
        membership_id,
        start_date,
        end_date,
        active,
        profiles ( full_name, email ),
        admin_memberships ( type )
      `
      )
      .eq("active", true)
      .lte("end_date", threeDaysFromNow.toISOString());

    if (error) throw error;
    if (!expiring || expiring.length === 0) {
      return NextResponse.json({
        message: "No memberships expiring soon."
      });
    }

    let sentCount = 0;

    for (const record of expiring) {
      const profiles = Array.isArray(record.profiles)
        ? record.profiles[0]
        : record.profiles;

      const membership = Array.isArray(record.admin_memberships)
        ? record.admin_memberships[0]
        : record.admin_memberships;

      const email = profiles?.email;
      const fullName = profiles?.full_name || "Miembro";
      const type = membership?.type;

      if (!email || !type) continue;

      const endDate = new Date(record.end_date).toLocaleDateString("es-MX", {
        timeZone: "America/Tijuana",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // BRANDED HTML TEMPLATE
      const html = reminderTemplate({
        name: fullName,
        type,
        endDate
      });

      // SEND THE EMAIL
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: `Tu membresía ${type} está por vencer`,
        html,
      });

      // UPDATE REMINDER TIMESTAMP
      await supabase
        .from("user_memberships")
        .update({
          last_reminder_sent: new Date().toISOString()
        })
        .eq("id", record.id);

      sentCount++;
    }

    return NextResponse.json({
      success: true,
      count: sentCount,
      message: `Recordatorios enviados a ${sentCount} miembro(s).`,
    });

  } catch (err: any) {
    console.error("Reminder email error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// ✅ NEW POST METHOD (single user reminder from admin dashboard)
export async function POST(req: Request) {
  try {
    const { email, fullName } = await req.json();

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Email y nombre son requeridos" },
        { status: 400 }
      );
    }

    // Get user's membership info
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Get membership details
    const { data: membership } = await supabase
      .from("user_memberships")
      .select(
        `
        end_date,
        admin_memberships!inner ( type )
      `
      )
      .eq("user_id", profile.id)
      .eq("active", true)
      .single();

    const adminMembership = membership?.admin_memberships as any;
    const membershipType = adminMembership?.type || "Membresía";
    const endDate = membership?.end_date 
      ? new Date(membership.end_date).toLocaleDateString("es-MX", {
          timeZone: "America/Tijuana",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Próximamente";

    // Generate HTML using your template
    const html = reminderTemplate({
      name: fullName,
      type: membershipType,
      endDate
    });

    // Send email
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: `Recordatorio: Tu membresía ${membershipType} requiere renovación`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Error al enviar correo", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, messageId: data?.id },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("POST reminder email error:", err);
    return NextResponse.json(
      { error: err.message || "Error inesperado" },
      { status: 500 }
    );
  }
}