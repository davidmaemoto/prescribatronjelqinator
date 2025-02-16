# PrescribatronJelqinator

## Inspiration  
*"Can you provide your family history of chronic heart disease?"*  
*"I just answered that on the sign-in form."*  
*"Do you recall your Epstein-Barr virus titers from your last five blood tests?*  
*"You're the doctor—I just get my blood drawn."*  

Healthcare should be **fluid and intelligent**, not a repetitive Q&A session. **PrescribatronJelqinator** gives doctors instant, structured access to a patient's **entire medical history**, allowing them to ask **real questions** instead of rehashing paperwork.  

## What it does  
**PrescribatronJelqinator** is a **secure, AI-powered medical assistant** that allows doctors to:  
✅ **Instantly retrieve patient data** from encrypted hospital records.  
✅ **Ask context-aware questions** (e.g., "Does this patient have a history of anemia?").  
✅ **Run locally** for privacy while maintaining **HIPAA compliance**.  
✅ **Summarize clinical notes** and **cross-reference medical history** in real time.  

Instead of **sifting through records manually**, a doctor can simply **ask** and get an **accurate, contextual response** based on the patient's **real** medical history.

## How we built it  
- **Encrypted Patient Database** 📂  

  - Converts massive **CSV-based hospital records** into a **16GB+ encrypted SQLite database**.  
  - Uses **AES-256 encryption** on all sensitive fields.  
  - Employs **TF-IDF retrieval** for **fast medical record access**.  
  - Integrated with the **Stanford STARR** medical database for direct access to structured patient data from the Stanford ENT clinic.

- **Locally Hosted RAG Model** 🧠  

  - Runs an **Ollama-powered LLM** that can **answer doctor queries** based on retrieved records.  
  - Uses **TF-IDF similarity** to fetch the **most relevant patient data**.  
  - Ensures **zero cloud dependencies** for full **HIPAA compliance**.  

- **Flask API for Secure Access** 🔐  

  - Uses **JWT authentication** to control doctor access.  
  - Enforces **TLS encryption** to protect queries and responses.  
  - Allows **querying patient records in real time** via REST API.  

## Challenges we ran into  
- **HIPAA Compliance & Encryption** – Ensuring that all patient data is encrypted while still being efficiently retrievable.  
- **Running Models Locally** – Deploying an **LLM-powered system** that can operate **without cloud dependencies**.  
- **Handling Massive Data** – Managing **16GB+ patient records** efficiently while ensuring **real-time queries**.

## Accomplishments that we're proud of  
- **Successfully encrypting & indexing a massive patient database** while keeping queries fast.  
- **Integrating a local RAG model** that can **answer questions directly from patient records**.  
- **Ensuring full HIPAA compliance** while allowing real-time retrieval of medical data.  
- **Making everything run entirely locally**, meaning **no external servers, no data leaks**.  

## What we learned  
- **Efficient database encryption** is possible without sacrificing performance.  
- **TF-IDF combined with LLMs** is a powerful way to build **real-time, document-aware AI**.  
- **Doctors hate repetitive questions**—automation can significantly **improve medical interactions**.  

## What's next for PrescribatronJelqinator  
🚀 **Cloud Hosting** – Deploying to **secure, hospital-grade cloud infrastructure**.  
🏥 **EPIC Hospital Access** – Integrating directly with **EPIC medical record systems**.  
📝 **Clinical Note Understanding** – Allowing **direct interaction with physician notes** for deeper insights.  
🎙 **Doctor-Patient Voice Transcription** – Enabling **real-time note-taking** based on conversations.  
