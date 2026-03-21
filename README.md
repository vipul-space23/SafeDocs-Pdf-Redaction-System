<div align="center">
  <div style="padding: 1.5rem; border-radius: 50%; background: #f0fdf4; display: inline-block; margin-bottom: 1rem;">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
  </div>
  
  # SafeDoc: Intelligent PII Redaction Platform
  **Military-Grade Privacy for the Modern Web**

  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Python](https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
</div>

---

## ⚡ Overview

SafeDoc is a highly secure, high-performance platform engineered to programmatically detect and permanently redact Personally Identifiable Information (PII) from PDFs and Images. 

Built with an unwavering commitment to data privacy, SafeDoc relies on a strict **Zero-Persistence Architecture**. Documents are processed entirely in memory or temporary isolated directories, and are permanently wiped immediately after processing.

## 🚀 Core Features

- **Human-in-the-Loop Review**: Don't just blindly redact. SafeDoc provides a beautiful React side-by-side review dashboard that renders a visual Preview PDF with yellow bounding boxes around detected PII. You choose what to keep and what to burn.
- **Smart OCR Engine**: Seamlessly processes both digital PDFs and heavily compressed scanned documents/images (PNG/JPG) using Tesseract OCR.
- **Micro-Targeted Bounding Boxes**: Instead of aggressive global text search, SafeDoc physically maps the exact `(x0, y0, x1, y1)` layout coordinates of every single PII hit, ensuring precise redactions that survive screenshot and copy-paste attacks.
- **Confidence Scoring**: Blends algorithmic pattern-matching weights with PyTesseract's extraction probability to provide a confidence float for every detection.
- **10+ Supported PII Profiles**: Aadhaar, PAN, Passports, Driving Licenses, Voter IDs, Phone Numbers, Emails, DOBs, Bank Account Numbers, and IFSC Codes.
- **Zero-Persistence**: Automatic background lifecycle deletion. Temporary processing artifacts are physically destroyed from the storage layer within 10 minutes.

---

## 🏛️ Pipeline Architecture

SafeDoc abandons the monolithic script approach for a clean, horizontally scalable stream pipeline:

1. **Stage 1 (Document Analyzer)**: Intercepts the upload, strictly validates MIME types/sizes (Max 15MB), and selects downstream processors.
2. **Stage 2 (OCR Service)**: Rebuilds scanned pixel layers into high-resolution imagery and projects raw text layers via PyMuPDF + Tesseract.
3. **Stage 3 (PII Detection)**: The regex engine sweeps the text streams, isolating pattern matches and linking them to physical canvas bounding boxes.
4. **Stage 4 (Redaction Engine)**: Injects blackout annotations via PyMuPDF natively onto the specific coordinate boundaries. 
5. **Stage 5 (Flattener)**: Strips metadata, compresses the output (`garbage=4, deflate=True`), and permanently burns annotations into the image layer ensuring irrecoverability.

---

## 💻 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS 4, Lucide Icons, Axios.
- **Backend**: FastAPI, Uvicorn, PyMuPDF (`fitz`), PyTesseract, Regex.
- **Typography & UI**: `Outfit` font system, glassmorphic dashboards, deep-color gradients, CSS micro-animations.

---

## ⚙️ Local Development Setup

### 1. Backend Startup

Ensure you have Tesseract installed on your system (`sudo apt install tesseract-ocr` or via Windows installer).

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
*Backend will run on port 8000.*

### 2. Frontend Startup

```bash
cd frontend
npm install
npm run dev
```
*Frontend will run on port 3000.*

Navigate to `http://localhost:3000` to see the Marketing Landing Page, and `http://localhost:3000/app` to use the Redactor Tool.

---

## 🛡️ Security Posture

- **No Database**: SafeDoc does not connect to any SQL/NoSQL databases. User data is never captured.
- **Volatile Execution**: All payload staging directories (`uploads/_temp`) are continuously garbage collected by an asynchronous FastAPI Background Task.
- **Vector Eradication**: Applying `fitz.PDF_REDACT_IMAGE_PIXELS` physically drops image pixels lying under the redaction boundary, neutralizing deep inspection attacks. 
- **Upload Guards**: Enforced 15MB file size limits and extension safelists block malicious bombing entirely.
