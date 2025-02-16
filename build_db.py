#!/usr/bin/env python
import pandas as pd
import sqlite3
import hashlib
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import re

# --------- CONFIG ---------
DB_FILE = "secure_patient_data.db"

csv_files = {
    'demographics': 'STARR/demographics.csv',
    'clinical_note': 'STARR/clinical_note.csv',
    'diagnoses': 'STARR/diagnoses.csv',
    'immunization': 'STARR/immunization.csv',
    'labs': 'STARR/labs.csv',
    'med_admin': 'STARR/med_admin.csv',
    'med_orders': 'STARR/med_orders.csv',
    'orders_and_ordersets': 'STARR/orders_and_ordersets.csv',
    'pathology_report': 'STARR/pathology_report.csv',
    'procedures': 'STARR/procedures.csv',
    'radiology_report': 'STARR/radiology_report.csv'
}

# Columns to ignore if present
IGNORE_COLS = [
    "title", "author", "linked_author", "pat_enc_csn_id",
    "order_proc_id", "accession_number"
]

# AES-256 key (store securely)
AES_KEY = hashlib.sha256(b"david-is-a-super-maximus-tubbo-and-so-is-ethan").digest()

def create_cipher():
    return AES.new(AES_KEY, AES.MODE_ECB)

def encrypt_string(plaintext: str) -> str:
    """Encrypts any string field with AES-256 ECB."""
    val_str = re.sub(r'\s+', ' ', plaintext).strip()
    data_bytes = val_str.encode("utf-8")
    padded = pad(data_bytes, AES.block_size)
    cipher = create_cipher()
    encrypted_bytes = cipher.encrypt(padded)
    return base64.b64encode(encrypted_bytes).decode("utf-8")

def encrypt_field(value):
    """Encrypts field if it's a string."""
    if pd.isna(value):
        return encrypt_string("Data Unknown")
    if isinstance(value, str):
        return encrypt_string(value)
    return value  # Skip encryption for non-strings (e.g., numeric fields)

# ------------ MAIN SCRIPT ------------
if __name__ == "__main__":
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    for table, filepath in csv_files.items():
        print(f"Loading {table} from {filepath} ...")
        df = pd.read_csv(filepath, low_memory=False)
        df.drop(columns=IGNORE_COLS, inplace=True, errors='ignore')

        # Replace NaNs
        for col in df.columns:
            if df[col].dtype == 'float64':
                df[col] = df[col].fillna(-1)
            else:
                df[col] = df[col].fillna("Data Unknown")

        # Encrypt all string fields
        for col in df.columns:
            if df[col].dtype == 'object':  # Encrypt only string columns
                df[col] = df[col].apply(encrypt_field)

        # Write to SQLite
        df.to_sql(table, conn, if_exists="replace", index=False)
        # Create index on patient_id if present
        if "patient_id" in df.columns:
            cursor.execute(f"CREATE INDEX IF NOT EXISTS idx_{table}_pid ON {table} (patient_id);")
            conn.commit()

    conn.close()
    print("Encrypted DB created successfully.")
