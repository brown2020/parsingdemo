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
      className="relative group flex items-center justify-between p-2 border rounded-md hover:bg-gray-100"
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect(file, e.target.checked)}
        className="mr-2"
      />
      <span
        onClick={() => onClick(file)}
        className="text-blue-600 hover:underline cursor-pointer flex-1"
      >
        {file.name}
      </span>
      <select
        className="mr-2"
        value={file.client}
        onChange={(e) => onClientChange(file, e.target.value)}
      >
        <option value="groupOne">Group One</option>
        <option value="groupTwo">Group Two</option>
      </select>

      {file.urlPdf && (
        <button
          onClick={() => window.open(file.urlPdf!, "_blank")}
          className="text-blue-500 opacity-60 hover:opacity-100"
        >
          <FileIcon />
        </button>
      )}
      {file.urlTxt && (
        <button
          onClick={() => onTextClick(file)}
          className="text-blue-500 opacity-60 hover:opacity-100"
        >
          <FileTextIcon />
        </button>
      )}
      <button
        onClick={() => onDelete(file.id)}
        className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <Trash2 />
      </button>
    </li>
  );
};

export default FileItem;
