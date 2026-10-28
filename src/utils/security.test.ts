import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { safeDownloadBase } from "./downloadName";
import {
  emailDocumentHtml,
  imageDocumentHtml,
  isRenderableDocumentRequest,
  sanitizePdfHtml,
} from "./pdfHtml";
import { assessCreditPackPayment, CREDIT_PACK_CENTS } from "./creditPack";
import { assertUserStoragePdfUrl } from "./storageUrl";
import { pickClientProfileFields } from "./profileFields";
import { passwordResetShowsSuccess } from "./authErrors";
import { sessionCookieOptions } from "./sessionCookie";
import { MAX_UPLOAD_BYTES } from "./uploadLimit";

const bucket = "demo.appspot.com";
const uid = "user_1";

function storageUrl(objectPath: string, host = "firebasestorage.googleapis.com") {
  return `https://${host}/v0/b/${bucket}/o/${encodeURIComponent(objectPath)}?alt=media&token=t`;
}

describe("conversion safety helpers", () => {
  it("sanitizes filenames used in Content-Disposition", () => {
    expect(safeDownloadBase('evil"\r\nSet-Cookie: a=b')).toBe("evilSet-Cookie_a_b");
    expect(safeDownloadBase("../../etc/passwd")).toBe("etcpasswd");
    expect(safeDownloadBase("   ")).toBe("download");
  });

  it("strips scripts and remote images before PDF render", () => {
    const html = sanitizePdfHtml(
      `<h1>Hi</h1><script>fetch("http://169.254.169.254/")</script><img src="http://169.254.169.254/latest">`
    );
    expect(html).toContain("Hi");
    expect(html.toLowerCase()).not.toContain("script");
    expect(html).not.toContain("169.254.169.254");
  });

  it("escapes email headers and keeps only data-image requests", () => {
    const html = emailDocumentHtml({
      subject: `</h2><img src=http://127.0.0.1/x>`,
      from: "a@example.com",
      to: "b@example.com",
      date: "now",
      bodyHtml: "<p>Body</p><iframe src='http://127.0.0.1'></iframe>",
    });
    expect(html).not.toContain("<iframe");
    expect(html).toContain("&lt;/h2&gt;");
    expect(isRenderableDocumentRequest("about:blank")).toBe(true);
    expect(isRenderableDocumentRequest("data:image/png;base64,aaaa")).toBe(true);
    expect(isRenderableDocumentRequest("http://169.254.169.254/")).toBe(false);
    expect(isRenderableDocumentRequest("https://example.com/a.png")).toBe(false);
    expect(imageDocumentHtml('image/png" onerror="alert(1)', "abcd")).not.toContain("onerror");
  });

  it("caps uploads under the Vercel request body limit", () => {
    expect(MAX_UPLOAD_BYTES).toBeLessThanOrEqual(4 * 1024 * 1024);
  });
});

describe("credit pack assessment", () => {
  const valid = {
    id: "pi_123",
    amount: CREDIT_PACK_CENTS,
    currency: "usd",
    status: "succeeded",
    metadata: { purpose: "credit_pack", uid: "abc123" },
  };

  it("accepts the fixed pack for the metadata user", () => {
    expect(assessCreditPackPayment(valid)).toEqual({
      ok: true,
      uid: "abc123",
      id: "pi_123",
      amount: CREDIT_PACK_CENTS,
    });
  });

  it("rejects a cheaper or unbound payment", () => {
    expect(assessCreditPackPayment({ ...valid, amount: 50 }).ok).toBe(false);
    expect(assessCreditPackPayment({ ...valid, metadata: { purpose: "credit_pack", uid: "" } }).ok).toBe(false);
    expect(assessCreditPackPayment({ ...valid, status: "requires_payment_method" }).ok).toBe(false);
    expect(assessCreditPackPayment({ ...valid, currency: "eur" }).ok).toBe(false);
  });
});

describe("analysis URL allowlist", () => {
  it("allows the caller's own storage PDF", () => {
    const url = assertUserStoragePdfUrl(storageUrl(`${uid}/documents/doc1.pdf`), uid, bucket);
    expect(url.hostname).toBe("firebasestorage.googleapis.com");
  });

  it("rejects metadata hosts, other users, and off-bucket objects", () => {
    expect(() => assertUserStoragePdfUrl("http://169.254.169.254/latest/meta-data", uid, bucket)).toThrow();
    expect(() => assertUserStoragePdfUrl("http://127.0.0.1/secret.pdf", uid, bucket)).toThrow();
    expect(() =>
      assertUserStoragePdfUrl(storageUrl("other/documents/doc1.pdf"), uid, bucket)
    ).toThrow();
    expect(() =>
      assertUserStoragePdfUrl(storageUrl(`${uid}/documents/doc1.pdf`), uid, "other.appspot.com")
    ).toThrow();
    expect(() =>
      assertUserStoragePdfUrl(
        storageUrl(`${uid}/documents/doc1.pdf`, "storage.googleapis.com"),
        uid,
        bucket
      )
    ).toThrow();
  });
});

describe("profile client writes", () => {
  it("drops credits and provider secrets", () => {
    expect(
      pickClientProfileFields({
        displayName: "Ada",
        credits: 1_000_000,
        openai_api_key: "sk-test",
        emailVerified: true,
      })
    ).toEqual({ displayName: "Ada", emailVerified: true });
  });
});

describe("session cookie", () => {
  it("is httpOnly", () => {
    expect(sessionCookieOptions(true)).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  });
});

describe("password reset enumeration", () => {
  it("treats unknown accounts as success", () => {
    expect(passwordResetShowsSuccess({ code: "auth/user-not-found" })).toBe(true);
    expect(passwordResetShowsSuccess({ code: "auth/network-request-failed" })).toBe(false);
  });
});

describe("checked-in policy files", () => {
  it("does not let the client write balances, secrets, or payments", () => {
    const rules = readFileSync("firestore.rules", "utf8");
    expect(rules).not.toMatch(/api_key/);
    expect(rules).not.toMatch(/'credits'/);
    expect(rules).toMatch(/allow create, update, delete: if false/);
    expect(rules).toMatch(/allow create, delete: if false/);
  });

  it("does not publish wildcard storage CORS", () => {
    const cors = readFileSync("cors.json", "utf8");
    expect(cors).not.toContain("*");
    expect(cors).not.toContain("your-production-domain.com");
    expect(cors).toContain("http://localhost:3000");
  });
});
