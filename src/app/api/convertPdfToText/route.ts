import { NextResponse } from "next/server";
import pdf from "pdf-parse";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { fileBuffer } = await req.json();

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(fileBuffer);
    const bufferSize = buffer.length / (1024 * 1024); // Size in MB
    console.log(`Processing file of size: ${bufferSize.toFixed(2)} MB`);

    if (bufferSize > 40) {
      throw new Error("File size exceeds 50MB limit");
    }

    // Parse the PDF file
    console.time("Parse PDF");
    const data = await pdf(buffer);
    console.timeEnd("Parse PDF");
    console.log("PDF parsing complete");

    // Return plain text response
    return new NextResponse(data.text, {
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
