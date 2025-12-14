import { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import {
  asPdfAttachment,
  getFormFile,
  getOptionalFormString,
  jsonError,
} from "../_shared";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = getFormFile(formData);
    const userId = getOptionalFormString(formData, "userId") || "";
    const filenameBase =
      getOptionalFormString(formData, "filenameBase") ||
      file.name.replace(/\.[^/.]+$/, "");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = `data:${file.type};base64,${Buffer.from(
      arrayBuffer
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
    pdfDoc.setTitle(filenameBase);
    if (userId) pdfDoc.setAuthor(userId);

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    return asPdfAttachment(pdfBytes, filenameBase);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(message);
    return jsonError(message, 500);
  }
}
