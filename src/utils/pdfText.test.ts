import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { extractPdfText } from "./pdfText";

describe("extractPdfText", () => {
  it("reads text from a small sample PDF", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText("Hello from ParsingDemo", {
      x: 72,
      y: 720,
      size: 18,
      font,
    });
    const pdf = await doc.save();

    const text = await extractPdfText(pdf);
    expect(text).toContain("Hello from ParsingDemo");
  });
});
