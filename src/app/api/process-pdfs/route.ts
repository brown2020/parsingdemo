import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

async function fetchAndConvertToBase64(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    console.log("Received request at /api/process-pdfs");
    const body = await req.json();
    console.log("Request body:", body);

    const { pdfUrls, prompt } = body;

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

    // Log the start of PDF processing
    console.log("Starting to process PDFs");

    // Convert the first PDF URL to base64
    const pdfBase64 = await fetchAndConvertToBase64(pdfUrls[0]);
    console.log("Converted first PDF to base64, length:", pdfBase64.length);

    const testBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
            {
              fileData: {
                mimeType: "application/pdf",
                fileUri:
                  "https://drive.google.com/file/d/1CCZ33XRH31tyLxBkPlSIm-mtcSzJu4lu/view?usp=drive_link",
              },
            },
          ],
        },
      ],
    };

    console.log("API request data constructed:", JSON.stringify(testBody));

    // Send Request to Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testBody),
    });

    console.log("API request sent to Gemini");
    const status = apiResponse.status;
    const data = await apiResponse.json();

    console.log(`Gemini API response status: ${status}`);
    console.log(`Gemini API response data: ${JSON.stringify(data)}`);

    if (!apiResponse.ok) {
      throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
    }

    // Handle API Response
    const extractedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No text found in response";

    console.log("Received response from Gemini API:", extractedText);

    return NextResponse.json({ result: extractedText });
  } catch (error) {
    console.error("Error processing PDFs:", error);
    return NextResponse.json(
      { error: "Failed to process PDFs" },
      { status: 500 }
    );
  }
}
