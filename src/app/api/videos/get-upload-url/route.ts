// app/api/videos/get-upload-url/route.ts
import { NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
  try {
    const REGION = process.env.DO_REGION;
    const BUCKET = process.env.DO_BUCKET;
    const ACCESS_KEY = process.env.SPACES_ACCESS_KEY_ID;
    const SECRET_KEY = process.env.SPACES_SECRET_ACCESS_KEY;
    const SPACES_ENDPOINT = process.env.DO_ENDPOINT;

    if (!REGION || !BUCKET || !ACCESS_KEY || !SECRET_KEY || !SPACES_ENDPOINT) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const s3 = new S3Client({
      region: REGION,
      endpoint: SPACES_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
      },
    });

    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Missing fileName or contentType" },
        { status: 400 }
      );
    }

    const key = `videos/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      ACL: "public-read",
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // ✅ FIXED: Include bucket name in path for CDN
    const publicUrl = `${process.env.SPACES_CDN}/${key}`;

    console.log("Generated signed URL for:", key);
    console.log("Public URL:", publicUrl);

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("DO SIGNED URL ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create signed URL" },
      { status: 500 }
    );
  }
}