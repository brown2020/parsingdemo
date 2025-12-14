// app/api/convertDocxToText/route.ts
import { NextRequest } from "next/server";
import mammoth from "mammoth";
import {
  asTextAttachment,
  fileToBuffer,
  getFormFile,
  jsonError,
} from "../_shared";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = getFormFile(formData);
    const buffer = await fileToBuffer(file);

    // Convert DOCX to plain text using Mammoth
    const { value: text } = await mammoth.extractRawText({ buffer });

    // Return plain text response
    return asTextAttachment(text);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(message);
    return jsonError(message, 500);
  }
}
