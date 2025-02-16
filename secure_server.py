#!/usr/bin/env python
"""
Secure Flask server that:
  - uses JWT for authentication
  - decrypts fields that are valid AES-256 ECB ciphertext
  - queries by an encrypted patient_id
  - enforces HTTPS
"""

import sqlite3
import json
import base64
import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
import ssl

app = Flask(__name__)

# --------- CONFIG ---------
DB_FILE = "secure_patient_data.db"
app.config["JWT_SECRET_KEY"] = "david-is-a-super-maximus-tubbo-and-so-is-ethan"  # Change as needed
jwt = JWTManager(app)

# AES key must match build_db.py
AES_KEY = hashlib.sha256(b"david-is-a-super-maximus-tubbo-and-so-is-ethan").digest()

def create_cipher():
    return AES.new(AES_KEY, AES.MODE_ECB)

def encrypt_string(plaintext: str) -> str:
    """
    Encrypt the incoming patient_id to match what's stored in DB.
    (We only need to encrypt the 'patient_id' for the WHERE clause.)
    """
    val_str = plaintext.strip()
    data_bytes = val_str.encode("utf-8")
    padded = pad(data_bytes, AES.block_size)
    cipher = create_cipher()
    encrypted_bytes = cipher.encrypt(padded)
    return base64.b64encode(encrypted_bytes).decode("utf-8")

def decrypt_string(ciphertext: str) -> str:
    """Decrypt AES-256 ECB ciphertext (PKCS7) and return the plaintext string."""
    cipher = create_cipher()
    raw = base64.b64decode(ciphertext)
    decrypted = cipher.decrypt(raw)
    return unpad(decrypted, AES.block_size).decode("utf-8")

def is_base64_ciphertext(val: str) -> bool:
    """Checks if val is valid base64 and has length multiple of 16 bytes."""
    try:
        raw = base64.b64decode(val)
        return (len(raw) % 16) == 0
    except Exception:
        return False

@app.route("/login", methods=["POST"])
def login():
    """
    Example usage:
    curl -X POST "https://127.0.0.1:5000/login" \
      -H "Content-Type: application/json" \
      -d '{"username": "doctor", "password": "securepass"}' --insecure
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if username == "doctor" and password == "securepass":
        token = create_access_token(identity=username)
        return jsonify({"access_token": token})
    return jsonify({"error": "Unauthorized"}), 401

@app.route("/get_patient", methods=["GET"])
@jwt_required()
def get_patient():
    """
    Example usage:
    curl -X GET "https://127.0.0.1:5000/get_patient?patient_id=STSS7de67d5" \
      -H "Authorization: Bearer <JWT>" --insecure
    """
    patient_id = request.args.get("patient_id")
    if not patient_id:
        return jsonify({"error": "Missing 'patient_id' param"}), 400

    # Re-encrypt the incoming patient_id so it matches the stored ciphertext in DB
    encrypted_pid = encrypt_string(patient_id)

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Retrieve all tables from DB
    tables = [t[0] for t in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]

    results = {}
    for table in tables:
        # Check if table has a patient_id column
        cursor.execute(f"PRAGMA table_info({table});")
        col_names = [c[1] for c in cursor.fetchall()]
        if "patient_id" not in col_names:
            continue

        # Query by encrypted patient_id
        query = f"SELECT * FROM {table} WHERE patient_id=?"
        rows = cursor.execute(query, (encrypted_pid,)).fetchall()
        if not rows:
            continue

        table_data = []
        for row in rows:
            record = dict(zip(col_names, row))

            # Decrypt all columns that are valid ciphertext
            for col in col_names:
                val = record[col]
                # If it's a string and looks like valid ciphertext, decrypt
                if isinstance(val, str) and is_base64_ciphertext(val):
                    try:
                        record[col] = decrypt_string(val)
                    except Exception:
                        record[col] = "Decryption Error"
            table_data.append(record)

        results[table] = table_data

    conn.close()

    if not results:
        return jsonify({"error": "Patient not found"}), 404

    return jsonify({patient_id: results})

if __name__ == "__main__":
    # Self-signed cert for dev OR real cert for production
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain('cert.pem', 'key.pem')
    app.run(host="0.0.0.0", port=5000, ssl_context=context, debug=True)
