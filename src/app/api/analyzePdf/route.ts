import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { PDFParse } from "pdf-parse";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function extractTextFromPdf(pdfUrl: string) {
  try {
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const dataBuffer = response.data;
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    return data.text;
  } catch (error) {
    console.error("Error downloading or parsing PDF:", error);
    throw error;
  }
}

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
  try {
    console.log("Received request at /api/analyzePdf");
    const body = await req.json();
    console.log("Request body:", body);

    const { pdfUrls, prompt } = body;

    console.log("PDF URLs:", pdfUrls);
    console.log("Prompt:", prompt);

    if (!pdfUrls || !Array.isArray(pdfUrls) || !prompt) {
      console.error("Invalid input:", { pdfUrls, prompt });
      return NextResponse.json(
        {
          error:
            "Invalid input. Please provide a valid array of PDF URLs and a prompt.",
        },
        { status: 400 }
      );
    }

    // Extract text from all PDFs with headers
    let extractedText = "";
    for (let i = 0; i < pdfUrls.length; i++) {
      const pdfUrl = pdfUrls[i];
      try {
        const pdfText = await extractTextFromPdf(pdfUrl);
        extractedText += `\n\n--- Document ${i + 1} ---\n${pdfText}`;
        console.log(`Extracted text from PDF ${i + 1}:`, pdfText);
      } catch (error) {
        console.error(`Error extracting text from PDF at ${pdfUrl}:`, error);
      }
    }

    const finalPrompt = `prompt: ${prompt}\ndocument: ${extractedText}\n\nReturn plain text only. Do not use markdown or any other formatting.`;
    console.log("Final prompt:", finalPrompt);

    const result = await model.generateContent(finalPrompt);

    const response = await result.response;
    const text = await response.text();
    console.log(text);

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("Error processing PDFs:", error);
    return NextResponse.json(
      { error: "Failed to process PDFs" },
      { status: 500 }
    );
  }
}
