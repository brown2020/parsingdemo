"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { streamText, type ModelMessage } from "ai";
import { google } from "@ai-sdk/google";
import { PDFParse } from "pdf-parse";

const FETCH_TIMEOUT_MS = 300_000; // 5 minutes
const MAX_COMBINED_DOCUMENT_CHARS = 200_000;

export async function continueConversation(messages: ModelMessage[]) {
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
  // Extract text from all PDFs with headers
  let extractedText = "";
  for (let i = 0; i < docs.length; i++) {
    const pdfUrl = docs[i];
    try {
      const pdfText = await extractTextFromPdf(pdfUrl);
      extractedText += `\n\n--- Document ${i + 1} ---\n${pdfText}`;
      if (extractedText.length > MAX_COMBINED_DOCUMENT_CHARS) {
        extractedText = extractedText.slice(0, MAX_COMBINED_DOCUMENT_CHARS);
        extractedText += "\n\n--- Truncated ---\n";
        break;
      }
    } catch (error) {
      console.error(`Error extracting text from PDF at ${pdfUrl}:`, error);
    }
  }
  return extractedText;
}

export async function analyzeDocuments(docs: string[], prompt: string) {
  const extractedText = await generateDocumentText(docs);
  const finalPrompt = `prompt: ${prompt}\ndocument: ${extractedText}\n\nReturn plain text only. Do not use markdown or any other formatting.`;

  const messages: ModelMessage[] = [{ content: finalPrompt, role: "user" }];

  const result = streamText({
    model: google("gemini-2.5-flash"),
    // model: openai("gpt-4o"),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
