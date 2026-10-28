import { NextRequest } from "next/server";
import { simpleParser } from "mailparser";
import {
  extractEmails,
  fileToBuffer,
  getFormFile,
  getOptionalFormString,
  withApiUser,
} from "../_shared";
import { renderHtmlToPdf } from "../_browser";
import { emailDocumentHtml } from "@/utils/pdfHtml";
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
    const buffer = await fileToBuffer(file);
    const parsedEmail = await simpleParser(buffer);
    const html = emailDocumentHtml({
      subject: parsedEmail.subject || "No Subject",
      from: extractEmails(parsedEmail.from),
      to: extractEmails(parsedEmail.to),
      date: parsedEmail.date ? parsedEmail.date.toUTCString() : "No Date",
      bodyHtml: parsedEmail.html || parsedEmail.textAsHtml || "",
    });
    return renderHtmlToPdf(html, filenameBase, uid);
  });
}
