import { NextRequest } from "next/server";
import { simpleParser } from "mailparser";
import puppeteer, { Browser } from "puppeteer";
import { PDFDocument } from "pdf-lib";
import {
  asPdfAttachment,
  fileToBuffer,
  getFormFile,
  getOptionalFormString,
  jsonError,
  extractEmails,
} from "../_shared";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let browser: Browser | null = null;

  try {
    const formData = await req.formData();
    const file = getFormFile(formData);
    const userId = getOptionalFormString(formData, "userId") || "";
    const filenameBase =
      getOptionalFormString(formData, "filenameBase") ||
      file.name.replace(/\.[^/.]+$/, "");
    const buffer = await fileToBuffer(file);

    // Parse the EML file using mailparser
    const parsedEmail = await simpleParser(buffer);

    // Format the date
    const formattedDate = parsedEmail.date
      ? parsedEmail.date.toUTCString()
      : "No Date";

    // Generate HTML content from parsed email
    const htmlContent = `
      <div>
        <h2>${parsedEmail.subject}</h2>
        <h3>From: ${extractEmails(parsedEmail.from)}</h3>
        <h3>To: ${extractEmails(parsedEmail.to)}</h3>
        <h3>Date: ${formattedDate}</h3>
        <p>${parsedEmail.html || parsedEmail.textAsHtml}</p>
      </div>
    `;

    // Launch Puppeteer with increased timeout and memory
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--max-old-space-size=12288",
        "--no-zygote",
        "--renderer-process-limit=1",
        "--enable-automation",
      ],
      timeout: 300000,
    });

    const page = await browser.newPage();

    try {
      // Set the timeout for the page
      page.setDefaultNavigationTimeout(300000);
      page.setDefaultTimeout(300000);

      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
      });

      // Load the PDF document with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      pdfDoc.setTitle(filenameBase);
      if (userId) pdfDoc.setAuthor(userId);

      // Serialize the PDFDocument to bytes (a Uint8Array)
      const pdfBytes = await pdfDoc.save();

      // Return PDF response
      return asPdfAttachment(pdfBytes, filenameBase);
    } finally {
      // Always close page explicitly
      await page.close();
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(message);
    return jsonError(message, 500);
  } finally {
    // Always close browser in finally block
    if (browser) {
      await browser.close();
    }
  }
}
