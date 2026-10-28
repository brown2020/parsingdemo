import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
];

/** Puppeteer may load the document itself and embedded images, nothing else. */
export function isRenderableDocumentRequest(url: string): boolean {
  return (
    url === "about:blank" ||
    url.startsWith("data:image/png") ||
    url.startsWith("data:image/jpeg") ||
    url.startsWith("data:image/gif") ||
    url.startsWith("data:image/webp")
  );
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Drop scripts, remote images, and active content before headless render. */
export function sanitizePdfHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "name"],
      img: ["src", "alt"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["data"],
    },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
  });
}

export function emailDocumentHtml(input: {
  subject: string;
  from: string;
  to: string;
  date: string;
  bodyHtml: string;
}): string {
  return sanitizePdfHtml(`
    <div>
      <h2>${escapeHtml(input.subject)}</h2>
      <h3>From: ${escapeHtml(input.from)}</h3>
      <h3>To: ${escapeHtml(input.to)}</h3>
      <h3>Date: ${escapeHtml(input.date)}</h3>
      <div>${input.bodyHtml}</div>
    </div>
  `);
}

const SAFE_IMAGE_MIME = /^image\/(png|jpeg|gif|webp)$/;

export function imageDocumentHtml(mime: string, base64: string): string {
  const safeMime = SAFE_IMAGE_MIME.test(mime) ? mime : "image/jpeg";
  const payload = base64.replace(/[^A-Za-z0-9+/=]/g, "");
  return sanitizePdfHtml(
    `<img alt="" src="data:${safeMime};base64,${payload}" />`
  );
}
