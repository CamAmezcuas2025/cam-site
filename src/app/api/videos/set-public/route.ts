// src/app/api/videos/set-public/route.ts
import { NextResponse } from "next/server";
import { S3Client, PutObjectAclCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request) {
  try {
    const REGION = process.env.DO_REGION;
    const BUCKET = process.env.DO_BUCKET;
    const ACCESS_KEY = process.env.SPACES_ACCESS_KEY_ID;
    const SECRET_KEY = process.env.SPACES_SECRET_ACCESS_KEY;
    const SPACES_ENDPOINT = process.env.DO_ENDPOINT;

    console.log("set-public endpoint called");
    console.log("Environment check:", {
      hasRegion: !!REGION,
      hasBucket: !!BUCKET,
      hasAccessKey: !!ACCESS_KEY,
      hasSecretKey: !!SECRET_KEY,
      hasEndpoint: !!SPACES_ENDPOINT,
    });

    if (!REGION || !BUCKET || !ACCESS_KEY || !SECRET_KEY || !SPACES_ENDPOINT) {
      return NextResponse.json(
        { error: "Server misconfigured - missing environment variables" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { key } = body;

    console.log("Received key:", key);

    if (!key) {
      return NextResponse.json(
        { error: "Missing key parameter" },
        { status: 400 }
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

    console.log("Attempting to set ACL for:", key);

    const aclCommand = new PutObjectAclCommand({
      Bucket: BUCKET,
      Key: key,
      ACL: "public-read",
    });

    const result = await s3.send(aclCommand);
    
    console.log("ACL set successfully:", result);

    return NextResponse.json({ 
      success: true,
      key: key,
      message: "File set to public-read"
    });
  } catch (err: any) {
    console.error("SET ACL ERROR:", err);
    return NextResponse.json(
      { 
        error: "Failed to set public permissions",
        details: err.message,
        code: err.Code || err.code
      },
      { status: 500 }
    );
  }
}