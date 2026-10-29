import { extractPdfText } from "@/utils/pdfText";
import { asTextAttachment, fileToBuffer, getFormFile, withApiUser } from "../_shared";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: Request) {
  return withApiUser(async () => {
    const formData = await req.formData();
    const file = getFormFile(formData);
    const buffer = await fileToBuffer(file);
    const text = await extractPdfText(buffer);
    return asTextAttachment(text);
  });
}
