import { NextRequest, NextResponse } from "next/server";
import { simpleParser, AddressObject } from "mailparser";

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
      throw new Error("File size exceeds 40MB limit");
    }

    // Parse the EML file using mailparser
    console.time("Parse EML");
    const parsedEmail = await simpleParser(buffer);
    console.timeEnd("Parse EML");
    console.log("EML parsing complete");

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

    // Extract text content from parsed email
    const textContent = `
      Subject: ${parsedEmail.subject || "No Subject"}
      From: ${extractEmails(parsedEmail.from)}
      To: ${extractEmails(parsedEmail.to)}
      Date: ${formattedDate}
      
      ${parsedEmail.text || "No Text Content"}
    `;

    console.log("Extracted text content:", textContent);

    // Return plain text response
    return new NextResponse(textContent, {
      headers: {
        "Content-Type": "text/plain",
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
