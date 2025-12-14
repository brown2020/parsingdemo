import React from "react";
import { useDropzone } from "react-dropzone";

type UploadZoneProps = {
  onDrop: (acceptedFiles: File[]) => void;
  onUpload: () => void;
  selectedFiles: File[];
};

const UploadZone: React.FC<UploadZoneProps> = ({
  onDrop,
  onUpload,
  selectedFiles,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed p-6 mb-4 cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-600 bg-blue-50"
            : "border-slate-300 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="font-medium">Drop the files here…</p>
        ) : (
          <div className="space-y-1">
            <p className="font-medium">{`Drag & drop files here`}</p>
            <p className="muted text-sm">{`or click to browse`}</p>
          </div>
        )}
      </div>
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <strong>Selected files:</strong>
          <ul className="list-disc pl-5">
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={onUpload} className="btn-primary">
        Upload
      </button>
    </div>
  );
};

export default UploadZone;
