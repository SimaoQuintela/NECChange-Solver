import React, { useRef, useState } from 'react';

const UploadButton = ({ onFilesSelect }) => {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('Click to browse...');
  const [isFileSelected, setIsFileSelected] = useState(false);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    onFilesSelect(selectedFiles);
    if (selectedFiles.length > 0) {
      setFileName(selectedFiles[0].name);
      setIsFileSelected(true);
    } else {
      setIsFileSelected(false);
    }
  };

  return (
    <label className="w-96 h-80 border-2 border-blue-300 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer bg-blue-50 hover:bg-blue-100">
      <div className="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-16 h-16 mb-4 text-blue-400">
          <path d="M14 13v4H10v-4H7l5-5 5 5h-3zm-4 6v2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h1"></path>
        </svg>
        {isFileSelected ? (
          <>
            <p className="mb-2 text-sm text-blue-500 font-semibold">{fileName}</p>
            <p className="text-xs text-blue-500 opacity-0">CSV</p>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm text-blue-500">Insira um ficheiro ...</p>
            <p className="text-xs text-blue-500">CSV</p>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0" style={{ zIndex: -1 }} />
    </label>
  );
};

export default UploadButton;
