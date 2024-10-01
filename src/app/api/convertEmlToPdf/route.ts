import { NextRequest, NextResponse } from "next/server";
import { simpleParser, AddressObject } from "mailparser";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let browser;
  try {
    const { fileBuffer, filename, userId } = await req.json();

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(fileBuffer);
    const bufferSize = buffer.length / (1024 * 1024); // Size in MB
    console.log(`Processing file of size: ${bufferSize.toFixed(2)} MB`);

    if (bufferSize > 40) {
      throw new Error("File size exceeds 50MB limit");
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
    console.time("Launch Puppeteer");
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
    console.timeEnd("Launch Puppeteer");
    console.log("Puppeteer launched");

    const page = await browser.newPage();
    console.log("New page created");

    // Set the timeout for the page
    page.setDefaultNavigationTimeout(300000); // 5 minutes timeout
    page.setDefaultTimeout(300000); // 5 minutes timeout

    // Monitor page events
    page.on("error", (error: Error) => {
      console.error("Page error:", error);
    });
    page.on("pageerror", (error: Error) => {
      console.error("Page error:", error);
    });
    page.on("close", () => {
      console.error("Page closed");
    });

    console.log("Setting HTML content");
    console.time("Set HTML Content");

    try {
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      console.timeEnd("Set HTML Content");
      console.log("HTML content set");
    } catch (setContentError) {
      console.error("Error setting HTML content:", setContentError);
      throw setContentError; // Re-throw after logging
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
    pdfDoc.setTitle(filename);
    pdfDoc.setAuthor(userId);

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Return PDF response
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error(`Error occurred: ${typedError.message}`);
    if (browser) {
      console.log("Closing Puppeteer due to error");
      await browser.close();
      console.log("Puppeteer closed after error");
    }
    return new NextResponse(
      JSON.stringify({ error: typedError?.message || "unknown error" }),
      { status: 500 }
    );
  }
}
