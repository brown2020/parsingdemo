import { NextRequest } from "next/server";
import { simpleParser, ParsedMail } from "mailparser";
import { htmlToText } from "html-to-text";
import sanitizeHtml from "sanitize-html";
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

    // Parse the MSG file using mailparser
    const parsedEmail: ParsedMail = await simpleParser(buffer);

    // Format the date
    const formattedDate = parsedEmail.date
      ? parsedEmail.date.toUTCString()
      : "No Date";

    // Extract and clean the HTML or text content
    let cleanText = parsedEmail.text || "";

    if (parsedEmail.html) {
      // If HTML content exists, sanitize and convert it to text
      const cleanHtml = sanitizeHtml(parsedEmail.html, {
        allowedTags: [],
        allowedAttributes: {},
      });
      cleanText = htmlToText(cleanHtml, {
        wordwrap: 130,
      });
    }

    // Generate plain text content from parsed email
    const textContent = `
      Subject: ${parsedEmail.subject || "No Subject"}
      From: ${extractEmails(parsedEmail.from)}
      To: ${extractEmails(parsedEmail.to)}
      Date: ${formattedDate}
      
      ${cleanText}
    `;

    // Return plain text response
    return asTextAttachment(textContent.trim() + "\n", "converted.txt");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(message);
    return jsonError(message, 500);
  }
}
