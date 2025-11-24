import React, { useRef, useState } from 'react';
import { UploadIcon, FileTextIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, label, subLabel, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`relative w-full p-8 transition-all border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer
        ${dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-white"}
        ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : "hover:border-indigo-400 hover:bg-slate-50"}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleChange}
        disabled={disabled}
      />
      
      {selectedFileName ? (
        <div className="flex flex-col items-center text-indigo-600">
           <FileTextIcon className="w-12 h-12 mb-3" />
           <p className="font-semibold">{selectedFileName}</p>
           <p className="text-sm text-slate-500 mt-1">Click to change file</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-slate-500">
          <UploadIcon className="w-12 h-12 mb-3 text-slate-400" />
          <p className="text-lg font-medium text-slate-700">{label}</p>
          {subLabel && <p className="text-sm mt-1 text-slate-400">{subLabel}</p>}
        </div>
      )}
    </div>
  );
};