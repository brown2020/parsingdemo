import { FileUrl } from "@/types/FileUrl";
import React, { useEffect, useRef, useState } from "react";

type ModalTextProps = {
  isOpen: boolean;
  onClose: () => void;
  file: FileUrl | null;
};

const IFRAME_SANDBOX =
  "allow-same-origin allow-scripts allow-popups allow-forms";

const ModalText: React.FC<ModalTextProps> = ({ isOpen, onClose, file }) => {
  const [view, setView] = useState<"pdf" | "text">("pdf");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && file) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen, file]);

  if (!file) return null;

  const showPdf = view === "pdf" && Boolean(file.urlPdf);
  const showText = view === "text" && Boolean(file.urlTxt);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-xl border border-slate-200 bg-transparent p-0 shadow-xl backdrop:bg-black/40 max-w-3xl w-[calc(100%-2rem)]"
      onClose={onClose}
      aria-label="File preview"
    >
      <div className="card w-full overflow-hidden">
        <div className="card-header flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Preview</div>
            <div className="muted text-sm truncate" title={file.name}>
              {file.name}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon"
          >
            <span className="sr-only">Close</span>✕
          </button>
        </div>

        <div className="card-content space-y-4">
          <div className="flex flex-wrap gap-2">
            {file.urlPdf ? (
              <button
                type="button"
                onClick={() => setView("pdf")}
                className={view === "pdf" ? "btn-primary" : "btn-ghost"}
              >
                PDF
              </button>
            ) : null}
            {file.urlTxt ? (
              <button
                type="button"
                onClick={() => setView("text")}
                className={view === "text" ? "btn-primary" : "btn-ghost"}
              >
                Text
              </button>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white">
            {showPdf ? (
              <iframe
                title="PDF preview"
                src={file.urlPdf!}
                className="h-[70vh] w-full"
                sandbox={IFRAME_SANDBOX}
              />
            ) : null}
            {showText ? (
              <iframe
                title="Text preview"
                src={file.urlTxt!}
                className="h-[70vh] w-full"
                sandbox={IFRAME_SANDBOX}
              />
            ) : null}
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default ModalText;
