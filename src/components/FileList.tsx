import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import FileItem from "./FileItem";
import { FileUrl } from "@/types/FileUrl";

type ItemType = {
  file: FileUrl;
  index: number;
};

type FileListProps = {
  files: FileUrl[];
  clientType: string;
  onClientChange: (file: FileUrl, newClient: string) => void;
  onDelete: (id: string) => void;
  onClick: (file: FileUrl) => void;
  onTextClick: (file: FileUrl) => void;
  onSelect: (file: FileUrl, isSelected: boolean) => void;
  selectedFiles: Set<string>;
};

const FileList: React.FC<FileListProps> = ({
  files,
  clientType,
  onClientChange,
  onDelete,
  onClick,
  onTextClick,
  onSelect,
  selectedFiles,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop<ItemType, void, { isOver: boolean }>({
    accept: "FILE",
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      const newClient = clientType;
      onClientChange(item.file, newClient);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      className={`rounded-lg border-2 p-4 min-h-16 transition-colors ${
        isOver
          ? "border-blue-400 bg-blue-50"
          : "border-dashed border-slate-300 bg-white"
      }`}
    >
      <ul className="list-none pl-0 space-y-2">
        {files.length === 0 ? (
          <li className="muted text-sm">Drop files here…</li>
        ) : (
          files.map((file, index) => (
            <FileItem
              key={file.id}
              file={file}
              index={index}
              onClientChange={onClientChange}
              onDelete={onDelete}
              onClick={onClick}
              onTextClick={onTextClick}
              onSelect={onSelect}
              isSelected={selectedFiles.has(file.id)}
            />
          ))
        )}
      </ul>
    </div>
  );
};

export default FileList;
