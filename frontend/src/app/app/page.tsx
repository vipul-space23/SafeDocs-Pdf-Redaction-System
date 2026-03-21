"use client";

import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { RedactionConfig } from '@/components/RedactionConfig';
import { Button } from '@/components/ui/Button';
import axios from 'axios';
import { Shield, Lock, FileText, CheckCircle, ArrowLeft, Download, RotateCcw, Scan, KeyRound, CheckSquare, Square } from 'lucide-react';

const API_URL = 'http://localhost:8000';

interface PiiMatch {
  id: string;
  text: string;
  label: string;
  mask: string;
  page_index: number;
  bbox?: number[];
  selected: boolean;
  confidence?: number;
}

export default function App() {
  const [step, setStep] = useState<'upload' | 'configure' | 'password' | 'review' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [redactionLevel, setRedactionLevel] = useState<string>('medium');
  const [redactedPdfUrl, setRedactedPdfUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('redacted_document.pdf');
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [pdfPassword, setPdfPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [fileId, setFileId] = useState<string | null>(null);
  const [matches, setMatches] = useState<PiiMatch[]>([]);
  const [analyzeTimeStarted, setAnalyzeTimeStarted] = useState<number>(0);

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setStep('configure');
  };

  const doAnalyze = async (password?: string) => {
    if (!selectedFile) return;

    setStep('processing');
    setError(null);
    setPasswordError(null);
    setAnalyzeTimeStarted(Date.now());

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('redaction_level', redactionLevel);
      if (password) {
        formData.append('password', password);
      }

      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        validateStatus: (status) => status < 500,
      });

      if (response.status === 423) {
        setPasswordError(password ? response.data.message : null);
        if (!password) setPdfPassword('');
        setStep('password');
        return;
      }

      if (response.status >= 400) {
        setError(response.data.detail || 'Error analyzing file.');
        setStep('configure');
        return;
      }

      setFileId(response.data.file_id);
      
      const detected = (response.data.matches || []).map((m: any) => ({
        ...m,
        selected: true
      }));
      setMatches(detected);
      setStep('review');

    } catch (err: any) {
      console.error('Analyze error:', err);
      setError('Error uploading file. Make sure the backend server is running on port 8000.');
      setStep('configure');
    }
  };

  const doRedact = async () => {
    if (!selectedFile || !fileId) return;

    setStep('processing');
    setError(null);
    
    const tStarted = analyzeTimeStarted || Date.now();

    try {
      const approved = matches.filter(m => m.selected).map(m => ({
        id: m.id,
        text: m.text,
        label: m.label,
        mask: m.mask,
        page_index: m.page_index,
        bbox: m.bbox
      }));

      const payload = {
        file_id: fileId,
        original_name: selectedFile.name,
        password: pdfPassword || null,
        approved_matches: approved
      };

      const response = await axios.post(`${API_URL}/redact`, payload, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'blob',
        validateStatus: (status) => status < 500,
      });

      if (response.status >= 400) {
        const text = await response.data.text();
        setError(`Error generating PDF: ${text}`);
        setStep('review');
        return;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setRedactedPdfUrl(url);

      setProcessingTime(Math.round((Date.now() - tStarted) / 1000));

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
      setError('Error generating reduced PDF.');
      setStep('review');
    }
  };

  const handlePasswordSubmit = () => {
    if (!pdfPassword.trim()) {
      setPasswordError('Please enter the password.');
      return;
    }
    doAnalyze(pdfPassword);
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
    setFileId(null);
    setMatches([]);
  };

  const toggleMatch = (id: string) => {
    setMatches(matches.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };
  
  const toggleAll = (select: boolean) => {
    setMatches(matches.map(m => ({ ...m, selected: select })));
  };

  return (
    <main className="min-h-screen pt-32 pb-12 px-6 relative overflow-hidden bg-slate-50">
      {/* Advanced Animated Aurora & Background Grid */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,white,transparent)] z-0" />
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-300/30 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 z-0" />
      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-0" />
      
      {/* Top Left Back Button */}
      <div className="fixed top-6 left-6 lg:left-8 z-50 animate-slide-up">
        <a href="/" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm text-sm font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all hover:-translate-y-0.5">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </a>
      </div>

      {/* Top Right Controls */}
      {step !== 'upload' && (
        <div className="fixed top-6 right-6 lg:right-8 z-50 animate-slide-up">
          <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm text-sm font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all hover:-translate-y-0.5">
            <RotateCcw className="w-4 h-4" /> Start Over
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-12 relative z-10 mt-6">
        <header className="text-center space-y-5 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-sm font-bold shadow-sm mb-2">
            <Lock className="w-4 h-4" /> Military-Grade Redaction Engine
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 drop-shadow-sm">
            Intelligent PII <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Scrubber</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Upload any document. We detect and permanently destroy sensitive identifiers entirely in browser memory.</p>
        </header>

        {/* Step Indicator */}
        {step !== 'upload' && (
          <div className="flex items-center justify-center gap-2 text-sm font-semibold mb-8">
            <button 
              onClick={handleReset}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Start Over
            </button>
            <span className="text-slate-300 mx-2">|</span>
            <div className="flex items-center gap-2">
              <StepDot active={false} done={true} label="Upload" />
              <StepLine />
              <StepDot
                active={step === 'configure' || step === 'password'}
                done={['review', 'processing', 'result'].includes(step)}
                label="Configure"
              />
              <StepLine />
              <StepDot 
                active={step === 'review'} 
                done={['processing', 'result'].includes(step)} 
                label="Review" 
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
            <div className="space-y-12 animate-in">
              <FileUpload onFileUpload={handleFileUpload} />

              <div className="grid md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
                {[
                  { icon: Scan, title: "Smart OCR", desc: "Instantly reads scanned documents." },
                  { icon: CheckSquare, title: "Your Control", desc: "Human review guarantees accuracy." },
                  { icon: Lock, title: "Irrecoverable", desc: "Redactions are flattened deeply." },
                  { icon: CheckCircle, title: "Zero Stored", desc: "100% ephemeral temporary memory." }
                ].map((feature, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-lg shadow-slate-200/20 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center">
                       <feature.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Configure */}
          {step === 'configure' && selectedFile && (
            <div className="space-y-6">
              {error && (
                <div className="max-w-xl mx-auto p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center shadow-sm">
                  ⚠️ {error}
                </div>
              )}
              <RedactionConfig 
                selectedLevel={redactionLevel}
                onSelectLevel={setRedactionLevel}
                onProceed={() => doAnalyze()}
                fileName={selectedFile.name}
              />
            </div>
          )}

          {/* STEP 2.5: Password Required */}
          {step === 'password' && selectedFile && (
            <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in">
              <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8 max-w-md w-full text-center">
                <div className="inline-flex p-4 rounded-2xl bg-amber-50 mb-4">
                  <KeyRound className="w-8 h-8 text-amber-500" />
                </div>
                
                <div className="space-y-2 mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Password Required</h2>
                  <p className="text-slate-500 font-medium text-sm">
                    <span className="text-blue-600 font-bold">{selectedFile.name}</span> is encrypted. Make sure you have the password.
                  </p>
                </div>

                {passwordError && (
                  <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    type="password"
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    placeholder="Enter document password"
                    autoFocus
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 
                      text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-400 
                      focus:ring-2 focus:ring-blue-100 transition-all text-center tracking-widest"
                  />
                  
                  <button
                    onClick={handlePasswordSubmit}
                    className="w-full px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                  >
                    Unlock & Analyze →
                  </button>

                  <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm font-semibold pt-2"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Manual Review (Human in the Loop) */}
          {step === 'review' && (
            <div className="max-w-7xl mx-auto animate-in space-y-6">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900">Review Detections</h2>
                <p className="text-slate-500 font-medium text-lg">
                  We found <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">{matches.length}</span> sensitive items. Review the preview and uncheck any you want to keep visible.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 font-medium text-sm text-center shadow-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Side: Checklists */}
                <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 flex flex-col">
                  {/* Header & List Logic ... */}
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                     <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-900">Detected PII</h3>
                     </div>
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      <button onClick={() => toggleAll(true)} className="text-blue-600 hover:text-blue-800">Select All</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={() => toggleAll(false)} className="text-slate-400 hover:text-slate-600">Deselect All</button>
                    </div>
                  </div>

                  {matches.length === 0 ? (
                    <div className="text-center py-16 flex-1">
                      <CheckCircle className="w-16 h-16 mx-auto text-emerald-100 mb-4" />
                      <p className="text-slate-500 font-medium text-lg">No sensitive information found at this level.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
                      {matches.map((m) => (
                        <div 
                          key={m.id}
                          onClick={() => toggleMatch(m.id)}
                          className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                            m.selected 
                              ? 'bg-blue-50/50 border-blue-200 shadow-sm' 
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {m.selected ? (
                              <CheckSquare className="w-6 h-6 text-blue-600" />
                            ) : (
                              <Square className="w-6 h-6 text-slate-400" />
                            )}
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow-sm ${
                                    m.label === 'PERSON' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    m.label === 'ORG' ? 'bg-green-100 text-green-700 border-green-200' :
                                    m.label === 'GPE' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>
                                    {m.label.replace('_', ' ')}
                                  </span>
                                  {m.confidence !== undefined && (
                                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.confidence > 0.9 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                       {Math.round(m.confidence * 100)}% Match
                                     </span>
                                  )}
                                </div>
                                <p className={`font-mono font-medium text-base ${m.selected ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                                  {m.selected ? m.mask : m.text}
                                </p>
                              </div>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm whitespace-nowrap">Pg {m.page_index + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100 shrink-0">
                     <button onClick={handleReset} className="px-6 py-3 rounded-full font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Cancel
                     </button>
                     <button
                      onClick={doRedact}
                      className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white bg-slate-900 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 transition-all hover:-translate-y-0.5"
                    >
                      <CheckCircle className="w-5 h-5" /> Burn Redactions
                    </button>
                  </div>
                </div>

                {/* Right Side: Preview iframe */}
                <div className="bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden flex flex-col h-[700px]">
                  <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-2">
                        <Scan className="w-5 h-5 text-slate-500" />
                        <span className="font-bold text-slate-800">Visual Highlight Preview</span>
                     </div>
                     <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">Read-Only</span>
                  </div>
                  <iframe 
                    src={`${API_URL}/preview/${fileId}#toolbar=0&navpanes=0`} 
                    className="w-full h-full flex-1 bg-slate-100/50"
                    title="Document Preview"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Processing Loading */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center space-y-8 py-32 animate-in fade-in duration-500">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-60" />
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                <div className="absolute inset-0 border-t-4 border-indigo-600 rounded-full animate-spin shadow-lg shadow-indigo-500/20" />
                <Shield className="absolute inset-0 m-auto w-10 h-10 text-indigo-600 animate-pulse" />
              </div>
              <div className="space-y-3 text-center">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {fileId ? "Burning Redactions into PDF..." : "Analyzing Document..."}
                </h2>
                <p className="text-lg text-slate-500 font-medium">
                  Applying military-grade algorithms in volatile memory.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Result */}
          {step === 'result' && redactedPdfUrl && (
            <div className="space-y-6 animate-in">
              <div className="bg-white border border-slate-200 shadow-2xl rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-emerald-400/10 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-100 relative z-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
                       <CheckCircle className="w-3 h-3" /> Fully Secured
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                      Redaction Complete
                    </h2>
                    <p className="font-medium text-slate-500 mt-3 break-all text-sm md:text-base">
                       {downloadFilename}
                      {processingTime !== null && (
                        <> {' · '} <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-md text-xs">{processingTime}s</span></>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                    <button 
                      onClick={handleReset} 
                      className="w-full sm:w-auto justify-center px-6 py-4 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <RotateCcw className="w-5 h-5" /> Start Over
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-full sm:w-auto justify-center px-8 py-4 rounded-2xl font-black text-white bg-slate-900 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 transition-all hover:-translate-y-1 flex items-center gap-3 overflow-hidden relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-indigo-500 to-fuchsia-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                      <Download className="w-5 h-5 group-hover:animate-bounce relative z-10" /> 
                      <span className="relative z-10">Download PDF</span>
                    </button>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
                  <iframe
                    src={redactedPdfUrl}
                    className="w-full h-[600px]"
                    title="Redacted PDF Preview"
                  />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
                </div>

                <div className="flex items-center justify-center gap-8 font-bold text-sm text-slate-500 pt-8">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"><Shield className="w-3 h-3 text-emerald-600" /></div>
                    Permanent Redaction
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"><Lock className="w-3 h-3 text-blue-600" /></div>
                    Zero Persistence
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`
        w-3 h-3 rounded-full transition-all duration-500 shadow-sm
        ${active ? 'bg-indigo-600 ring-4 ring-indigo-100 scale-110' : done ? 'bg-emerald-500' : 'bg-slate-200'}
      `} />
      <span className={`text-[11px] font-bold uppercase tracking-widest ${active ? 'text-indigo-700' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}

function StepLine() {
  return <div className="w-8 h-[2px] bg-slate-200 rounded-full" />;
}
