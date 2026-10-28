import puppeteer, { type Browser } from "puppeteer";
import { PDFDocument } from "pdf-lib";
import { asPdfAttachment } from "./_shared";
import {
  isRenderableDocumentRequest,
  sanitizePdfHtml,
} from "@/utils/pdfHtml";

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const { default: chromium } = await import("@sparticuz/chromium");
    chromium.setGraphicsMode = false;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  return puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
}

/**
 * Render sanitized HTML to a PDF.
 * JavaScript is off, and every request that is not the document or a data-image is aborted.
 */
export async function renderHtmlToPdf(
  html: string,
  filenameBase: string,
  author: string
) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    try {
      page.setDefaultNavigationTimeout(60_000);
      page.setDefaultTimeout(60_000);
      await page.setJavaScriptEnabled(false);
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (isRenderableDocumentRequest(request.url())) {
          void request.continue().catch(() => undefined);
          return;
        }
        void request.abort("blockedbyclient").catch(() => undefined);
      });
      await page.setContent(sanitizePdfHtml(html), {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
      });
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      pdfDoc.setTitle(filenameBase);
      if (author) pdfDoc.setAuthor(author);
      const pdfBytes = await pdfDoc.save();
      return asPdfAttachment(pdfBytes, filenameBase);
    } finally {
      await page.close().catch(() => undefined);
    }
  } finally {
    await browser.close().catch(() => undefined);
  }
}
