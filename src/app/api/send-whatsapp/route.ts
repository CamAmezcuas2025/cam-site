// app/api/send-whatsapp/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    console.log("📩 New WhatsApp lead (placeholder):", {
      name,
      email,
      message,
    });

    // --- WhatsApp Cloud API integration (placeholder) ---
    // Later replace with:
    // const res = await fetch(
    //   `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       messaging_product: "whatsapp",
    //       to: process.env.ADMIN_PHONE, // your number
    //       type: "text",
    //       text: { body: "Gracias por contactarnos, pronto te responderemos 👊🔥" },
    //     }),
    //   }
    // );

    // Return fake success for now
    return NextResponse.json({ ok: true, message: "WhatsApp placeholder sent" });
  } catch (err) {
    console.error("❌ WhatsApp API error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to send WhatsApp message" },
      { status: 500 }
    );
  }
}
