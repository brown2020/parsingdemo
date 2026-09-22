import { describe, expect, it } from "vitest";
import convertToSubcurrency from "./convertToSubcurrency";

describe("convertToSubcurrency", () => {
  it("converts dollars to cents", () => {
    expect(convertToSubcurrency(10)).toBe(1000);
    expect(convertToSubcurrency(99.99)).toBe(9999);
  });
});
