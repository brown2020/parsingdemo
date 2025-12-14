import React, { useRef } from "react";
import { useDrag } from "react-dnd";
import { Trash2, FileTextIcon, FileIcon } from "lucide-react";
import { FileUrl } from "@/types/FileUrl";

type FileItemProps = {
  file: FileUrl;
  index: number;
  onClientChange: (file: FileUrl, newClient: string) => void;
  onDelete: (id: string) => void;
  onClick: (file: FileUrl) => void;
  onTextClick: (file: FileUrl) => void;
  onSelect: (file: FileUrl, isSelected: boolean) => void;
  isSelected: boolean;
};

const FileItem: React.FC<FileItemProps> = ({
  file,
  index,
  onClientChange,
  onDelete,
  onClick,
  onTextClick,
  onSelect,
  isSelected,
}) => {
  const ref = useRef<HTMLLIElement>(null);
  const [, drag] = useDrag({
    type: "FILE",
    item: { file, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  drag(ref);

  return (
    <li
      ref={ref}
      key={file.id}
      className="relative group flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white p-3 hover:bg-slate-50"
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect(file, e.target.checked)}
        className="h-4 w-4 accent-blue-600"
      />
      <span
        onClick={() => onClick(file)}
        className="link cursor-pointer flex-1 truncate"
        title={file.name}
      >
        {file.name}
      </span>
      <select
        className="select"
        value={file.client}
        onChange={(e) => onClientChange(file, e.target.value)}
      >
        <option value="groupOne">Group One</option>
        <option value="groupTwo">Group Two</option>
      </select>

      {file.urlPdf && (
        <button
          onClick={() => window.open(file.urlPdf!, "_blank")}
          className="btn btn-ghost btn-icon text-slate-700"
          aria-label="Open PDF"
        >
          <FileIcon />
        </button>
      )}
      {file.urlTxt && (
        <button
          onClick={() => onTextClick(file)}
          className="btn btn-ghost btn-icon text-slate-700"
          aria-label="Open text preview"
        >
          <FileTextIcon />
        </button>
      )}
      <button
        onClick={() => onDelete(file.id)}
        className="btn btn-ghost btn-icon text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete file"
      >
        <Trash2 />
      </button>
    </li>
  );
};

export default FileItem;
