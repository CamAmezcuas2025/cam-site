// app/api/videos/delete-from-spaces/route.ts
import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request) {
  try {
    // Load env vars inside handler (prevents build-time crash)
    const REGION = process.env.SPACES_REGION;
    const ENDPOINT = process.env.SPACES_ENDPOINT;
    const BUCKET = process.env.SPACES_BUCKET;
    const ACCESS_KEY = process.env.SPACES_ACCESS_KEY_ID;
    const SECRET_KEY = process.env.SPACES_SECRET_ACCESS_KEY;

    if (!REGION || !ENDPOINT || !BUCKET || !ACCESS_KEY || !SECRET_KEY) {
      console.error("Missing DO spaces vars:", {
        REGION: !!REGION,
        ENDPOINT: !!ENDPOINT,
        BUCKET: !!BUCKET,
        ACCESS_KEY: !!ACCESS_KEY,
        SECRET_KEY: !!SECRET_KEY,
      });

      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const s3 = new S3Client({
      region: REGION,
      endpoint: ENDPOINT,
      forcePathStyle: false,
      credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
      },
    });

    const { key } = await req.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'key'" },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    await s3.send(command);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DO DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
