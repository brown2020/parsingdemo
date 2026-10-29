// Load the worker before pdf-parse. It installs DOMMatrix from @napi-rs/canvas.
// On Vercel, pdfjs throws "DOMMatrix is not defined" if this import comes later
// or if the canvas package is not traced into the function.
import { CanvasFactory, getData } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

PDFParse.setWorker(getData());

/** Extract text from a normal PDF. Copies the bytes because pdf.js may detach them. */
export async function extractPdfText(data: Uint8Array): Promise<string> {
  const bytes = new Uint8Array(data);
  const parser = new PDFParse({ data: bytes, CanvasFactory });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
