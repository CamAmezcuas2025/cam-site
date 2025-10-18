import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user)
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    // ...your existing insert logic
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error inesperado.", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
