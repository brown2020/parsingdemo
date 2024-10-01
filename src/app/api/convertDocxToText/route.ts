// app/api/convertDocxToText/route.ts
import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

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

    // Convert DOCX to plain text using Mammoth
    console.time("Convert DOCX to Text");
    const { value: text } = await mammoth.extractRawText({ buffer });
    console.timeEnd("Convert DOCX to Text");
    console.log("Text conversion complete");

    // Log the length of the text content
    console.log(`Text content length: ${text.length}`);

    // Return plain text response
    return new NextResponse(text, {
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
