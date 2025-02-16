#!/usr/bin/env python
import sqlite3
import json
import base64
import hashlib
import re
from dateutil import parser
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import ollama
import ssl
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# --------- CONFIG ---------
DB_FILE = "secure_patient_data.db"
# app.config["JWT_SECRET_KEY"] = "some-secure-key"
# jwt = JWTManager(app)

AES_KEY = hashlib.sha256(b"david-is-a-super-maximus-tubbo-and-so-is-ethan").digest()

patient_vector_stores = {}

PHI_phrase = (
    "All dates have been shifted by a fixed per-patient offset for PHI masking "
    "Accession numbers and numeric identifiers have been replaced by plausible looking alternatives for PHI masking"
)

date_fields = {
    "date", "date_of_birth", "date_of_death", "recent_encounter_date",
    "immunization_date", "order_date", "taken_date", "result_date",
    "start_date", "end_date", "orderset_sched_start"
}

def create_cipher():
    return AES.new(AES_KEY, AES.MODE_ECB)

def encrypt_string(plaintext: str) -> str:
    val_str = plaintext.strip()
    data_bytes = val_str.encode("utf-8")
    padded = pad(data_bytes, AES.block_size)
    cipher = create_cipher()
    encrypted_bytes = cipher.encrypt(padded)
    return base64.b64encode(encrypted_bytes).decode("utf-8")

def decrypt_string(ciphertext: str) -> str:
    cipher = create_cipher()
    raw = base64.b64decode(ciphertext)
    decrypted = cipher.decrypt(raw)
    return unpad(decrypted, AES.block_size).decode("utf-8")

def is_base64_ciphertext(val: str) -> bool:
    try:
        raw = base64.b64decode(val)
        return (len(raw) % 16) == 0
    except:
        return False

def preprocess_record(record):
    new_record = {}
    for key, value in record.items():
        if isinstance(value, str):
            value = value.replace(PHI_phrase, "")
            value = re.sub(r"\s+", " ", value).strip()
            if key in date_fields:
                try:
                    dt = parser.parse(value)
                    value = dt.isoformat()
                except:
                    pass
        new_record[key] = value
    return new_record

def format_record(record, section):
    """Simple text representation for each record."""
    if section == "demographics":
        parts = [f"{k.replace('_', ' ').capitalize()}: {v}" for k, v in record.items() if v]
        return ". ".join(parts)
    return json.dumps(record)

@app.route("/health", methods=["POST"])
def health():
    return jsonify({"answer": "Server is running."}), 200

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username, password = data.get("username"), data.get("password")
    return jsonify({"good": "bad boy..."}), 200

@app.route("/get_patient", methods=["GET"])
# @jwt_required()
def get_patient():
    patient_id = request.args.get("patient_id")
    if not patient_id:
        return jsonify({"error": "Missing 'patient_id' param"}), 400

    encrypted_pid = encrypt_string(patient_id)
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    tables = [t[0] for t in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    
    results = {}
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table});")
        col_names = [c[1] for c in cursor.fetchall()]
        if "patient_id" not in col_names:
            continue

        query = f"SELECT * FROM {table} WHERE patient_id=?"
        rows = cursor.execute(query, (encrypted_pid,)).fetchall()
        if not rows:
            continue

        table_data = []
        for row in rows:
            record = dict(zip(col_names, row))
            for col in col_names:
                if isinstance(record[col], str) and is_base64_ciphertext(record[col]):
                    try:
                        record[col] = decrypt_string(record[col])
                    except:
                        record[col] = "Decryption Error"
            table_data.append(preprocess_record(record))

        results[table] = table_data

    conn.close()
    if not results:
        return jsonify({"error": "Patient not found"}), 404

    vector_stores = {}
    for section, records in results.items():
        texts = [format_record(record, section) for record in records]
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(texts)
        vector_stores[section] = {
            "texts": texts,
            "vectorizer": vectorizer,
            "tfidf_matrix": tfidf_matrix,
        }

    patient_vector_stores[patient_id] = vector_stores
    return jsonify({"message": f"Patient {patient_id} data loaded into RAG model."}), 200

@app.route("/query", methods=["POST"])
def query_api():
    data = request.get_json(force=True)
    patient_id = data.get("patient_id")
    query = data.get("query")
    model_mode = data.get("model_mode", "fast")  # 'fast', 'reasoning', 'goldilocks'

    if not patient_id or not query:
        return jsonify({"error": "Fields 'patient_id' and 'query' are required."}), 400

    if patient_id not in patient_vector_stores:
        return jsonify({"error": "Patient data not loaded. Call /get_patient first."}), 400

    vector_stores = patient_vector_stores[patient_id]

    # Decide which model to use
    if model_mode == "fast":
        model_name = "llama3.2"
    elif model_mode == "reasoning":
        model_name = "deepseek-r1:7b"
    else:  # goldilocks or default
        model_name = "phi4"

    aggregated_context = []
    for section, store in vector_stores.items():
        vectorizer = store["vectorizer"]
        tfidf_matrix = store["tfidf_matrix"]
        texts = store["texts"]
        query_vec = vectorizer.transform([query])
        sims = cosine_similarity(query_vec, tfidf_matrix).flatten()
        top_indices = sims.argsort()[::-1][:3]
        retrieved = [texts[i] for i in top_indices if sims[i] >= 0.1]
        if retrieved:
            section_context = f"Section: {section}\n" + "\n".join(retrieved)
            aggregated_context.append(section_context)
    
    if not aggregated_context:
        return jsonify({"answer": "Insufficient info in context."})

    context = "\n\n".join(aggregated_context)
    prompt = (
        f"You are an AI assistant answering medical queries from a physician for patient {patient_id}. "
        f"Strictly use only the context below to answer. If the answer is not explicitly supported, respond with "
        f"\"Insufficient info to answer.\" and indicate what extra info is needed.\n\n"
        f"Context:\n{context}\n\nQuestion:\n{query}\n\nAnswer:"
    )

    response = ollama.chat(model=model_name, messages=[{"role": "user", "content": prompt}])
    return jsonify({"answer": response["message"]["content"]}), 200

if __name__ == "__main__":
    # context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    # context.load_cert_chain('cert.pem', 'key.pem')
    app.run(host="0.0.0.0", port=5000, debug=True)
