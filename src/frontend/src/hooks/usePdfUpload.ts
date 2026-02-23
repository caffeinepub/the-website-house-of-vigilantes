import { useState, useCallback } from 'react';

interface PdfUploadState {
  file: File | null;
  fileName: string;
  fileSize: number;
  uploadProgress: number;
  error: string | null;
  isUploading: boolean;
  fileData: Uint8Array | null;
}

export function usePdfUpload() {
  const [state, setState] = useState<PdfUploadState>({
    file: null,
    fileName: '',
    fileSize: 0,
    uploadProgress: 0,
    error: null,
    isUploading: false,
    fileData: null,
  });

  const validateFile = (file: File): string | null => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF files are allowed';
    }

    // Check file size (1GB = 1073741824 bytes)
    const maxSize = 1073741824;
    if (file.size > maxSize) {
      return 'File size must not exceed 1GB';
    }

    return null;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const error = validateFile(file);
    
    if (error) {
      setState(prev => ({ ...prev, error, file: null, fileData: null }));
      return;
    }

    setState(prev => ({
      ...prev,
      file,
      fileName: file.name,
      fileSize: file.size,
      error: null,
      uploadProgress: 0,
      isUploading: true,
    }));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      setState(prev => ({ 
        ...prev, 
        fileData: uint8Array,
        isUploading: false,
        uploadProgress: 100,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to process PDF file',
        file: null,
        fileData: null,
        isUploading: false,
      }));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const removeFile = useCallback(() => {
    setState({
      file: null,
      fileName: '',
      fileSize: 0,
      uploadProgress: 0,
      error: null,
      isUploading: false,
      fileData: null,
    });
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return {
    ...state,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    removeFile,
    formatFileSize,
  };
}
