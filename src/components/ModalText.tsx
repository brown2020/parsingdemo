import { FileUrl } from "@/types/FileUrl";
import React, { useState } from "react";

type ModalTextProps = {
  isOpen: boolean;
  onClose: () => void;
  file: FileUrl | null;
};

const ModalText: React.FC<ModalTextProps> = ({ isOpen, onClose, file }) => {
  const [view, setView] = useState<"pdf" | "text">("pdf");

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-lg w-full">
        <button onClick={onClose} className="text-red-600 float-right">
          X
        </button>
        <h2 className="text-xl font-bold mb-4">File Information</h2>
        <p>
          <strong>Filename:</strong> {file.name}
        </p>
        <div className="mb-4">
          {file.urlPdf && (
            <button
              onClick={() => setView("pdf")}
              className={`mr-2 p-2 ${
                view === "pdf" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              View PDF
            </button>
          )}
          {file.urlTxt && (
            <button
              onClick={() => setView("text")}
              className={`mr-2 p-2 ${
                view === "text" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              View Text
            </button>
          )}
        </div>
        <div className="border p-4">
          {view === "pdf" && file.urlPdf && (
            <iframe src={file.urlPdf} className="w-full h-96" />
          )}
          {view === "text" && file.urlTxt && (
            <iframe src={file.urlTxt} className="w-full h-96" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalText;
