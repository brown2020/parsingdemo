import { PDFParse } from "pdf-parse";
import { asTextAttachment, fileToBuffer, getFormFile, withApiUser } from "../_shared";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: Request) {
  return withApiUser(async () => {
    const formData = await req.formData();
    const file = getFormFile(formData);
    const buffer = await fileToBuffer(file);
    const parser = new PDFParse({ data: buffer });
    try {
      const data = await parser.getText();
      return asTextAttachment(data.text);
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  });
}
