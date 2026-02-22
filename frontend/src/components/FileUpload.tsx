"use client";

import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from './ui/Button';

interface FileUploadProps {
    onFileUpload: (file: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) setSelectedFile(file);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleUploadClick = () => {
        if (selectedFile) {
            onFileUpload(selectedFile);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="w-full max-w-xl mx-auto space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    glass-card cursor-pointer text-center py-16 px-8
                    border-2 border-dashed transition-all duration-300
                    ${isDragging
                        ? 'border-blue-400 bg-blue-500/10'
                        : 'border-white/20 hover:border-blue-400/50 hover:bg-white/5'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-white mb-1">
                    Drag & Drop your document here
                </p>
                <p className="text-sm text-gray-400">
                    or <span className="text-blue-400 underline">browse files</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    Supports PDF, Images (PNG, JPG), and Text files — Max 10MB
                </p>
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
                <div className="glass-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-400 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-white truncate max-w-[250px]">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-400">
                                {formatSize(selectedFile.size)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="primary" size="sm" onClick={handleUploadClick}>
                            <Upload className="w-4 h-4" /> Analyze
                        </Button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
