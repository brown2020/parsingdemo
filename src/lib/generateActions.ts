"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { streamText, type ModelMessage } from "ai";
import { google } from "@ai-sdk/google";
import { authenticateAction } from "@/utils/serverAuth";
import { extractPdfText } from "@/utils/pdfText";
import { assertUserStoragePdfUrl } from "@/utils/storageUrl";
import {
  ANALYSIS_CREDIT_COST,
  MAX_ANALYSIS_DOCUMENTS,
  MAX_ANALYSIS_PDF_BYTES,
} from "@/utils/creditPack";
import { chargeCredits, refundCredits } from "@/lib/billing";

const FETCH_TIMEOUT_MS = 60_000;
const MAX_COMBINED_DOCUMENT_CHARS = 200_000;

/** Prefer fixtures when PARSE_USE_FIXTURES=true — avoids burning Gemini credits. */
function parseFixturesEnabled() {
  return process.env.PARSE_USE_FIXTURES === "true";
}

function fixtureStream(chunks: string[]) {
  const stream = createStreamableValue(chunks.join(""));
  stream.done();
  return stream.value;
}

export async function continueConversation(messages: ModelMessage[]) {
  const uid = await authenticateAction();
  if (parseFixturesEnabled()) {
    return fixtureStream([
      "[fixture] AI analysis skipped (PARSE_USE_FIXTURES=true). ",
      "Live Gemini quality and latency are not proven by this fixture.",
    ]);
  }

  await chargeCredits(uid, ANALYSIS_CREDIT_COST);
  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages,
    });

    const stream = createStreamableValue(result.textStream);
    return stream.value;
  } catch (error) {
    await refundCredits(uid, ANALYSIS_CREDIT_COST).catch((refundError) => {
      console.error("Credit refund failed", refundError);
    });
    throw error;
  }
}

async function readBoundedPdf(url: URL) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
    });
    if (res.status >= 300 && res.status < 400) {
      throw new Error("Document URL was rejected");
    }
    if (!res.ok || !res.body) {
      throw new Error("Failed to fetch PDF");
    }

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAX_ANALYSIS_PDF_BYTES) {
        throw new Error("Document is too large");
      }
      chunks.push(value);
    }

    const buffer = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return buffer;
  } finally {
    clearTimeout(timeout);
  }
}

async function extractTextFromPdf(pdfUrl: URL) {
  const dataBuffer = await readBoundedPdf(pdfUrl);
  return extractPdfText(dataBuffer);
}

async function generateDocumentText(docs: URL[]) {
  const parts = await Promise.all(
    docs.map(async (pdfUrl, i) => {
      try {
        const pdfText = await extractTextFromPdf(pdfUrl);
        return `\n\n--- Document ${i + 1} ---\n${pdfText}`;
      } catch (error) {
        console.error("Error extracting text from a selected PDF", error);
        return `\n\n--- Document ${i + 1} ---\n[extraction failed]`;
      }
    })
  );

  let extractedText = parts.join("");
  if (extractedText.length > MAX_COMBINED_DOCUMENT_CHARS) {
    extractedText =
      extractedText.slice(0, MAX_COMBINED_DOCUMENT_CHARS) +
      "\n\n--- Truncated ---\n";
  }
  return extractedText;
}

export async function analyzeDocuments(docs: string[], prompt: string) {
  const uid = await authenticateAction();

  if (parseFixturesEnabled()) {
    return fixtureStream([
      `[fixture] Would analyze ${docs.length} document(s). `,
      `Prompt length: ${prompt.length}. `,
      "Live Gemini parse quality is not proven by this fixture.",
    ]);
  }

  if (
    !Array.isArray(docs) ||
    docs.length === 0 ||
    docs.length > MAX_ANALYSIS_DOCUMENTS ||
    typeof prompt !== "string" ||
    prompt.trim().length === 0
  ) {
    throw new Error("Select between 1 and 10 documents and enter a prompt");
  }

  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET;
  const urls = docs.map((doc) => assertUserStoragePdfUrl(doc, uid, bucket));

  await chargeCredits(uid, ANALYSIS_CREDIT_COST);
  try {
    const extractedText = await generateDocumentText(urls);
    const finalPrompt = `prompt: ${prompt}\ndocument: ${extractedText}\n\nReturn plain text only. Do not use markdown or any other formatting.`;
    const messages: ModelMessage[] = [{ content: finalPrompt, role: "user" }];
    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages,
    });
    const stream = createStreamableValue(result.textStream);
    return stream.value;
  } catch (error) {
    await refundCredits(uid, ANALYSIS_CREDIT_COST).catch((refundError) => {
      console.error("Credit refund failed", refundError);
    });
    throw error;
  }
}
