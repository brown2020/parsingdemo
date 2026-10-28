import { NextRequest } from "next/server";
import { asTextAttachment, fileToBuffer, getFormFile, withApiUser } from "../_shared";
import { parseMsg } from "@/utils/msgFile";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return withApiUser(async () => {
    const formData = await req.formData();
    const file = getFormFile(formData);
    const buffer = await fileToBuffer(file);
    const message = parseMsg(buffer);
    const textContent = `
      Subject: ${message.subject}
      From: ${message.from}
      To: ${message.to}

      ${message.text || "No Text Content"}
    `;
    return asTextAttachment(textContent.trim() + "\n");
  });
}
