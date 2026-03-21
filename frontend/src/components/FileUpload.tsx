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
                    relative overflow-hidden cursor-pointer text-center py-20 px-8
                    rounded-[2.5rem] border-2 transition-all duration-500 ease-out group
                    ${isDragging
                        ? 'border-indigo-400 bg-indigo-50/90 scale-[1.02] shadow-2xl shadow-indigo-500/10'
                        : 'border-dashed border-slate-300 bg-white/50 backdrop-blur-md hover:border-indigo-400 hover:bg-white hover:shadow-xl'
                    }
                `}
            >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-transparent to-purple-50/50 opacity-0 transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'group-hover:opacity-100'}`} />
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                
                <div className="relative z-10 w-24 h-24 rounded-3xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-8 group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300">
                  <div className={`absolute inset-0 bg-indigo-50 rounded-3xl transition-opacity duration-500 ${isDragging ? 'opacity-100 animate-ping' : 'opacity-0 group-hover:opacity-100'}`} />
                  <Upload className="relative z-10 w-10 h-10 text-indigo-600" />
                </div>
                
                <p className="relative z-10 text-2xl font-black tracking-tight text-slate-800 mb-2">
                    Drop your document here
                </p>
                <p className="relative z-10 text-base text-slate-500 font-medium">
                    or <span className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline decoration-indigo-300 underline-offset-4 transition-all">browse files</span>
                </p>
                <p className="relative z-10 text-xs text-slate-400 mt-6 font-bold uppercase tracking-widest bg-slate-100/50 inline-block px-4 py-1.5 rounded-full border border-slate-200">
                    PDF, PNG, JPG — Max 15MB
                </p>
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
                <div className="glass-card flex items-center justify-between animate-in">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                           <FileText className="w-6 h-6 text-blue-600 shrink-0" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[250px]">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                                {formatSize(selectedFile.size)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                           onClick={handleUploadClick}
                           className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" /> Analyze
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                            className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
