from fastapi import FastAPI, UploadFile, File
import pdfplumber
import re
import sqlite3

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE = "invoice.db"


# ---------- Root Route ----------
@app.get("/")
def root():
    return {"message": "Clarity Rekon Backend Running"}


# ---------- Utility: Extract Text ----------
def extract_text_from_pdf(file):
    with pdfplumber.open(file.file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text


# ---------- Utility: Extract Invoice Data ----------
def extract_invoice_data(text):
    data = {}

    # Invoice Number (full format)
    invoice_match = re.search(r"INV-\d+-\d+", text)
    data["invoice_number"] = invoice_match.group() if invoice_match else None

    # Customer
    customer_match = re.search(r"Bill To:\s*\n(.+)", text)
    data["customer"] = customer_match.group(1).strip() if customer_match else None

    # Grand Total
    total_match = re.search(r"Grand Total:\s*₹?([\d,]+)", text)
    if total_match:
        total = total_match.group(1).replace(",", "")
        data["amount"] = int(total)
    else:
        data["amount"] = None

    return data


# ---------- Utility: Verify Against DB ----------
def verify_invoice(extracted):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT invoice_number, amount, customer FROM invoices WHERE invoice_number=?",
        (extracted["invoice_number"],),
    )
    db_invoice = cursor.fetchone()
    conn.close()

    if not db_invoice:
        return "Invoice not found in database"

    db_invoice_number, db_amount, db_customer = db_invoice

    if extracted["amount"] != db_amount:
        return "AMOUNT MISMATCH"

    if extracted["customer"] != db_customer:
        return "CUSTOMER MISMATCH"

    return "VERIFIED"


# ---------- Upload Route ----------
@app.post("/upload-invoice")
def upload_invoice(file: UploadFile = File(...)):
    text = extract_text_from_pdf(file)
    extracted_data = extract_invoice_data(text)
    status = verify_invoice(extracted_data)

    return {
        "extracted": extracted_data,
        "status": status
    }
