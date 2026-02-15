import re

def extract_invoice_data(text: str):
    invoice_number = re.search(r"INV-\d+", text)
    amount = re.search(r"Total\s+\$?(\d+\.?\d*)", text)
    supplier = re.search(r"Supplier:\s*(.+)", text)

    return {
        "invoice_number": invoice_number.group(0) if invoice_number else None,
        "amount": float(amount.group(1)) if amount else None,
        "supplier": supplier.group(1).strip() if supplier else None,
    }
