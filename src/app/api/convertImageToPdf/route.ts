import { NextRequest } from "next/server";
import {
  fileToBuffer,
  getFormFile,
  getOptionalFormString,
  withApiUser,
} from "../_shared";
import { renderHtmlToPdf } from "../_browser";
import { imageDocumentHtml } from "@/utils/pdfHtml";
import { safeDownloadBase } from "@/utils/downloadName";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return withApiUser(async (uid) => {
    const formData = await req.formData();
    const file = getFormFile(formData);
    const filenameBase = safeDownloadBase(
      getOptionalFormString(formData, "filenameBase") ||
        file.name.replace(/\.[^/.]+$/, "")
    );
    const imageBuffer = await fileToBuffer(file);
    const mime = /^image\/(png|jpeg|gif|webp)$/.test(file.type)
      ? file.type
      : "image/jpeg";
    const html = imageDocumentHtml(mime, imageBuffer.toString("base64"));
    return renderHtmlToPdf(html, filenameBase, uid);
  });
}
