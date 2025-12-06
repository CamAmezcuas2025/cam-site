// ✅ src/app/api/upload-child-avatar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const childId = formData.get("childId") as string | null;

    if (!file || !childId) {
      return NextResponse.json({ error: "Missing file or childId" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `${childId}.${fileExt}`; // ✅ fixed template literal syntax

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ upload to your 'child_avatars' bucket
    const { error: uploadError } = await supabase.storage
      .from("child_avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // ✅ get a public URL for the uploaded file
    const { data: publicData } = supabase.storage
      .from("child_avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicData?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json({ error: "Could not generate public URL" }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("upload-child-avatar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
