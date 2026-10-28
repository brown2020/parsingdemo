import { NextResponse } from "next/server";
import { AddressObject } from "mailparser";
import { authenticateAction, AuthenticationError } from "@/utils/serverAuth";
import { safeDownloadBase } from "@/utils/downloadName";
import { MAX_UPLOAD_BYTES } from "@/utils/uploadLimit";

export { MAX_UPLOAD_BYTES };

export class RequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RequestError";
    this.status = status;
  }
}

export function extractEmails(
  addresses: AddressObject | AddressObject[] | undefined
): string {
  if (!addresses) return "";
  if (Array.isArray(addresses)) {
    return addresses.map((addr) => addr.text).join(", ");
  }
  return addresses.text;
}

export function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function withApiUser(
  handler: (uid: string) => Promise<NextResponse>
) {
  try {
    const uid = await authenticateAction();
    return await handler(uid);
  } catch (error) {
    console.error(error);
    if (error instanceof AuthenticationError) {
      return jsonError("Authentication required", 401);
    }
    if (error instanceof RequestError) {
      return jsonError(error.message, error.status);
    }
    return jsonError("Conversion failed", 500);
  }
}

export async function fileToBuffer(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new RequestError("File is too large", 413);
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new RequestError("File is too large", 413);
  }
  return buffer;
}

export function getFormFile(formData: FormData, key = "file") {
  const value = formData.get(key);
  if (!value || !(value instanceof File)) {
    throw new RequestError("Missing file", 400);
  }
  return value;
}

export function getOptionalFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function asTextAttachment(text: string, filename = "converted.txt") {
  const name = `${safeDownloadBase(filename.replace(/\.txt$/i, ""))}.txt`;
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function asPdfAttachment(pdfBytes: Uint8Array, filenameBase: string) {
  const name = `${safeDownloadBase(filenameBase)}.pdf`;
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
