import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { fileBuffer, fileType, filename, userId } = await req.json();

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    const base64Image = `data:${fileType};base64,${Buffer.from(
      fileBuffer
    ).toString("base64")}`;
    const content = `
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        img {
          max-width: 100%;
          max-height: 100%;
        }
      </style>
      <img src="${base64Image}" />
    `;

    await page.setContent(content);

    // Generate PDF with the correct scaling
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      scale: 1,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    await browser.close();

    // Load the PDF document with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.setTitle(filename);
    pdfDoc.setAuthor(userId);

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error(typedError);
    return new NextResponse(
      JSON.stringify({ error: typedError?.message || "unknown error" }),
      {
        status: 500,
      }
    );
  }
}
