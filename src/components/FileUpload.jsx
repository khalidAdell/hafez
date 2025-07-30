"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, X, Check, AlertCircle, Image } from "lucide-react";
import { useTranslations } from "next-intl";

const FileUpload = ({ name, onFileChange, initialImage = "" }) => {
  const t = useTranslations();
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      const maxSize = 5 * 1024 * 1024; 
      
      if (!validTypes.includes(file.type)) {
        setError(t("invalid_file_type"));
        setIsUploaded(false);
        return;
      }
      
      if (file.size > maxSize) {
        setError(t("file_too_large"));
        setIsUploaded(false);
        return;
      }
      
      setError("");
      setPreview(URL.createObjectURL(file));
      setIsUploaded(true);
      onFileChange(name, file);
    } else {
      setError("");
      setPreview(initialImage);
      setIsUploaded(false);
      onFileChange(name, null);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const removeFile = () => {
    setPreview(initialImage);
    setIsUploaded(false);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileChange(name, null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    setPreview(initialImage);
    setIsUploaded(!!initialImage);
    return () => {
      if (preview && preview !== initialImage && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [initialImage]);

  return (
    <div className="w-full max-w-md mx-auto">
      
      <div className="relative">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/jpg,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />
        
        {/* Upload area */}
        <div
          onClick={openFileDialog}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative overflow-hidden cursor-pointer transition-all duration-300 ease-in-out
            border-2 border-dashed rounded-xl p-6
            ${isDragging 
              ? 'border-[#0B7459] bg-[#0B7459]/5 scale-[1.02]' 
              : isUploaded 
                ? 'border-[#0B7459] bg-[#0B7459]/5' 
                : 'border-gray-300 hover:border-[#0B7459] hover:bg-[#0B7459]/5'
            }
            ${error ? 'border-red-400 bg-red-50' : ''}
          `}
        >
          {preview ? (
            <div className="relative group">
              <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{t("change_image")}</p>
                </div>
              </div>
              
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors duration-200 opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Success indicator */}
              {isUploaded && (
                <div className="absolute top-2 left-2 bg-[#0B7459] text-white rounded-full p-1.5">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors duration-300 ${
                isDragging ? 'bg-[#0B7459] text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                <Image className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <p className={`text-lg font-semibold transition-colors duration-300 ${
                  isDragging ? 'text-[#0B7459]' : 'text-gray-700'
                }`}>
                  {isDragging ? t("drop_here") : t("choose_or_drag_image")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("supported_formats")}
                </p>
              </div>
              
              <div className="mt-4">
                <span className="inline-flex items-center px-4 py-2 border border-[#0B7459] text-[#0B7459] rounded-lg text-sm font-medium hover:bg-[#0B7459] hover:text-white transition-colors duration-200">
                  <Upload className="w-4 h-4 ml-2" />
                  {t("browse_files")}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mt-3 flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 ml-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Success message */}
        {isUploaded && !error && (
          <div className="mt-3 flex items-center text-[#0B7459] text-sm bg-[#0B7459]/10 p-3 rounded-lg border border-[#0B7459]/20">
            <Check className="w-4 h-4 ml-2 flex-shrink-0" />
            <span>{t("upload_success")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;