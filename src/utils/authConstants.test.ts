import { describe, expect, it } from "vitest";
import { isProtectedPathname } from "./authConstants";

describe("isProtectedPathname", () => {
  it("marks document and payment routes protected", () => {
    expect(isProtectedPathname("/documents")).toBe(true);
    expect(isProtectedPathname("/documents/abc")).toBe(true);
    expect(isProtectedPathname("/payment-attempt")).toBe(true);
    expect(isProtectedPathname("/sign-in")).toBe(false);
    expect(isProtectedPathname("/")).toBe(false);
  });
});
