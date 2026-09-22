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

  const selectId = `file-select-${file.id}`;
  const groupId = `file-group-${file.id}`;

  return (
    <li
      ref={ref}
      className="relative group flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white p-3 hover:bg-slate-50"
    >
      <input
        id={selectId}
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect(file, e.target.checked)}
        className="h-4 w-4 accent-blue-700"
        aria-label={`Select ${file.name}`}
      />
      <button
        type="button"
        onClick={() => onClick(file)}
        className="link cursor-pointer flex-1 truncate text-left bg-transparent border-0 p-0"
        title={file.name}
      >
        {file.name}
      </button>
      <label htmlFor={groupId} className="sr-only">
        Group for {file.name}
      </label>
      <select
        id={groupId}
        className="select"
        value={file.client}
        onChange={(e) => onClientChange(file, e.target.value)}
      >
        <option value="groupOne">Group One</option>
        <option value="groupTwo">Group Two</option>
      </select>

      {file.urlPdf && (
        <button
          type="button"
          onClick={() => window.open(file.urlPdf!, "_blank", "noopener,noreferrer")}
          className="btn btn-ghost btn-icon text-slate-800"
          aria-label={`Open PDF for ${file.name}`}
        >
          <FileIcon aria-hidden />
        </button>
      )}
      {file.urlTxt && (
        <button
          type="button"
          onClick={() => onTextClick(file)}
          className="btn btn-ghost btn-icon text-slate-800"
          aria-label={`Open text preview for ${file.name}`}
        >
          <FileTextIcon aria-hidden />
        </button>
      )}
      <button
        type="button"
        onClick={() => onDelete(file.id)}
        className="btn btn-ghost btn-icon text-red-700 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
        aria-label={`Delete ${file.name}`}
      >
        <Trash2 aria-hidden />
      </button>
    </li>
  );
};

export default FileItem;
