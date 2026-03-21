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
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
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
        <div className="mt-28 w-full max-w-5xl relative animate-slide-up group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/20 to-transparent z-20 pointer-events-none rounded-[2.5rem]" />
          
          <div className="relative rounded-[2.5rem] p-3 md:p-5 bg-white/50 backdrop-blur-3xl border border-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-transform duration-700 hover:-translate-y-2">
            <div className="rounded-[2rem] overflow-hidden border border-slate-800 shadow-inner bg-black relative aspect-video md:aspect-[21/9]">
               <img 
                 src="/vintage_redacted_doc.png" 
                 alt="Confidential Top Secret Redacted Document"
                 className="absolute inset-0 w-full h-full object-cover object-top opacity-80 filter contrast-125 transition-transform duration-[2000ms] group-hover:scale-[1.03]"
                 loading="lazy"
               />
               
               {/* Internal Black Fade Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
               
               {/* Floating UI Overlays */}
               <div className="absolute top-[20%] left-[5%] md:left-[10%] bg-white/90 backdrop-blur-md animate-float p-4 md:p-5 rounded-3xl shadow-2xl border border-slate-200/50 flex items-center gap-3 md:gap-4 w-max">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-fuchsia-100 flex items-center justify-center">
                   <Scan className="w-5 h-5 md:w-6 md:h-6 text-fuchsia-600" />
                 </div>
                 <div className="text-left">
                   <p className="text-xs md:text-sm font-black text-slate-900">Aadhaar Detected</p>
                   <p className="text-[10px] md:text-xs text-slate-500 font-bold mt-0.5 md:mt-1 tracking-widest">XXXX XXXX 9012</p>
                 </div>
               </div>

               <div className="absolute bottom-[20%] right-[5%] md:right-[10%] bg-white/90 backdrop-blur-md animate-float animation-delay-2000 p-4 md:p-5 rounded-3xl shadow-2xl border border-slate-200/50 flex items-center gap-3 md:gap-4 w-max">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-cyan-100 flex items-center justify-center">
                   <Lock className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
                 </div>
                 <div className="text-left">
                   <p className="text-xs md:text-sm font-black text-slate-900">Redaction Applied</p>
                   <p className="text-[10px] md:text-xs text-slate-500 font-bold mt-0.5 md:mt-1">Irrecoverable vector flattening.</p>
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
                <EyeOff className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">10+ Data Profiles</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Hyper-tuned regex matching for PAN, Aadhaar, Passports, Phones, Bank Accounts, and IFSC codes.
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
