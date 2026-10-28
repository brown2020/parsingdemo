/** Safe `Content-Disposition` filename stem. Strips header and path characters. */
export function safeDownloadBase(name: string): string {
  const cleaned = name
    .replace(/[\u0000-\u001f\u007f"\\/;]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 80);
  return /[A-Za-z0-9]/.test(cleaned) ? cleaned : "download";
}
