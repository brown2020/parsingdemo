import { NextRequest, NextResponse } from "next/server";
import { simpleParser, AddressObject, ParsedMail } from "mailparser";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import sanitizeHtml from "sanitize-html";
import { htmlToText } from "html-to-text";

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
    let cleanHtml = parsedEmail.html || parsedEmail.textAsHtml || "";

    // If the content contains RTF data, convert it to text
    if (parsedEmail.text && parsedEmail.text.includes("{\\rtf")) {
      cleanHtml = htmlToText(parsedEmail.text, {
        wordwrap: 130,
      });
    }

    // Sanitize the HTML content
    cleanHtml = sanitizeHtml(cleanHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "p",
        "div",
        "br",
      ]),
      allowedAttributes: {
        a: ["href", "name", "target"],
        img: ["src", "alt"],
        "*": ["style"],
      },
      allowedStyles: {
        "*": {
          color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\((\d+,\s*){2}\d+\)$/],
          "text-align": [/^left$/, /^right$/, /^center$/],
          "font-size": [/^\d+(?:px|em|%)$/],
        },
      },
    });

    // Generate HTML content from parsed email
    const htmlContent = `
      <div>
        <h2>${parsedEmail.subject || "No Subject"}</h2>
        <h3>From: ${extractEmails(parsedEmail.from)}</h3>
        <h3>To: ${extractEmails(parsedEmail.to)}</h3>
        <h3>Date: ${formattedDate}</h3>
        <div>${cleanHtml}</div>
      </div>
    `;

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
      timeout: 300000,
    });
    console.timeEnd("Launch Puppeteer");
    console.log("Puppeteer launched");

    const page = await browser.newPage();
    console.log("New page created");

    // Set the timeout for the page
    page.setDefaultNavigationTimeout(300000);
    page.setDefaultTimeout(300000);

    // Monitor page events
    page.on("error", (error: any) => {
      console.error("Page error:", error);
    });
    page.on("pageerror", (error: any) => {
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
