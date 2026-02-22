"use client";

import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { RedactionConfig } from '@/components/RedactionConfig';
import { Button } from '@/components/ui/Button';
import axios from 'axios';
import { Shield, Lock, FileText, CheckCircle, ArrowLeft, Download, Eye, RotateCcw, Scan, Zap, KeyRound } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const API_URL = 'http://localhost:8000';

export default function Home() {
  const [step, setStep] = useState<'upload' | 'configure' | 'password' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [redactionLevel, setRedactionLevel] = useState<string>('medium');
  const [redactedPdfUrl, setRedactedPdfUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('redacted_document.pdf');
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [pdfPassword, setPdfPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setStep('configure');
  };

  const doRedact = async (password?: string) => {
    if (!selectedFile) return;

    setStep('processing');
    setError(null);
    setPasswordError(null);
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('redaction_level', redactionLevel);
      if (password) {
        formData.append('password', password);
      }

      const response = await axios.post(`${API_URL}/redact`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
        validateStatus: (status) => status < 500, // Don't throw on 4xx
      });

      // Check if password is required (HTTP 423)
      if (response.status === 423) {
        // Parse the JSON error from the blob response
        const text = await response.data.text();
        const errorData = JSON.parse(text);

        if (errorData.error === 'password_required') {
          setPasswordError(password ? errorData.message : null);
          setPdfPassword('');
          setStep('password');
          return;
        }
      }

      // Check for other errors
      if (response.status >= 400) {
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          setError(errorData.detail || 'Error processing file.');
        } catch {
          setError('Error processing file. Make sure the backend is running.');
        }
        setStep('configure');
        return;
      }

      // Success — create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setRedactedPdfUrl(url);

      setProcessingTime(Math.round((Date.now() - startTime) / 1000));

      const disposition = response.headers['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?(.+?)"?$/);
        if (match) setDownloadFilename(match[1]);
      } else {
        const nameWithoutExt = selectedFile.name.replace(/\.(pdf|png|jpg|jpeg|bmp|tiff?)$/i, '');
        setDownloadFilename(`${nameWithoutExt}_redacted.pdf`);
      }

      setStep('result');
    } catch (err: any) {
      console.error('Redaction error:', err);
      setError('Error processing file. Make sure the backend server is running on port 8000.');
      setStep('configure');
    }
  };

  const handleProceed = () => doRedact();

  const handlePasswordSubmit = () => {
    if (!pdfPassword.trim()) {
      setPasswordError('Please enter the password.');
      return;
    }
    doRedact(pdfPassword);
  };

  const handleDownload = () => {
    if (!redactedPdfUrl) return;
    const a = document.createElement('a');
    a.href = redactedPdfUrl;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (redactedPdfUrl) {
      URL.revokeObjectURL(redactedPdfUrl);
    }
    setStep('upload');
    setSelectedFile(null);
    setRedactedPdfUrl(null);
    setRedactionLevel('medium');
    setError(null);
    setProcessingTime(null);
    setPdfPassword('');
    setPasswordError(null);
  };

  return (
    <main className="min-h-screen p-8 md:p-24 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Privacy-First Document Protection</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Safe<span className="text-gradient">Doc</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Automatically detect and redact sensitive PII from your documents.
            Upload once, download safe. Aadhaar, PAN, Passport & more — gone in seconds.
          </p>
        </header>

        {/* Step Indicator */}
        {step !== 'upload' && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <button 
              onClick={handleReset}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Start Over
            </button>
            <span className="text-gray-600 mx-2">|</span>
            <div className="flex items-center gap-2">
              <StepDot active={false} done={true} label="Upload" />
              <StepLine />
              <StepDot
                active={step === 'configure' || step === 'password'}
                done={step === 'processing' || step === 'result'}
                label="Configure"
              />
              <StepLine />
              <StepDot active={step === 'processing'} done={step === 'result'} label="Process" />
              <StepLine />
              <StepDot active={step === 'result'} done={false} label="Download" />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="w-full">
          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-8">
              <FileUpload onFileUpload={handleFileUpload} />

              <div className="grid md:grid-cols-4 gap-5 mt-12">
                {[
                  { icon: Scan, title: "Smart Detection", desc: "Auto-detects scanned vs digital documents for optimal redaction." },
                  { icon: Lock, title: "Permanent Redaction", desc: "Redacted data is irrecoverable. Flattened, clean output." },
                  { icon: Zap, title: "Instant Processing", desc: "Upload → Redact → Download in seconds. No waiting." },
                  { icon: CheckCircle, title: "Privacy First", desc: "Documents processed in-memory. Nothing stored permanently." }
                ].map((feature, i) => (
                  <div key={i} className="glass-card flex flex-col items-center text-center space-y-3">
                    <feature.icon className="w-8 h-8 text-blue-400" />
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Configure Redaction Level */}
          {step === 'configure' && selectedFile && (
            <div className="space-y-6">
              {error && (
                <div className="max-w-xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                  ⚠️ {error}
                </div>
              )}
              <RedactionConfig 
                selectedLevel={redactionLevel}
                onSelectLevel={setRedactionLevel}
                onProceed={handleProceed}
                fileName={selectedFile.name}
              />
            </div>
          )}

          {/* STEP 2.5: Password Required */}
          {step === 'password' && selectedFile && (
            <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="glass-card max-w-md w-full space-y-6 text-center">
                <div className="inline-flex p-4 rounded-2xl bg-amber-500/15 mx-auto">
                  <KeyRound className="w-10 h-10 text-amber-400" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Password Protected</h2>
                  <p className="text-gray-400 text-sm">
                    <span className="text-blue-400 font-medium">{selectedFile.name}</span> is locked.
                    Enter the document password to proceed.
                  </p>
                </div>

                {passwordError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    type="password"
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    placeholder="Enter PDF password"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 
                      text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/60 
                      focus:ring-2 focus:ring-blue-400/20 transition-all text-center text-lg tracking-wider"
                  />
                  
                  <button
                    onClick={handlePasswordSubmit}
                    className="w-full px-6 py-3 rounded-xl font-semibold text-sm
                      bg-gradient-to-r from-blue-500 to-purple-600 text-white
                      hover:from-blue-600 hover:to-purple-700
                      shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                      transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Unlock & Redact →
                  </button>

                  <button
                    onClick={handleReset}
                    className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Processing */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-20">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-pulse" />
                <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin" />
                <Shield className="absolute inset-0 m-auto w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Redacting Document...</h2>
              <p className="text-gray-400 text-center max-w-md">
                {redactionLevel === 'low' && "Detecting Aadhaar & PAN numbers..."}
                {redactionLevel === 'medium' && "Detecting IDs, phone numbers, passport & more..."}
                {redactionLevel === 'high' && "Deep scan — detecting all PII across your document..."}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                Processing locally — your data never leaves your machine
              </div>
            </div>
          )}

          {/* STEP 4: Result — PDF Preview & Download */}
          {step === 'result' && redactedPdfUrl && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Redaction Complete ✓</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Level: <span className="capitalize font-medium text-blue-400">{redactionLevel}</span>
                    {' · '}
                    {downloadFilename}
                    {processingTime !== null && (
                      <> {' · '} <span className="text-emerald-400">{processingTime}s</span></>
                    )}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4" /> New File
                  </Button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                      bg-gradient-to-r from-blue-500 to-purple-600 text-white
                      hover:from-blue-600 hover:to-purple-700
                      shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                      transition-all duration-300 transform hover:scale-105"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>

              {/* PDF Preview */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Preview
                  </h3>
                  <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                    Redacted PDF — safe to share
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden bg-black/30 border border-white/5">
                  <iframe
                    src={redactedPdfUrl}
                    className="w-full h-[600px]"
                    title="Redacted PDF Preview"
                  />
                </div>
              </Card>

              {/* Security Info */}
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500 py-4">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Permanent redaction
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  Original file deleted
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                  No data retained
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* Step indicator sub-components */
function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`
        w-2.5 h-2.5 rounded-full transition-all duration-300
        ${active ? 'bg-blue-400 shadow-lg shadow-blue-400/50' : done ? 'bg-emerald-400' : 'bg-gray-600'}
      `} />
      <span className={`text-xs ${active ? 'text-blue-400 font-medium' : done ? 'text-emerald-400' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
}

function StepLine() {
  return <div className="w-6 h-px bg-gray-600" />;
}
