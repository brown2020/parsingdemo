import { NextRequest } from "next/server";
import mammoth from "mammoth";
import { asTextAttachment, fileToBuffer, getFormFile, withApiUser } from "../_shared";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return withApiUser(async () => {
    const formData = await req.formData();
    const file = getFormFile(formData);
    const buffer = await fileToBuffer(file);
    const { value: text } = await mammoth.extractRawText({ buffer });
    return asTextAttachment(text);
  });
}
