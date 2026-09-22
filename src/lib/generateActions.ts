"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { streamText, type ModelMessage } from "ai";
import { google } from "@ai-sdk/google";
import { PDFParse } from "pdf-parse";
import { authenticateAction } from "@/utils/serverAuth";

const FETCH_TIMEOUT_MS = 300_000; // 5 minutes
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
  await authenticateAction();
  if (parseFixturesEnabled()) {
    return fixtureStream([
      "[fixture] AI analysis skipped (PARSE_USE_FIXTURES=true). ",
      "Live Gemini quality and latency are not proven by this fixture.",
    ]);
  }

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

async function fetchArrayBufferWithTimeout(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Failed to fetch PDF (${res.status})`);
    }
    return await res.arrayBuffer();
  } finally {
    clearTimeout(timeout);
  }
}

async function extractTextFromPdf(pdfUrl: string) {
  try {
    const dataBuffer = await fetchArrayBufferWithTimeout(pdfUrl);
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    return data.text;
  } catch (error) {
    console.error("Error downloading or parsing PDF:", pdfUrl, error);
    throw error;
  }
}

async function generateDocumentText(docs: string[]) {
  const parts = await Promise.all(
    docs.map(async (pdfUrl, i) => {
      try {
        const pdfText = await extractTextFromPdf(pdfUrl);
        return `\n\n--- Document ${i + 1} ---\n${pdfText}`;
      } catch (error) {
        console.error(`Error extracting text from PDF at ${pdfUrl}:`, error);
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
  await authenticateAction();

  if (parseFixturesEnabled()) {
    return fixtureStream([
      `[fixture] Would analyze ${docs.length} document(s). `,
      `Prompt length: ${prompt.length}. `,
      "Live Gemini parse quality is not proven by this fixture.",
    ]);
  }

  const extractedText = await generateDocumentText(docs);
  const finalPrompt = `prompt: ${prompt}\ndocument: ${extractedText}\n\nReturn plain text only. Do not use markdown or any other formatting.`;

  const messages: ModelMessage[] = [{ content: finalPrompt, role: "user" }];

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
