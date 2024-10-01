"use server";

import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";
import puppeteer from "puppeteer";

interface ConvertDocxToPdfParams {
  file: File;
  userId: string;
}

export const convertDocxToPdf = async ({
  file,
  userId,
}: ConvertDocxToPdfParams): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let browser;
  try {
    const bufferSize = buffer.length / (1024 * 1024); // Size in MB
    console.log(`Processing file of size: ${bufferSize.toFixed(2)} MB`);

    if (bufferSize > 40) {
      throw new Error("File size exceeds 50MB limit");
    }

    // Convert DOCX to HTML using Mammoth
    console.time("Convert DOCX to HTML");
    const { value: html } = await mammoth.convertToHtml({ buffer });
    console.timeEnd("Convert DOCX to HTML");
    console.log("HTML conversion complete");

    // Log the length of the HTML content
    console.log(`HTML content length: ${html.length}`);

    // Launch Puppeteer with increased timeout and memory
    console.time("Launch Puppeteer");
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
      timeout: 300000, // 5 minutes timeout
    });
    console.timeEnd("Launch Puppeteer");
    console.log("Puppeteer launched");

    const page = await browser.newPage();
    console.log("New page created");

    // Set the timeout for the page
    page.setDefaultNavigationTimeout(300000); // 5 minutes timeout
    page.setDefaultTimeout(300000); // 5 minutes timeout

    // Monitor page events
    page.on("error", (error) => {
      console.error("Page error:", error);
    });
    page.on("pageerror", (error) => {
      console.error("Page error:", error);
    });
    page.on("close", () => {
      console.error("Page closed");
    });

    console.log("Setting HTML content");
    console.time("Set HTML Content");

    try {
      await page.setContent(html, { waitUntil: "networkidle0" });
      console.timeEnd("Set HTML Content");
      console.log("HTML content set");
    } catch (setContentError) {
      console.error("Error setting HTML content:", setContentError);
      throw setContentError;
    }

    // Generate PDF
    console.time("Generate PDF");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    console.timeEnd("Generate PDF");
    console.log("PDF generated");

    console.log("Closing Puppeteer");
    await browser.close();
    console.log("Puppeteer closed");

    // Load the PDF document with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.setTitle(file.name.replace(/\.[^/.]+$/, ""));
    pdfDoc.setAuthor(userId);

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Return the Blob
    return new Blob([pdfBytes], { type: "application/pdf" });
  } catch (error: unknown) {
    console.error(`Error occurred: ${error}`);
    if (browser) {
      console.log("Closing Puppeteer due to error");
      await browser.close();
      console.log("Puppeteer closed after error");
    }
    if (error instanceof Error) {
      throw new Error(`Failed to convert DOCX to PDF: ${error.message}`);
    } else {
      throw new Error("Failed to convert DOCX to PDF: Unknown error");
    }
  }
};
