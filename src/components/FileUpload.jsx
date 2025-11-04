import { useState, useCallback, useRef } from 'react';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 15v-6m-3 3l3-3 3 3" />
    </svg>
);

export const FileUpload = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
      }
      onFileSelect(file);
    }
  };

  const handleFileChange = useCallback((e) => {
    handleFile(e.target.files?.[0]);
  }, [onFileSelect]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, [onFileSelect]);

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="text-center p-6 md:p-10 bg-white rounded-xl shadow-lg transition-all duration-300">
      <h2 className="text-xl md:text-2xl font-semibold text-slate-700 mb-2">Upload Your Chapter</h2>
      <p className="text-slate-500 mb-6">Let's get started by uploading an NCERT chapter in PDF format.</p>
      <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
        <input ref={inputRef} type="file" id="input-file-upload" accept=".pdf" className="hidden" onChange={handleFileChange} />
        <label
          htmlFor="input-file-upload"
          className={`h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <UploadIcon />
          <p className="text-slate-500 mt-2">
            <span className="font-semibold text-blue-600 cursor-pointer" onClick={onButtonClick}>Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-400 mt-1">PDF file only (Max 10MB)</p>
        </label>
      </form>
    </div>
  );
};

