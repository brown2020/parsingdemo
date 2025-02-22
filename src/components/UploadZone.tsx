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
        className={`border-2 border-dashed rounded-lg p-4 mb-4 cursor-pointer ${
          isDragActive ? "border-blue-600" : "border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>{`Drag 'n' drop some files here, or click to select files`}</p>
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
      <button
        onClick={onUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
      >
        Upload
      </button>
    </div>
  );
};

export default UploadZone;
