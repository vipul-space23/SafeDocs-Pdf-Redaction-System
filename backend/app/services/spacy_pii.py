# app/services/spacy_pii.py
import spacy
from spacy.matcher import Matcher

# Load the spaCy model once (could be done at startup)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading en_core_web_sm model...")
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")


def create_pii_matcher(nlp):
    matcher = Matcher(nlp.vocab)

    patterns = [
        # ---------- CONTACT INFORMATION ----------
        {"label": "PHONE", "pattern": [{"SHAPE": "ddd"}, {"ORTH": "-"}, {"SHAPE": "ddd"}, {"ORTH": "-"}, {"SHAPE": "dddd"}]},
        {"label": "PHONE", "pattern": [{"TEXT": {"REGEX": r"\(\d{3}\)\s\d{3}-\d{4}"}}]},
        {"label": "PHONE", "pattern": [{"TEXT": {"REGEX": r"\b\d{10}\b"}}]},
        {"label": "PHONE", "pattern": [{"TEXT": {"REGEX": r"\+\d{1,3}[\s-]?\d{6,14}"}}]},
        {"label": "EMAIL", "pattern": [{"TEXT": {"REGEX": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"}}]},
        {"label": "IP_ADDRESS", "pattern": [{"TEXT": {"REGEX": r"\b(?:\d{1,3}\.){3}\d{1,3}\b"}}]},
        {"label": "URL", "pattern": [{"TEXT": {"REGEX": r"https?://[^\s]+"}}]},
        {"label": "ADDRESS", "pattern": [{"TEXT": {"REGEX": r"\b\d+\s+[A-Za-z0-9\s,]+\b(?:Road|Street|Avenue|Lane|Drive|Boulevard|Blvd|St|Ave|Dr|Rd)\b"}}]},

        # ---------- FINANCIAL INFORMATION ----------
        {"label": "SSN", "pattern": [{"SHAPE": "ddd"}, {"ORTH": "-"}, {"SHAPE": "dd"}, {"ORTH": "-"}, {"SHAPE": "dddd"}]},
        {"label": "BANK_ACCOUNT", "pattern": [{"TEXT": {"REGEX": r"\b\d{9,18}\b"}}]},
        {"label": "IFSC", "pattern": [{"TEXT": {"REGEX": r"[A-Z]{4}0[A-Z0-9]{6}"}}]},
        {"label": "CREDIT_CARD", "pattern": [{"TEXT": {"REGEX": r"\b(?:\d{4}[\s-]?){3}\d{4}\b"}}]},
        {"label": "CREDIT_CARD", "pattern": [{"TEXT": {"REGEX": r"\b\d{16}\b"}}]},
        {"label": "DEBIT_CARD", "pattern": [{"TEXT": {"REGEX": r"\b(?:\d{4}[\s-]?){3}\d{4}\b"}}]},
        {"label": "UPI", "pattern": [{"TEXT": {"REGEX": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+"}}]},
        {"label": "CVV", "pattern": [{"TEXT": {"REGEX": r"\b\d{3,4}\b"}}]},
        {"label": "CRYPTO_WALLET", "pattern": [{"TEXT": {"REGEX": r"\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b"}}]},
        {"label": "SWIFT_BIC", "pattern": [{"TEXT": {"REGEX": r"\b[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?\b"}}]},

        # ---------- INDIAN GOVERNMENT IDs ----------
        {"label": "AADHAAR", "pattern": [{"TEXT": {"REGEX": r"\d{4}[\s-]?\d{4}[\s-]?\d{4}"}}]},
        {"label": "AADHAAR", "pattern": [{"TEXT": {"REGEX": r"\b\d{12}\b"}}]},
        {"label": "AADHAAR_VID", "pattern": [{"TEXT": {"REGEX": r"\b\d{16}\b"}}]},
        {"label": "PAN", "pattern": [{"TEXT": {"REGEX": r"[A-Z]{5}[0-9]{4}[A-Z]{1}"}}]},
        {"label": "PASSPORT", "pattern": [{"TEXT": {"REGEX": r"[A-Z][0-9]{7}"}}]},
        {"label": "DRIVING_LICENSE", "pattern": [{"TEXT": {"REGEX": r"[A-Z]{2}[0-9]{2}[\s-]?[0-9]{11}"}}]},
        {"label": "VOTER_ID", "pattern": [{"TEXT": {"REGEX": r"[A-Z]{3}[0-9]{7}"}}]},
        {"label": "GSTIN", "pattern": [{"TEXT": {"REGEX": r"\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}"}}]},
        {"label": "RATION_CARD", "pattern": [{"TEXT": {"REGEX": r"[A-Z0-9]{6,15}"}}]},

        # ---------- INTERNATIONAL IDENTIFIERS ----------
        {"label": "US_SSN", "pattern": [{"TEXT": {"REGEX": r"\b\d{3}-\d{2}-\d{4}\b"}}]},
        {"label": "UK_NIN", "pattern": [{"TEXT": {"REGEX": r"\b[A-Z]{2}\d{6}[A-Z]{1}\b"}}]},
        {"label": "CANADA_SIN", "pattern": [{"TEXT": {"REGEX": r"\b\d{3}-\d{3}-\d{3}\b"}}]},

        # ---------- PERSONAL INFORMATION ----------
        {"label": "DOB", "pattern": [{"TEXT": {"REGEX": r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b"}}]},
        {"label": "AGE", "pattern": [{"TEXT": {"REGEX": r"\b(?:age|aged)\s+\d{1,3}\b"}}]},
        {"label": "PIN_CODE", "pattern": [{"TEXT": {"REGEX": r"\b\d{6}\b"}}]},

        # ---------- HEALTH INFORMATION ----------
        {"label": "MEDICAL_RECORD", "pattern": [{"TEXT": {"REGEX": r"\bMR\s*#?\s*\d{5,10}\b"}}]},
        {"label": "HEALTH_INSURANCE", "pattern": [{"TEXT": {"REGEX": r"\b\d{10,15}\b"}}]},
        {"label": "BLOOD_TYPE", "pattern": [{"TEXT": {"REGEX": r"\b(?:A|B|AB|O)[+-]\b"}}]},

        # ---------- BIOMETRIC DATA ----------
        {"label": "BIOMETRIC", "pattern": [{"LOWER": {"IN": ["fingerprint", "retina", "iris", "facial", "biometric"]}}]},

        # ---------- EMPLOYMENT DATA ----------
        {"label": "EMPLOYEE_ID", "pattern": [{"TEXT": {"REGEX": r"\bE(?:MP)?[\s-]?\d{5,10}\b"}}]},
        {"label": "SALARY", "pattern": [{"TEXT": {"REGEX": r"\b(?:Rs\.?|₹|INR)\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b"}}]},

        # ---------- EDUCATIONAL DATA ----------
        {"label": "STUDENT_ID", "pattern": [{"TEXT": {"REGEX": r"\b(?:STUD|STU|ST)[\s-]?\d{5,10}\b"}}]},
        {"label": "ACADEMIC_RECORD", "pattern": [{"TEXT": {"REGEX": r"\bGPA\s*:?\s*\d\.\d{1,2}\b"}}]}
    ]

    for pattern in patterns:
        matcher.add(pattern["label"], [pattern["pattern"]])

    return matcher


pii_matcher = create_pii_matcher(nlp)


def detect_pii(text: str) -> list:
    """
    Detects PII in the text using spaCy with custom patterns.
    Returns a list of tuples: (entity_text, start_char, end_char, label)
    """
    doc = nlp(text)
    matches = pii_matcher(doc)
    pii_entities = []
    for match_id, start, end in matches:
        span = doc[start:end]
        label = nlp.vocab.strings[match_id]  # Get label string
        pii_entities.append((span.text, span.start_char, span.end_char, label))
    return pii_entities