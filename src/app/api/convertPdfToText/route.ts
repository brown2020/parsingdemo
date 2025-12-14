import { PDFParse } from "pdf-parse";
import {
  asTextAttachment,
  fileToBuffer,
  getFormFile,
  jsonError,
} from "../_shared";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = getFormFile(formData);
    const buffer = await fileToBuffer(file);

    // Parse the PDF file
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();

    // Return plain text response
    return asTextAttachment(data.text);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(message);
    return jsonError(message, 500);
  }
}
