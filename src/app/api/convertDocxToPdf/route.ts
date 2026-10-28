import { NextRequest } from "next/server";
import mammoth from "mammoth";
import {
  fileToBuffer,
  getFormFile,
  getOptionalFormString,
  withApiUser,
} from "../_shared";
import { renderHtmlToPdf } from "../_browser";
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
    const { value: html } = await mammoth.convertToHtml({ buffer });
    return renderHtmlToPdf(html, filenameBase, uid);
  });
}
