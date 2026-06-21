import { NextRequest } from "next/server";
import { simpleParser } from "mailparser";
import {
  asTextAttachment,
  extractEmails,
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

    // Parse the EML file using mailparser
    const parsedEmail = await simpleParser(buffer);

    // Format the date
    const formattedDate = parsedEmail.date
      ? parsedEmail.date.toUTCString()
      : "No Date";

    // Extract text content from parsed email
    const textContent = `
      Subject: ${parsedEmail.subject || "No Subject"}
      From: ${extractEmails(parsedEmail.from)}
      To: ${extractEmails(parsedEmail.to)}
      Date: ${formattedDate}
      
      ${parsedEmail.text || "No Text Content"}
    `;

    // Return plain text response
    return asTextAttachment(textContent.trim() + "\n", "converted.txt");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(message);
    return jsonError(message, 500);
  }
}
