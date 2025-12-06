import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const form = await req.json();
    const { name, email, message, hp } = form;

    // Honeypot
    if (hp && hp.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // ======= BRANDED HTML TEMPLATE =======
    const html = `
      <div style="font-family: Arial, sans-serif; background:#0b0b0b; padding:30px;">
        <div style="
          max-width:620px;
          margin:0 auto;
          background:#ffffff;
          border-radius:14px;
          padding:32px;
          box-shadow:0 8px 25px rgba(0,0,0,0.25);
        ">

          <h1 style="
            font-size:26px;
            font-weight:700;
            color:#e60000;
            margin-top:0;
            margin-bottom:20px;
            text-align:center;
          ">
            Nuevo mensaje desde CAM Amezcuas
          </h1>

          <div style="font-size:16px; color:#222; line-height:1.6;">
            <p><strong style="color:#000;">Nombre:</strong><br>${name}</p>
            <p><strong style="color:#000;">Email:</strong><br>${email}</p>
            <p><strong style="color:#000;">Mensaje:</strong></p>

            <div style="
              white-space:pre-wrap;
              padding:15px;
              background:#f5f5f5;
              border-radius:10px;
              border:1px solid #ddd;
            ">
              ${message}
            </div>
          </div>

          <div style="margin-top:30px; text-align:center; color:#777; font-size:13px;">
            <p>C.A.M Amezcuas · Santa Fe, Tijuana</p>
            <p>Entrena con nosotros y lleva tu nivel más allá.</p>
          </div>

        </div>
      </div>
    `;

    // Send the email
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.CONTACT_RECEIVE_EMAIL!,
      subject: "Nuevo mensaje desde el formulario de contacto",
      html,
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje." },
      { status: 500 }
    );
  }
}
