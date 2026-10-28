import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.STRIPE_WEBHOOK_SECRET;
  } else {
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  }
});

describe("stripe webhook", () => {
  it("does not grant credits when the signing secret is unset", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: "{}",
      })
    );
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Webhook is not configured",
    });
  });
});
