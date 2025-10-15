// app/api/sendReminderEmails/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

// ========== CONFIG ==========
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Gmail transport
const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ========== HANDLER ==========
export async function GET(req: NextRequest) {
  try {
    // Pull memberships expiring in 5 days or already expired
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
      // TEMP for testing — fetch all active memberships regardless of end date
.eq("active", true);


    if (error) throw error;

    if (!expiring || expiring.length === 0) {
      return NextResponse.json({ message: "No upcoming expirations." });
    }

    // Loop through each record and send reminder
    for (const record of expiring) {
      const user = record.profiles?.[0];
      const membership = record.admin_memberships?.[0];

      if (!user?.email) continue;

      const endDate = new Date(record.end_date).toLocaleDateString("es-MX", {
        timeZone: "America/Tijuana",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const html = `
        <div style="font-family:Arial, sans-serif; line-height:1.6;">
          <h2 style="color:#e60000;">Hola ${user.full_name || "Miembro"},</h2>
          <p>Te recordamos que tu membresía <strong>${membership?.type}</strong> vence el <strong>${endDate}</strong>.</p>
          <p>Por favor realiza tu pago lo antes posible para evitar interrupciones en tus clases.</p>
          <p>Gracias por entrenar con nosotros 💪</p>
          <p style="margin-top:20px;">C.A.M Amezcuas</p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
        to: user.email,
        subject: `Recordatorio: tu membresía ${membership?.type} está por vencer`,
        html,
      });
    }

    return NextResponse.json({
      success: true,
      count: expiring.length,
      message: `Recordatorios enviados a ${expiring.length} miembro(s).`,
    });
  } catch (err: any) {
    console.error("Reminder email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}