
import React, { useRef, useState } from 'react';
import { UploadIcon, FileTextIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onMultipleFilesSelect?: (files: FileList) => void;
  label: string;
  subLabel?: string;
  disabled?: boolean;
  multiple?: boolean;
  variant?: 'default' | 'compact';
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onMultipleFilesSelect, 
  label, 
  subLabel, 
  disabled,
  multiple = false,
  variant = 'default'
}) => {
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (multiple && onMultipleFilesSelect) {
        onMultipleFilesSelect(e.dataTransfer.files);
        setSelectedFileName(`${e.dataTransfer.files.length} 个文件`);
      } else {
        const file = e.dataTransfer.files[0];
        setSelectedFileName(file.name);
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    
    if (e.target.files && e.target.files.length > 0) {
       if (multiple && onMultipleFilesSelect) {
         onMultipleFilesSelect(e.target.files);
         setSelectedFileName(`${e.target.files.length} 个文件`);
       } else {
         const file = e.target.files[0];
         setSelectedFileName(file.name);
         onFileSelect(file);
       }
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div
      className={`relative w-full transition-all border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer
        ${isCompact ? "p-4" : "p-8 h-full"}
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
        multiple={multiple}
        onChange={handleChange}
        disabled={disabled}
      />
      
      {selectedFileName ? (
        <div className={`flex flex-col items-center text-indigo-600 ${isCompact ? 'flex-row gap-3' : ''}`}>
           <FileTextIcon className={`${isCompact ? 'w-6 h-6' : 'w-12 h-12 mb-3'}`} />
           <div className={isCompact ? 'text-left' : ''}>
               <p className={`font-semibold ${isCompact ? 'text-sm' : ''}`}>{selectedFileName}</p>
               {!isCompact && <p className="text-sm text-slate-500 mt-1">点击更换文件</p>}
           </div>
        </div>
      ) : (
        <div className={`flex flex-col items-center text-slate-500 ${isCompact ? 'flex-row gap-3' : ''}`}>
          <UploadIcon className={`${isCompact ? 'w-6 h-6' : 'w-12 h-12 mb-3'} text-slate-400`} />
          <div className={isCompact ? 'text-left' : ''}>
              <p className={`${isCompact ? 'text-sm' : 'text-lg'} font-medium text-slate-700`}>{label}</p>
              {subLabel && <p className={`text-sm ${isCompact ? 'text-slate-400' : 'mt-1 text-slate-400'}`}>{subLabel}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
