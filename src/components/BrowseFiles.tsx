"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  fetchFiles,
  uploadFile,
  deleteFile,
  updateFileMetadata,
} from "@/utils/fileUtils";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ModalText from "@/components/ModalText";
import FileList from "@/components/FileList";
import UploadZone from "@/components/UploadZone";
import SelectedFiles from "@/components/SelectedFiles";
import { FileUrl } from "@/types/FileUrl";

const BrowseFiles: React.FC = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const [files, setFiles] = useState<FileUrl[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<string>("groupTwo");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalFile, setModalFile] = useState<FileUrl | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set()
  );

  const handleFetchFiles = useCallback(async () => {
    if (userId) {
      try {
        const fileUrls = await fetchFiles(userId);
        setFiles(fileUrls);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Failed to fetch files.");
      }
    }
  }, [userId]);

  useEffect(() => {
    handleFetchFiles();
  }, [userId, handleFetchFiles]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    setError(null); // Reset error message
  }, []);

  const determineFileType = (file: File) => {
    const mimeType = file.type;
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (mimeType === "application/pdf" || extension === "pdf") {
      return "pdf";
    } else if (extension === "docx") {
      return "docx";
    } else if (extension === "eml") {
      return "eml";
    } else if (extension === "msg") {
      return "msg";
    } else if (mimeType.startsWith("image/")) {
      return "image";
    } else {
      return "unknown"; // You can handle unknown file types if needed
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0 && userId) {
      try {
        for (const file of selectedFiles) {
          const fileType = determineFileType(file); // Automatically determine the file type
          await uploadFile(file, userId, group, fileType); // Pass the determined file type
        }
        setSelectedFiles([]);
        await handleFetchFiles();
      } catch (uploadError: unknown) {
        const typedError = uploadError as Error;
        console.error(typedError);
        setError(typedError?.message || "Failed to upload file(s)");
      }
    }
  };

  const handleDelete = async (docId: string) => {
    if (!userId) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    if (confirm("Are you sure you want to delete this file?")) {
      try {
        await deleteFile(userId, docId);
        await handleFetchFiles();
      } catch (deleteError: unknown) {
        const typedError = deleteError as Error;
        console.error(typedError);
        setError(typedError?.message || "Failed to delete file");
      }
    }
  };

  const handleDeleteSelectedFiles = async () => {
    if (!userId) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    if (confirm("Are you sure you want to delete the selected files?")) {
      try {
        const fileIdsArray = Array.from(selectedFileIds);
        for (const fileId of fileIdsArray) {
          await deleteFile(userId, fileId);
        }
        setSelectedFileIds(new Set()); // Clear selected files
        await handleFetchFiles();
      } catch (deleteError: unknown) {
        const typedError = deleteError as Error;
        console.error(typedError);
        setError(typedError?.message || "Failed to delete selected files");
      }
    }
  };

  const handleFileClick = (file: FileUrl) => {
    setModalFile(file);
    setModalOpen(true);
  };

  const handleGroupChange = async (file: FileUrl, newGroup: string) => {
    const newFiles = files.map((f) =>
      f.id === file.id ? { ...f, client: newGroup } : f
    );
    setFiles(newFiles);
    try {
      await updateFileMetadata(userId!, file.id, newGroup, file.type);
    } catch (error) {
      console.error(error);
      setError("Failed to update file metadata.");
    }
  };

  const handleSelect = (file: FileUrl, isSelected: boolean) => {
    setSelectedFileIds((prevSelectedFileIds) => {
      const newSelectedFileIds = new Set(prevSelectedFileIds);
      if (isSelected) {
        newSelectedFileIds.add(file.id);
      } else {
        newSelectedFileIds.delete(file.id);
      }
      return newSelectedFileIds;
    });
  };

  const sortFiles = (files: FileUrl[]) => {
    const order: { [key: string]: number } = {
      pdf: 1,
      docx: 2,
      eml: 3,
      msg: 4,
      image: 5,
    };
    return files.sort((a, b) => {
      const aOrder = order[a.type] ?? Number.MAX_SAFE_INTEGER;
      const bOrder = order[b.type] ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
  };

  const groupOneFiles = sortFiles(
    files.filter((file) => file.client === "groupOne")
  );
  const groupTwoFiles = sortFiles(
    files.filter((file) => file.client === "groupTwo")
  );

  const handleTextClick = (file: FileUrl) => {
    setModalFile(file);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalFile(null);
  };

  if (!user) return null;

  const selectedFilesList = files.filter((file) =>
    selectedFileIds.has(file.id)
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg w-full">
        <div className="text-3xl font-bold mb-6 text-center">Browse Files</div>
        <div className="bg-gray-100 p-4 rounded-md mb-6 shadow-sm">
          <div className="text-lg font-semibold">
            <strong>User:</strong> {user.fullName}
          </div>
          <div className="text-lg">
            <strong>User ID:</strong> {userId}
          </div>
        </div>

        <UploadZone
          onDrop={onDrop}
          onUpload={handleUpload}
          selectedFiles={selectedFiles}
        />

        {error && (
          <div className="text-red-600 font-semibold mt-4 mb-6">{error}</div>
        )}

        <div className="flex items-center space-x-4 mb-6 mt-4">
          <label className="font-semibold text-lg">Group:</label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="p-2 border rounded-md shadow-sm focus:ring focus:ring-blue-500"
          >
            <option value="groupTwo">Group Two</option>
            <option value="groupOne">Group One</option>
          </select>
        </div>

        <button
          className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md mb-6 transition ${
            selectedFileIds.size === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleDeleteSelectedFiles}
          disabled={selectedFileIds.size === 0}
        >
          Delete Selected Files
        </button>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Group One Files:
          </h3>
          <FileList
            files={groupOneFiles}
            clientType="groupOne"
            onClientChange={handleGroupChange}
            onDelete={handleDelete}
            onClick={handleFileClick}
            onTextClick={handleTextClick}
            onSelect={handleSelect}
            selectedFiles={selectedFileIds}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Group Two Files:
          </h3>
          <FileList
            files={groupTwoFiles}
            clientType="groupTwo"
            onClientChange={handleGroupChange}
            onDelete={handleDelete}
            onClick={handleFileClick}
            onTextClick={handleTextClick}
            onSelect={handleSelect}
            selectedFiles={selectedFileIds}
          />
        </div>

        <ModalText isOpen={modalOpen} onClose={closeModal} file={modalFile} />
        <SelectedFiles selectedFiles={selectedFilesList} />
      </div>
    </DndProvider>
  );
};

export default BrowseFiles;
