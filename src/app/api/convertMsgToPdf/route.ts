import { NextRequest } from "next/server";
import {
  fileToBuffer,
  getFormFile,
  getOptionalFormString,
  withApiUser,
} from "../_shared";
import { renderHtmlToPdf } from "../_browser";
import { emailDocumentHtml, escapeHtml } from "@/utils/pdfHtml";
import { safeDownloadBase } from "@/utils/downloadName";
import { parseMsg } from "@/utils/msgFile";

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
    const buffer = await fileToBuffer(file);
    const message = parseMsg(buffer);
    const bodyHtml = message.html || escapeHtml(message.text).replace(/\n/g, "<br>");
    const html = emailDocumentHtml({
      subject: message.subject,
      from: message.from,
      to: message.to,
      date: "No Date",
      bodyHtml,
    });
    return renderHtmlToPdf(html, filenameBase, uid);
  });
}
