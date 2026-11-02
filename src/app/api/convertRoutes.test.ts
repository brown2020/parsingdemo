import { crc32 } from "node:zlib";
import type { NextRequest } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_UPLOAD_BYTES } from "@/utils/uploadLimit";

vi.mock("@/utils/serverAuth", () => {
  class AuthenticationError extends Error {
    constructor(message = "Authentication required") {
      super(message);
      this.name = "AuthenticationError";
    }
  }
  return {
    AuthenticationError,
    authenticateAction: vi.fn(async () => "user_1"),
  };
});

import { authenticateAction, AuthenticationError } from "@/utils/serverAuth";
import { POST as docxToText } from "./convertDocxToText/route";
import { POST as emlToText } from "./convertEmlToText/route";
import { POST as pdfToText } from "./convertPdfToText/route";

function zipStored(files: Record<string, string>) {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const [name, text] of Object.entries(files)) {
    const data = Buffer.from(text);
    const nameBuf = Buffer.from(name);
    const checksum = crc32(data) >>> 0;
    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    nameBuf.copy(local, 30);
    const record = Buffer.concat([local, data]);
    locals.push(record);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);
    centrals.push(central);
    offset += record.length;
  }

  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(centrals.length, 8);
  eocd.writeUInt16LE(centrals.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDir, eocd]);
}

function sampleDocx() {
  return zipStored({
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    "word/document.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>Hello from ParsingDemo</w:t></w:r></w:p></w:body>
</w:document>`,
    "word/_rels/document.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`,
  });
}

const SAMPLE_EML = `From: Ada Lovelace <ada@example.com>
To: Bob <bob@example.com>
Subject: ParsingDemo sample
Date: Thu, 01 Jan 2026 00:00:00 +0000
MIME-Version: 1.0
Content-Type: text/plain; charset=utf-8

Hello from an email fixture.
`;

async function postFile(
  handler: (req: NextRequest) => Promise<Response>,
  bytes: Uint8Array,
  filename: string
) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const form = new FormData();
  form.set("file", new File([copy], filename));
  return handler(
    new Request("http://localhost/api/convert", {
      method: "POST",
      body: form,
    }) as NextRequest
  );
}

describe("document conversion routes", () => {
  beforeEach(() => {
    vi.mocked(authenticateAction).mockReset();
    vi.mocked(authenticateAction).mockResolvedValue("user_1");
  });

  it("rejects a signed-out conversion", async () => {
    vi.mocked(authenticateAction).mockRejectedValue(
      new AuthenticationError("Authentication required")
    );
    const response = await pdfToText(
      new Request("http://localhost/api/convertPdfToText", { method: "POST" })
    );
    expect(response.status).toBe(401);
  });

  it("rejects a missing or oversized upload", async () => {
    const missing = await pdfToText(
      new Request("http://localhost/api/convertPdfToText", {
        method: "POST",
        body: new FormData(),
      })
    );
    expect(missing.status).toBe(400);

    const form = new FormData();
    form.set("file", new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "big.pdf"));
    const oversized = await pdfToText(
      new Request("http://localhost/api/convertPdfToText", {
        method: "POST",
        body: form,
      })
    );
    expect(oversized.status).toBe(413);
  });

  it("extracts text from an uploaded PDF", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText("Hello from ParsingDemo", { x: 72, y: 720, size: 18, font });
    const response = await postFile(pdfToText, await doc.save(), "sample.pdf");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(await response.text()).toContain("Hello from ParsingDemo");
  });

  it("extracts text from an uploaded DOCX", async () => {
    const response = await postFile(docxToText, sampleDocx(), "sample.docx");
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Hello from ParsingDemo");
  });

  it("extracts headers and body from an uploaded EML", async () => {
    const response = await postFile(
      emlToText,
      Buffer.from(SAMPLE_EML),
      "sample.eml"
    );
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain("Subject: ParsingDemo sample");
    expect(text).toContain("ada@example.com");
    expect(text).toContain("bob@example.com");
    expect(text).toContain("Hello from an email fixture.");
  });
});
