import React, { useRef, useState } from "react";
import UploadIconCSV from "@/icons/UploadIconCSV";

const UploadButton = ({
  label,
  onFilesSelect,
}: {
  label: string;
  onFilesSelect: (files: File[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("Click or drag files here...");
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const selectedFiles = Array.from(files).filter((file) =>
      file.name.endsWith(".csv")
    );

    if (selectedFiles.length > 0) {
      setFileName(selectedFiles[0].name);
      setIsFileSelected(true);
      onFilesSelect(selectedFiles);
    } else {
      setIsFileSelected(false);
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
  };

  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelect(event.dataTransfer.files);
  };

  return (
    <label
      className={`w-96 h-80 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer 
        ${
          isDragging
            ? "border-blue-500 bg-blue-100"
            : "border-blue-300 bg-blue-50 hover:bg-blue-100"
        }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex flex-col items-center justify-center">
        <UploadIconCSV className="w-16 h-16 mb-4 text-blue-400" />
        {isFileSelected ? (
          <>
            <p className="mb-2 text-sm text-blue-500 font-semibold">
              {fileName}
            </p>
          </>
        ) : (
          <>
            <p className="mb-2 text-gray-500">
              Drag & drop or{" "}
              <span className="font-semibold text-gray-900 underline decoration-indigo-500">
                click to upload {label}
              </span>
            </p>
            <p className="text-xs text-blue-500">Only accepts .CSV files</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={onInputChange}
        className="absolute inset-0 w-full h-full opacity-0"
        style={{ zIndex: -1 }}
      />
    </label>
  );
};

export default UploadButton;
