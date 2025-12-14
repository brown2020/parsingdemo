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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="File preview"
    >
      <div className="card w-full max-w-3xl overflow-hidden">
        <div className="card-header flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Preview</div>
            <div className="muted text-sm truncate" title={file.name}>
              {file.name}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <span className="sr-only">Close</span>✕
          </button>
        </div>

        <div className="card-content space-y-4">
          <div className="flex flex-wrap gap-2">
            {file.urlPdf && (
              <button
                onClick={() => setView("pdf")}
                className={view === "pdf" ? "btn-primary" : "btn-ghost"}
              >
                PDF
              </button>
            )}
            {file.urlTxt && (
              <button
                onClick={() => setView("text")}
                className={view === "text" ? "btn-primary" : "btn-ghost"}
              >
                Text
              </button>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white">
            {view === "pdf" && file.urlPdf && (
              <iframe
                title="PDF preview"
                src={file.urlPdf}
                className="h-[70vh] w-full"
              />
            )}
            {view === "text" && file.urlTxt && (
              <iframe
                title="Text preview"
                src={file.urlTxt}
                className="h-[70vh] w-full"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalText;
