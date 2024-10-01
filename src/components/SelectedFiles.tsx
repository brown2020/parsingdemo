import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { FileUrl } from "@/types/FileUrl";
import { analyzeDocuments } from "@/lib/generateActions";
import { readStreamableValue } from "ai/rsc";
import ClipLoader from "react-spinners/ClipLoader";

type SelectedFilesProps = {
  selectedFiles: FileUrl[];
};

const SelectedFiles: React.FC<SelectedFilesProps> = ({ selectedFiles }) => {
  const [prompt, setPrompt] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<string>("");
  const [streamResponse, setStreamResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleAnalyzeDocuments = async () => {
    const pdfUrls: string[] = selectedFiles
      .map((file) => file.urlPdf)
      .filter((url): url is string => url !== null);

    console.log("PDF URLs:", pdfUrls);
    console.log("Prompt:", prompt);

    if (pdfUrls.length === 0 || !prompt) {
      setApiResponse(
        "Error: Please select at least one PDF and provide a prompt."
      );
      return;
    }

    // Clear previous responses before starting new analysis
    setApiResponse("");
    setStreamResponse("");

    try {
      setLoading(true); // Start the loader

      // Assuming analyzeDocuments returns a streamable value
      const result = await analyzeDocuments(pdfUrls, prompt);

      // Read and stream the response
      setApiResponse("Processing...");
      for await (const content of readStreamableValue(result)) {
        if (content) setStreamResponse(content);
      }
      setApiResponse("Processing complete");
    } catch (error) {
      console.error("Error analyzing documents:", error);
      setApiResponse("Error analyzing documents");
    } finally {
      setLoading(false); // Stop the loader
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">Selected Files:</h3>
      {selectedFiles.length === 0 ? (
        <p>No files selected.</p>
      ) : (
        <ul className="list-none pl-0 space-y-2">
          {selectedFiles.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <div className="flex-1 break-all">
                <p>
                  <strong>Name:</strong> {file.name}
                </p>
                <p>
                  <strong>URL:</strong> {file.urlPdf}
                </p>
                <p>
                  <strong>Group:</strong> {file.client}
                </p>
                <p>
                  <strong>Type:</strong> {file.type}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <h4 className="text-lg font-semibold mb-2">Enter Prompt:</h4>
        <TextareaAutosize
          minRows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Type your prompt here..."
        />
      </div>
      <div className="mt-4">
        <button
          onClick={handleAnalyzeDocuments}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <ClipLoader size={20} color={"#ffffff"} loading={loading} />
          ) : (
            "Analyze and Stream"
          )}
        </button>
      </div>
      {apiResponse && (
        <div className="mt-4 p-4 border rounded-md bg-gray-100">
          <h4 className="text-lg font-semibold mb-2">API Response:</h4>
          <pre className="whitespace-pre-wrap">{apiResponse}</pre>
        </div>
      )}

      {streamResponse && (
        <div className="mt-4 p-4 border rounded-md bg-gray-100">
          <h4 className="text-lg font-semibold mb-2">Stream Response:</h4>
          <pre className="whitespace-pre-wrap">{streamResponse}</pre>
        </div>
      )}
    </div>
  );
};

export default SelectedFiles;
