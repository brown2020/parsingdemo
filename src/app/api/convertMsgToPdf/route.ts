import { NextRequest } from "next/server";
import { simpleParser, AddressObject, ParsedMail } from "mailparser";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import sanitizeHtml from "sanitize-html";
import { htmlToText } from "html-to-text";
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

    // Parse the MSG file using mailparser
    const parsedEmail: ParsedMail = await simpleParser(buffer);

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

    // Set the timeout for the page
    page.setDefaultNavigationTimeout(300000);
    page.setDefaultTimeout(300000);

    try {
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    } catch (setContentError) {
      console.error("Error setting HTML content:", setContentError);
      throw setContentError;
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
