import React, { useRef, useState } from "react";

const UploadButton = ({ onFilesSelect }) => {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    onFilesSelect(selectedFiles); // call the callback with the selected files
  };

  const handleClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="w-full h-full bg-white rounded-lg">
      <label
        htmlFor="file-upload"
        className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
      >
        <svg
          className="w-12 h-12 mx-auto text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v28a4 4 0 004 4h20a4 4 0 004-4V8a4 4 0 00-4-4H16a4 4 0 00-4 4z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 12h16m-16 4h16m-7 4h7m-7 4h7m-16 4h16"
          />
        </svg>
        {files.length > 0 ? (
          <div className="mt-1">
            {files.map((file) => (
              <div key={file.name}>
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:underline transition ease-in-out duration-150"
            >
              Upload a file
            </button>{" "}
            (click to upload)
          </span>
        )}
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          All pdf, doc, csv, xlsx types are supported
        </span>
      </label>
      <input
        id="file-upload"
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default UploadButton;
