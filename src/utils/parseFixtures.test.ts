import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Fixture contract for paid parse/AI paths.
 * Label: fixtures cannot prove live Gemini quality, pdf-parse edge cases on
 * malformed binaries, or Puppeteer render fidelity.
 */
describe("parse fixtures", () => {
  const fixtureDir = join(process.cwd(), "fixtures");

  it("ships a labeled sample text document", () => {
    const sample = readFileSync(join(fixtureDir, "sample.txt"), "utf8");
    expect(sample).toContain("ParsingDemo fixture");
    expect(sample.length).toBeGreaterThan(10);
  });

  it("documents fixture limitations", () => {
    const note = readFileSync(join(fixtureDir, "README.md"), "utf8");
    expect(note.toLowerCase()).toContain("cannot prove");
    expect(note.toLowerCase()).toContain("gemini");
  });
});
