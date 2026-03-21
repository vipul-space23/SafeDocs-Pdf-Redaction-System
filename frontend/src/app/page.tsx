import React from 'react';
import Link from 'next/link';
import { Shield, FileSearch, CheckCircle, ArrowRight, EyeOff, Trash2, UserCheck, Scan, Lock, Cpu, ServerOff, Zap } from 'lucide-react';

export default function LandingPage() {

  return (
    <div className="min-h-screen relative bg-slate-50 text-slate-900 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Advanced Animated Aurora & Background Grid */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,white,transparent)] z-0" />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-300/30 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 z-0" />
      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-0" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight text-slate-900">Safe<span className="text-indigo-600">Doc</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-500">
          <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
          <a href="#features" className="hover:text-indigo-600 transition-colors">Engine Features</a>
          <a href="#security" className="hover:text-indigo-600 transition-colors">Security Protocol</a>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/app" className="group flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all">
            Launch App
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">

        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] max-w-5xl text-slate-900 animate-fade-in">
          The Privacy Layer for
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 mt-2"> Your Documents</span>
        </h1>
        
        <p className="mt-8 text-lg md:text-2xl text-slate-500 max-w-3xl animate-fade-in animation-delay-2000 leading-relaxed font-medium">
          Automatically detect, human-verify, and permanently flatten sensitive identifiers (Aadhaar, PAN, SSN) before you ever share a file. Powered by in-browser smart OCR.
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row gap-5 animate-fade-in animation-delay-4000">
          <Link href="/app" className="group px-10 py-5 bg-indigo-600 rounded-full text-white font-bold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-2xl hover:shadow-indigo-600/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
            Start Redacting for Free
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#how-it-works" className="px-10 py-5 bg-white/80 backdrop-blur-md rounded-full text-slate-700 font-bold text-lg shadow-lg border border-slate-200/50 hover:bg-white hover:-translate-y-1 transition-all flex items-center justify-center">
            See How it Works
          </a>
        </div>

        {/* Hero Mockup Preview */}
        <div className="mt-28 w-full max-w-5xl relative animate-slide-up group select-none">
          
          <div className="relative p-6 md:p-10 bg-white/40 backdrop-blur-3xl border border-white/80 shadow-xl rounded-[3rem] overflow-hidden flex flex-col">
             
             {/* Friendly Mock Dashboard Header */}
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-200/60 gap-4">
               <div className="text-left flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-indigo-600" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-slate-900">Live Redaction Preview</h3>
                   <p className="text-xs md:text-sm font-bold text-slate-500 mt-1 max-w-md">Our NLP engine instantly detects and destroys sensitive fields locally.</p>
                 </div>
               </div>
               <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 font-bold text-[10px] uppercase tracking-widest shadow-sm">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse drop-shadow-sm" />
                 System Active
               </div>
             </div>

             {/* Transaction Bento Grid */}
             <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10">
                
                {/* Before (Input) */}
                <div className="relative bg-slate-100/80 rounded-[2rem] p-4 md:p-6 border border-white shadow-inner flex flex-col group hover:bg-white transition-colors">
                   <div className="flex w-full items-center justify-between mb-4 px-2">
                      <div className="flex items-center gap-2">
                        <FileSearch className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Input Document</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                   </div>
                   <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200 transition-transform duration-500 group-hover:scale-[1.03]">
                      <img src="/loan-before.png" className="w-full h-full object-cover object-top" alt="Original Document" />
                   </div>
                </div>

                {/* Arrow Indicator */}
                <div className="flex flex-col items-center justify-center py-4">
                   <div className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center border border-slate-200 text-indigo-600 animate-bounce">
                      <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
                   </div>
                   <div className="mt-4 px-3 py-1 bg-indigo-50/80 backdrop-blur-md rounded-full border border-indigo-100 shadow-sm hidden md:block">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-700">Zero-Persistence</span>
                   </div>
                </div>

                {/* After (Output) */}
                <div className="relative bg-white rounded-[2rem] p-4 md:p-6 border border-slate-200 shadow-2xl flex flex-col group hover:bg-slate-50/80 transition-colors">
                   <div className="flex w-full items-center justify-between mb-4 px-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Secured Output</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                   </div>
                   <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 shadow-inner border border-slate-200/50 transition-transform duration-500 group-hover:scale-[1.03]">
                      <img src="/loan-after.png" className="w-full h-full object-cover object-top filter contrast-125" alt="Redacted Document" />
                   </div>
                </div>

             </div>
          </div>
        </div>
      </section>

      {/* How it Works Pipeline */}
      <section id="how-it-works" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-bold uppercase tracking-widest mb-6">
            The Pipeline
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-20 tracking-tight">4 Steps to Absolute Privacy</h2>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
             {/* Desktop connecting line */}
             <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-cyan-200 via-indigo-200 to-fuchsia-200 z-0" />
             
             {[
               { step: "01", title: "Upload & Parse", desc: "We accept PDFs and Images, instantly extracting layouts in volatile memory.", icon: FileSearch, color: "text-cyan-600", bg: "bg-cyan-100" },
               { step: "02", title: "Smart OCR", desc: "Tesseract reconstructs flattened pixels into strict text-bounding boxes.", icon: Scan, color: "text-indigo-600", bg: "bg-indigo-100" },
               { step: "03", title: "Human Review", desc: "You visualize all detected identifiers and verify exactly what to burn.", icon: UserCheck, color: "text-fuchsia-600", bg: "bg-fuchsia-100" },
               { step: "04", title: "Vector Flat", desc: "Black zones are permanently burned, dropping original pixels forever.", icon: Lock, color: "text-emerald-600", bg: "bg-emerald-100" }
             ].map((s, i) => (
               <div key={i} className="relative z-10 flex flex-col items-center group">
                 <div className={`w-24 h-24 rounded-3xl ${s.bg} flex items-center justify-center shadow-xl shadow-slate-200/50 mb-8 border-4 border-white group-hover:-translate-y-2 transition-transform duration-300`}>
                   <s.icon className={`w-10 h-10 ${s.color}`} />
                 </div>
                 <span className={`text-sm font-black ${s.color} tracking-widest mb-3`}>STAGE {s.step}</span>
                 <h3 className="text-2xl font-black text-slate-900 mb-3">{s.title}</h3>
                 <p className="text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">{s.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 bg-slate-100/50 relative z-10 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Enterprise-grade capabilities. <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600">Built for compliance.</span></h2>
            <p className="text-xl text-slate-500 font-medium">SafeDoc is engineered to stop sensitive data leaks at the source without relying on dangerous third-party cloud aggregators.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group hover:border-indigo-300 transition-colors">
              <div className="relative z-10 w-full md:w-2/3">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-8">
                  <Scan className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Intelligent Spatial OCR</h3>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  Upload digital PDFs, scanned documents, or raw images (PNG/JPG). Our pipeline extracts exact physical `(x0, y0, x1, y1)` bounding coordinates to ensure redactions are perfectly aligned and visually flawless.
                </p>
              </div>
              <div className="absolute right-[-10%] bottom-[-20%] opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                <Scan className="w-96 h-96 text-indigo-900" />
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-fuchsia-300 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-fuchsia-50 border border-fuchsia-100 flex items-center justify-center mb-8">
                <UserCheck className="w-8 h-8 text-fuchsia-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Human Verification</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Algorithms hallucinate. We surface all detections for your explicit manual approval before burning the PDF.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-cyan-300 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-8">
                <Cpu className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Hybrid AI Engine</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Powered by Microsoft Presidio NLP to identify unstructured entities, seamlessly fused with hyper-tuned regex matching for PAN, Aadhaar, Passports, Phones, Bank Accounts, and IFSC codes.
              </p>
            </div>

            <div className="md:col-span-2 bg-slate-900 text-white shadow-2xl rounded-[2.5rem] p-10 md:p-14 flex flex-col justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent z-0" />
               <div className="relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-8">
                   <ServerOff className="w-8 h-8 text-white" />
                 </div>
                 <h3 className="text-3xl font-black mb-4 tracking-tight">100% Zero Persistence Storage</h3>
                 <p className="text-lg text-slate-300 leading-relaxed font-medium">
                   We treat your data like radioactive material. Files are isolated in temporary processing chunks, and an asynchronous garbage collector physically obliterates everything within 10 minutes.
                 </p>
                 <div className="mt-8 flex gap-4">
                   <span className="px-4 py-2 rounded-full bg-slate-800 text-xs font-bold tracking-widest text-emerald-400 border border-slate-700 flex items-center gap-2"><CheckCircle className="w-3 h-3" /> NO DATABASES</span>
                   <span className="px-4 py-2 rounded-full bg-slate-800 text-xs font-bold tracking-widest text-emerald-400 border border-slate-700 flex items-center gap-2"><CheckCircle className="w-3 h-3" /> NO LOG TRAIL</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer CTA */}
      <section id="security" className="py-32 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-fuchsia-900/20 z-0" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-indigo-500/50">
             <Zap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">Ready to secure your documents?</h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Stop risking compliance violations. Redact sensitive identities locally within seconds using SafeDoc's intelligent pipeline.
          </p>
          <Link href="/app" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-full font-black text-lg shadow-2xl shadow-white/10 hover:shadow-white/20 hover:-translate-y-1 transition-all w-full sm:w-auto">
            Launch SafeDoc Engine <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="mt-8 text-slate-500 text-sm font-bold uppercase tracking-widest">Free to use forever. No account required.</p>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-500 py-16 text-center text-sm border-t border-slate-900 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
           <Shield className="w-6 h-6 text-slate-600" />
           <span className="font-black text-slate-300 text-xl tracking-tight">Safe<span className="text-slate-500">Doc</span></span>
        </div>
        <p className="font-bold tracking-widest uppercase text-xs">© 2026 SafeDoc Redaction Platform. Built for strict data privacy.</p>
      </footer>

    </div>
  );
}
