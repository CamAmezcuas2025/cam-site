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
          background:linear-gradient(135deg, #0b0b0b 0%, #1a1a1a 100%);
          border-radius:14px;
          padding:32px;
          box-shadow:0 8px 25px rgba(230,0,0,0.3);
          border:1px solid #e60000;
        ">

          <div style="text-align:center; margin-bottom:25px;">
            <h1 style="
              font-size:28px;
              font-weight:700;
              color:#e60000;
              margin:0;
              padding:15px;
              background:linear-gradient(45deg, #e60000, #ff3333);
              -webkit-background-clip:text;
              -webkit-text-fill-color:transparent;
              background-clip:text;
              text-align:center;
              border-radius:8px;
              border:2px solid #e60000;
            ">
              🥊 Nuevo mensaje desde CAM Amezcuas
            </h1>
          </div>

          <div style="font-size:16px; color:#e6e6e6; line-height:1.7; background:#1a1a1a; padding:25px; border-radius:12px; border:1px solid #333;">
            <div style="display:flex; flex-direction:column; gap:20px;">
              <div style="display:flex; flex-direction:column;">
                <span style="color:#ff6666; font-weight:600; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px;">Nombre</span>
                <div style="background:#222; padding:12px 15px; border-radius:8px; border-left:4px solid #e60000;">
                  <span style="color:#fff;">${name}</span>
                </div>
              </div>
              
              <div style="display:flex; flex-direction:column;">
                <span style="color:#ff6666; font-weight:600; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px;">Email</span>
                <div style="background:#222; padding:12px 15px; border-radius:8px; border-left:4px solid #e60000;">
                  <span style="color:#fff;">${email}</span>
                </div>
              </div>
              
              <div style="display:flex; flex-direction:column;">
                <span style="color:#ff6666; font-weight:600; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px;">Mensaje</span>
                <div style="background:#222; padding:15px; border-radius:8px; border:1px solid #333; min-height:100px;">
                  <span style="color:#fff; white-space:pre-wrap; line-height:1.6;">${message}</span>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top:30px; text-align:center; color:#777; font-size:13px; padding-top:20px; border-top:1px solid #333;">
            <p style="margin:5px 0; color:#e60000; font-weight:600;">C.A.M Amezcuas · Santa Fe, Tijuana</p>
            <p style="margin:5px 0; color:#aaa;">Entrena con nosotros y lleva tu nivel más allá.</p>
            <p style="margin:5px 0; color:#666;">📞 +52 664 342 8308 | 📧 amezcuastijuanafightingclub@gmail.com</p>
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
