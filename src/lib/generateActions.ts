"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { google } from "@ai-sdk/google";
import axios from "axios";
import pdf from "pdf-parse";

// Set a 5-minute timeout for Axios requests
const axiosInstance = axios.create({
  timeout: 300000, // 300,000 ms (5 minutes)
});

export async function continueConversation(messages: CoreMessage[]) {
  const result = streamText({
    model: google("models/gemini-1.5-pro-latest"),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

async function extractTextFromPdf(pdfUrl: string) {
  try {
    const response = await axiosInstance.get(pdfUrl, {
      responseType: "arraybuffer",
    });
    const dataBuffer = response.data;
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("Error downloading or parsing PDF:", error);
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
      console.log(`Extracted text from PDF ${i + 1}:`, pdfText);
    } catch (error) {
      console.error(`Error extracting text from PDF at ${pdfUrl}:`, error);
    }
  }
  return extractedText;
}

export async function analyzeDocuments(docs: string[], prompt: string) {
  const extractedText = await generateDocumentText(docs);
  const finalPrompt = `prompt: ${prompt}\ndocument: ${extractedText}\n\nReturn plain text only. Do not use markdown or any other formatting.`;
  console.log("Final prompt:", finalPrompt);

  const messages: CoreMessage[] = [{ content: finalPrompt, role: "user" }];

  const result = streamText({
    model: google("models/gemini-1.5-pro-latest"),
    // model: openai("gpt-4o"),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
