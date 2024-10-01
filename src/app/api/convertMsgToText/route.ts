import { NextRequest, NextResponse } from "next/server";
import { simpleParser, AddressObject, ParsedMail } from "mailparser";
import { htmlToText } from "html-to-text";
import sanitizeHtml from "sanitize-html";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { fileBuffer } = await req.json();

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(fileBuffer);
    const bufferSize = buffer.length / (1024 * 1024); // Size in MB
    console.log(`Processing file of size: ${bufferSize.toFixed(2)} MB`);

    if (bufferSize > 40) {
      throw new Error("File size exceeds 50MB limit");
    }

    // Parse the MSG file using mailparser
    console.time("Parse MSG");
    const parsedEmail: ParsedMail = await simpleParser(buffer);
    console.timeEnd("Parse MSG");
    console.log("MSG parsing complete");

    // Helper function to extract email addresses as a string
    const extractEmails = (
      addresses: AddressObject | AddressObject[] | undefined
    ): string => {
      if (!addresses) return "";
      if (Array.isArray(addresses)) {
        return addresses.map((addr) => addr.text).join(", ");
      }
      return addresses.text;
    };

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
    return new NextResponse(textContent, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="converted.txt"`,
      },
    });
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error(`Error occurred: ${typedError.message}`);
    return new NextResponse(
      JSON.stringify({ error: typedError?.message || "unknown error" }),
      { status: 500 }
    );
  }
}
