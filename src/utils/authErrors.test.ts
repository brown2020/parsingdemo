import { describe, expect, it, vi } from "vitest";
import { mapAuthError } from "./authErrors";

describe("mapAuthError", () => {
  it("maps known Firebase codes", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(mapAuthError({ code: "auth/invalid-credential" })).toMatch(/Invalid email or password/);
    expect(mapAuthError({ code: "auth/too-many-requests" })).toMatch(/Too many attempts/);
    warn.mockRestore();
  });

  it("returns generic message for unknown errors", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(mapAuthError(new Error("boom"))).toMatch(/Something went wrong/);
    warn.mockRestore();
  });
});
