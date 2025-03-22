import React, { useState, useRef } from 'react';
import { Upload, File, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  acceptedTypes = '.pdf,.txt,.docx,.md',
  maxSizeMB = 10
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    validateAndAddFiles(selectedFiles);
  };

  const validateAndAddFiles = (selectedFiles: File[]) => {
    // Check if total files exceed max limit
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `You can only upload up to ${maxFiles} files at once.`,
        variant: 'destructive'
      });
      return;
    }

    // Filter files by validation
    const validFiles: File[] = [];
    const invalidFiles: { name: string, reason: string }[] = [];

    selectedFiles.forEach(file => {
      // Check file type
      const fileExtension = '.' + file.name.split('.').pop();
      const isValidType = acceptedTypes.includes(fileExtension.toLowerCase());
      
      // Check file size
      const isValidSize = file.size <= maxSizeBytes;

      if (isValidType && isValidSize) {
        validFiles.push(file);
      } else {
        invalidFiles.push({
          name: file.name,
          reason: !isValidType 
            ? `File type ${fileExtension} not supported` 
            : `File exceeds ${maxSizeMB}MB limit`
        });
      }
    });

    // Report invalid files
    if (invalidFiles.length > 0) {
      toast({
        title: `${invalidFiles.length} file(s) could not be uploaded`,
        description: invalidFiles.map(f => `${f.name}: ${f.reason}`).join(', '),
        variant: 'destructive'
      });
    }

    // Add valid files
    if (validFiles.length > 0) {
      const newFiles = [...files, ...validFiles];
      setFiles(newFiles);
      onFilesUploaded(newFiles);
      
      toast({
        title: 'Files added',
        description: `${validFiles.length} file(s) added successfully`,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesUploaded(newFiles);
  };

  const clearAll = () => {
    setFiles([]);
    onFilesUploaded([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full mb-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-10 w-10 mx-auto mb-2 text-purple-500" />
        <p className="text-sm mb-1">Drag and drop files here, or click to select files</p>
        <p className="text-xs text-gray-500">
          Accepted formats: {acceptedTypes} (max {maxSizeMB}MB per file)
        </p>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          multiple
          onChange={handleFileChange}
          accept={acceptedTypes}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Uploaded Files ({files.length})</h3>
            <Button 
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-xs h-7 px-2"
            >
              Clear All
            </Button>
          </div>
          
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                <div className="flex items-center overflow-hidden">
                  <File className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-gray-500 hover:text-red-500 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;