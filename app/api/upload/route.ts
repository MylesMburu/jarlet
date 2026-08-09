import { NextResponse } from "next/server";
import { requestMediaUpload } from "@/lib/storage";

export async function POST(request: Request) {
  let fileName: string;
  let contentType: string;

  try {
    const body = await request.json();
    fileName = String(body.fileName ?? "upload.bin");
    contentType = String(body.contentType ?? "application/octet-stream");
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const upload = await requestMediaUpload(fileName, contentType);
  return NextResponse.json(upload);
}