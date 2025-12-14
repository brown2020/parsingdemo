import { NextRequest } from "next/server";
import { simpleParser, AddressObject } from "mailparser";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import {
  asPdfAttachment,
  fileToBuffer,
  getFormFile,
  getOptionalFormString,
  jsonError,
} from "../_shared";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let browser;
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
        "--disable-dev-shm-usage", // Helps with memory issues
        "--disable-gpu", // Disable GPU if not needed
        "--single-process", // Run in a single process
        "--max-old-space-size=12288", // Increase memory limit to 12GB
        "--no-zygote", // Disable zygote process
        "--renderer-process-limit=1", // Limit renderer processes
        "--enable-automation", // Enable automation mode
      ],
      timeout: 300000, // 5 minutes timeout
    });

    const page = await browser.newPage();

    // Set the timeout for the page
    page.setDefaultNavigationTimeout(300000); // 5 minutes timeout
    page.setDefaultTimeout(300000); // 5 minutes timeout

    try {
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    } catch (setContentError) {
      console.error("Error setting HTML content:", setContentError);
      throw setContentError; // Re-throw after logging
    }

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();

    // Load the PDF document with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.setTitle(filenameBase);
    if (userId) pdfDoc.setAuthor(userId);

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Return PDF response
    return asPdfAttachment(pdfBytes, filenameBase);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(message);
    if (browser) {
      await browser.close();
    }
    return jsonError(message, 500);
  }
}
