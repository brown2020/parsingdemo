import { MAX_ANALYSIS_DOCUMENTS } from "@/utils/creditPack";

export { MAX_ANALYSIS_DOCUMENTS };

/**
 * Firebase download URLs for the signed-in user's own PDF objects.
 * Rejects every other host, including link-local and private targets.
 */
export function assertUserStoragePdfUrl(
  raw: string,
  uid: string,
  bucket: string | undefined
): URL {
  if (!bucket?.trim()) {
    throw new Error("Document URL was rejected");
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Document URL was rejected");
  }

  if (url.protocol !== "https:") throw new Error("Document URL was rejected");
  if (url.username || url.password) throw new Error("Document URL was rejected");
  if (url.port) throw new Error("Document URL was rejected");
  if (url.hostname !== "firebasestorage.googleapis.com") {
    throw new Error("Document URL was rejected");
  }

  const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
  if (!match) throw new Error("Document URL was rejected");

  let bucketName = "";
  let objectPath = "";
  try {
    bucketName = decodeURIComponent(match[1]);
    objectPath = decodeURIComponent(match[2]);
  } catch {
    throw new Error("Document URL was rejected");
  }

  if (bucketName !== bucket) throw new Error("Document URL was rejected");
  const parts = objectPath.split("/");
  if (
    parts.length !== 3 ||
    parts[0] !== uid ||
    parts[1] !== "documents" ||
    !/^[A-Za-z0-9_-]+\.pdf$/.test(parts[2]) ||
    objectPath.includes("..")
  ) {
    throw new Error("Document URL was rejected");
  }

  return url;
}
