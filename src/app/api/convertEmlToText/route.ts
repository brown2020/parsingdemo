import { NextRequest } from "next/server";
import { simpleParser } from "mailparser";
import {
  asTextAttachment,
  extractEmails,
  fileToBuffer,
  getFormFile,
  withApiUser,
} from "../_shared";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return withApiUser(async () => {
    const formData = await req.formData();
    const file = getFormFile(formData);
    const buffer = await fileToBuffer(file);
    const parsedEmail = await simpleParser(buffer);
    const formattedDate = parsedEmail.date
      ? parsedEmail.date.toUTCString()
      : "No Date";
    const textContent = `
      Subject: ${parsedEmail.subject || "No Subject"}
      From: ${extractEmails(parsedEmail.from)}
      To: ${extractEmails(parsedEmail.to)}
      Date: ${formattedDate}

      ${parsedEmail.text || "No Text Content"}
    `;
    return asTextAttachment(textContent.trim() + "\n");
  });
}
