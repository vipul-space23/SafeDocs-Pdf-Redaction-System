<div align="center">

# 🛡️ SafeDoc: Zero-Persistence PII Redaction Engine

**Military-Grade Privacy. Industry-Standard AI. Local Execution.**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Microsoft Presidio](https://img.shields.io/badge/AI_Engine-Microsoft_Presidio-0078D4?style=for-the-badge&logo=microsoft)](https://microsoft.github.io/presidio/)
[![spaCy](https://img.shields.io/badge/NLP-spaCy-09A3D5?style=for-the-badge&logo=spacy)](https://spacy.io/)

</div>

<br/>

## 🎥 Working Demonstration

> Watch SafeDoc identify, isolate, and burn PII locally without ever exposing data to the cloud.

<div align="center">
  <!-- TODO: Replace with your actual recorded GIF/Video -->
  <img src="assets/demo.gif" alt="SafeDoc Interactive Demo" width="800" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
  <p><em>End-to-end processing of a highly sensitive Payslip document.</em></p>
</div>

---

## 🧠 The Architecture

SafeDoc is built to handle the highest levels of data security compliance using a **Dual-Axis Detection Engine**.

### 1️⃣ Microsoft Presidio NLP (Contextual AI)
We explicitly discard simple string-matching in favor of **Microsoft Presidio's AnalyzerEngine**. Running via a locally integrated spaCy English core, the system algorithmically identifies unstructured contextual entities that regex fundamentally cannot catch:
* 👤 **PERSON** (Full Names, Signatures)
* 🏢 **ORGANIZATION** (Company Names, Employers)
* 📍 **LOCATION** (Physical Addresses, GPEs)

### 2️⃣ Hyper-Tuned Matrix (Regional Regex)
Running concurrently with the AI model is our highly optimized regex engine built specifically for Indian financial and government documents:
* **Government IDs:** Aadhaar (`XXXX XXXX 1234`), PAN Cards, Passports, Voter IDs, Driving Licenses.
* **Financials:** Bank Account Numbers, IFSC Codes (`HDFC0001234`), and native formatting Monetary Amounts (`₹5,11,000.00`).
* **Communications:** Phone Numbers, Email Addresses, DOBs.

---

## ⚡ Key Features

* **🛡️ Zero-Persistence Storage:** Documents act like radioactive material. They exist purely in volatile memory for active processing, and an asynchronous garbage collector explicitly obliterates files from the drive within 10 minutes. No log trails. No caches.
* **🎯 Human-in-the-Loop:** Algorithms hallucinate. Before ANY redaction is permanently burned into a PDF canvas, the user is presented with a confidence-scored visual overlay to explicitly approve/deny detections.
* **👁️ Spatial OCR Extraction:** We don't just extract text—we map the exact graphical `(x0, y0, x1, y1)` layout bound logic. This guarantees the un-redacted PDF visuals remain completely intact while the exact targeted pixel space is burned black and the underlying text vector is definitively ripped out.

---

## 🛠️ Local Installation

You must run both the Python AI Engine and the Next.js Frontend.

### 1. Booting the Backend (AI Pipeline)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Start the pipeline
python -m uvicorn main:app --reload
```

### 2. Booting the Frontend (UI / UX)
```bash
cd frontend
npm install
npm run dev
```

Navigate to **http://localhost:3000** to launch the Redaction Engine.

---

<div align="center">
  <p>Engineered for strict Data Privacy & Compliance.</p>
</div>
