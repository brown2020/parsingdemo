import { NextResponse } from "next/server";

export const MAX_FILE_SIZE_MB = 40;

export function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function assertMaxBytes(bytes: number, maxMb = MAX_FILE_SIZE_MB) {
  const maxBytes = maxMb * 1024 * 1024;
  if (bytes > maxBytes) {
    throw new Error(`File size exceeds ${maxMb}MB limit`);
  }
}

export async function fileToBuffer(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  assertMaxBytes(buffer.length);
  return buffer;
}

export function getFormFile(formData: FormData, key = "file") {
  const value = formData.get(key);
  if (!value || !(value instanceof File)) {
    throw new Error(`Missing file field "${key}"`);
  }
  return value;
}

export function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing field "${key}"`);
  }
  return value;
}

export function getOptionalFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function asTextAttachment(text: string, filename = "converted.txt") {
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export function asPdfAttachment(pdfBytes: Uint8Array, filenameBase: string) {
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
    },
  });
}
