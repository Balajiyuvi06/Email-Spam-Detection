# 🛡️ AegisSpam AI — AI-Powered Email Spam Detection System

A production-grade, full-stack cybersecurity web application that analyzes email headers, subjects, and text bodies to accurately classify messages as **Spam 🚨** or **Legitimate (Ham) ✅** using a trained **Linear Support Vector Classifier (`LinearSVC`)** and **TF-IDF N-Gram Vectorization**.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Architecture & Workflow](#-architecture--workflow)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Machine Learning Engine](#-machine-learning-engine)
- [API Reference](#-api-reference)
- [Installation & Quickstart](#-installation--quickstart)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup-flask)
  - [Frontend Setup](#2-frontend-setup-react--vite)
- [Testing](#-testing)
- [Security & Performance](#-security--performance)
- [License](#-license)

---

## ✨ Key Features

- **Real Machine Learning Predictions**: Powered by a trained `LinearSVC(C=10)` classifier and scikit-learn TF-IDF vectorizer. Zero fake results or simulated outputs.
- **Cybersecurity SaaS Interface**: High-contrast dark navy theme (`#070B14`), glassmorphism, glowing telemetry indicators, and rounded cards.
- **Explainable AI (XAI)**: Highlights the specific n-gram terms that influenced the model's decision (e.g., `free prize`, `claim reward`, `meeting notes`).
- **Calibrated Confidence**: Computes Platt logistic sigmoid probabilities on the SVM separating hyperplane decision function $f(x) = w^T x + b$.
- **Detection Telemetry & History**:
  - Real-time KPI counters (Total Analyzed, Spam Detected, Legitimate Detected, Spam Ratio).
  - Searchable, filterable local detection history with one-click JSON export.
  - Interactive Recharts (Spam vs Ham distribution, risk categorizations, confidence buckets).
- **Zero-Friction Testing**: One-click sample email payloads for immediate verification of both spam and legitimate communications.
- **Privacy First**: Sensitive full message bodies are not permanently logged to remote databases. Local history stores sanitized previews with full user clearing controls.

---

## 🏗️ Architecture & Workflow

```
[ Incoming Email / SMS ]
           │
           ▼
[ NLP Text Preprocessor ]
(Lowercasing, Stop-Word Elimination, Accent Normalization)
           │
           ▼
[ TF-IDF Vectorizer (5,000 N-Grams) ]
(Extracts Unigrams & Bigrams (1, 2) with Smooth IDF)
           │
           ▼
[ Linear Support Vector Classifier (LinearSVC) ]
(Evaluates against optimal separating hyperplane w·x + b)
           │
           ▼
[ Decision Score & Platt Sigmoid Scaling ]
Decision Margin f(x) ──► P(Spam) = 1 / (1 + exp(-f(x)))
           │
           ▼
┌──────────────────────────────┬──────────────────────────────┐
│  🚨 Spam (Decision > 0)     │  ✅ Legitimate (Decision ≤ 0) │
│  Risk: High / Moderate       │  Risk: Low                   │
│  Trigger Keyword Chips       │  Safe Phrasing Indicators    │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 19 (SPA)
- **Tooling**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Data Visualizations**: Recharts

### Backend
- **Framework**: Flask 3.1
- **CORS Handling**: Flask-CORS
- **Server API**: REST JSON endpoints
- **Testing**: Python `unittest` suite

### Machine Learning
- **Classifier**: Scikit-Learn `LinearSVC` ($C=10$, `squared_hinge` loss, `L2` penalty)
- **Feature Extraction**: `TfidfVectorizer` (5,000 features, $n$-gram range `(1, 2)`, English stop words)
- **Confidence Calibration**: Platt Sigmoid scaling on SVM decision distance
- **Dataset**: SMS & Email Spam Collection Benchmark (5,572 records: 4,825 Ham, 747 Spam)

---

## 📁 Project Structure

```
Email Spam Detection/
│
├── backend/
│   ├── app.py                      # Flask application factory, CORS & logging
│   ├── routes/
│   │   └── api.py                  # REST API endpoints (health, predict, model-info, stats)
│   ├── services/
│   │   └── model_service.py        # ML loader, inference, Platt scaling & explainability
│   ├── models/
│   │   ├── spam_detection_model.pkl# Original pickled model file
│   │   └── fitted_spam_pipeline.pkl# Cached pipeline for instant zero-latency startup
│   ├── test_api.py                 # Backend unit test suite (9 test cases)
│   ├── requirements.txt            # Python dependencies
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Sidebar, Header, MetricCard, ConfirmModal
│   │   ├── pages/                  # Dashboard, Analyzer, History, Analytics, About, Settings
│   │   ├── hooks/                  # useHistory (LocalStorage persistence & metrics)
│   │   ├── services/               # api.js (Centralized REST API client)
│   │   ├── App.jsx                 # Main application layout & state
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind CSS v4 & custom cybersecurity themes
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── index.html
│
├── dataset/
│   └── spam.csv                    # Training dataset (5,572 labeled records)
│
├── .gitignore
└── README.md
```

---

## 🤖 Machine Learning Engine

### 1. Classifier: `LinearSVC`
Support Vector Classifiers construct an optimal hyperplane in high-dimensional feature space that maximizes the geometric distance (margin) between the closest points of the two classes (support vectors):
$$\min_{w, b} \frac{1}{2} \|w\|^2 + C \sum_{i=1}^N \max(0, 1 - y_i(w^T x_i + b))^2$$
The penalty parameter $C=10$ provides strong margin enforcement while allowing sufficient generalization.

### 2. Feature Extraction: `TfidfVectorizer`
Unstructured text strings are mapped to sparse frequency-inverse document frequency vectors across both unigrams and bigrams $(1, 2)$:
$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \left( \ln\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|} + 1 \right)$$
Filtered with English stop words and constrained to the top 5,000 most informative features.

### 3. Decision Score & Platt Scaling
Because standard `LinearSVC` does not output probabilities natively, predictions calculate the signed Euclidean distance to the hyperplane:
$$f(x) = w^T x + b$$
The decision score is transformed into a calibrated probability via logistic sigmoid mapping:
$$P(\text{Spam}) = \frac{1}{1 + e^{-f(x)}}$$
- When $f(x) > 0$: Classified as **Spam** with $P(\text{Spam}) > 50\%$
- When $f(x) \le 0$: Classified as **Legitimate** with $P(\text{Legitimate}) = 1 - P(\text{Spam})$

---

## 📡 API Reference

### 1. Health Check
`GET /api/health`

**Response (`200 OK`):**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_info": {
    "classifier": "LinearSVC",
    "classifier_full": "Linear Support Vector Classifier (LinearSVC)",
    "confidence_method": "Platt Sigmoid Scaling on SVM Decision Function",
    "hyperparameters": {
      "C": 10,
      "max_features": 5000,
      "ngram_range": [1, 2],
      "stop_words": "english"
    }
  }
}
```

---

### 2. Predict Message
`POST /api/predict`

**Request:**
```json
{
  "subject": "Winner notification",
  "text": "Congratulations! You have won a free prize. Click here now to claim your £1000 cash reward."
}
```

**Response (`200 OK`):**
```json
{
  "prediction": "spam",
  "is_spam": true,
  "label": "Spam",
  "decision_score": 2.0464,
  "confidence": 88.56,
  "risk_level": "High",
  "message": "🚨 Suspicious / Spam characteristics detected.",
  "inference_time_ms": 0.82,
  "top_tokens": [
    { "token": "free", "weight": 0.8124, "impact": "spam" },
    { "token": "prize", "weight": 0.6912, "impact": "spam" },
    { "token": "claim", "weight": 0.5431, "impact": "spam" }
  ],
  "disclaimer": "Predictions are generated by a machine learning model and may occasionally misclassify messages."
}
```

---

### 3. Training Dataset Telemetry
`GET /api/dataset-stats`

**Response (`200 OK`):**
```json
{
  "total_records": 5572,
  "ham_count": 4825,
  "spam_count": 747,
  "ham_percentage": 86.6,
  "spam_percentage": 13.4,
  "avg_ham_length": 71.0,
  "avg_spam_length": 138.9
}
```

---

### 4. Verified Sample Payloads
`GET /api/samples`

Provides tested sample messages categorized into promotional spam, urgent prize lottery, and legitimate team/appointment communications.

---

## 🚀 Installation & Quickstart

### Prerequisites
- **Python**: Version 3.10 to 3.15 installed
- **Node.js**: Version 18+ (tested on Node v26)

---

### 1. Backend Setup (Flask)

Open a PowerShell terminal in the project root:

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment (if not already present)
python -m venv venv

# Activate virtual environment on Windows
.\venv\Scripts\Activate.ps1

# Install required dependencies
pip install -r requirements.txt

# Start the Flask API server
python app.py
```

The backend starts on:
👉 **`http://localhost:5000`**

---

### 2. Frontend Setup (React + Vite)

Open a second PowerShell terminal in the project root:

```powershell
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend launches on:
👉 **`http://localhost:5173`**

Open `http://localhost:5173` in any browser to use the application!

---

## 🧪 Testing

### Backend Automated Test Suite
Run the comprehensive test suite verifying health checks, spam/ham predictions, empty input handling, long input clipping, and dataset endpoints:

```powershell
.\venv\Scripts\python.exe backend\test_api.py
```

**Output:**
```
Ran 9 tests in 0.282s
OK
[PASS] Health endpoint test passed.
[PASS] Spam prediction test passed: score=2.0464, confidence=88.56%.
[PASS] Legitimate prediction test passed: score=-1.0336, confidence=73.76%.
[PASS] Empty input validation test passed.
[PASS] Invalid payload content-type test passed.
[PASS] Long input clipping and security test passed.
[PASS] Model info endpoint test passed.
[PASS] Dataset stats test passed: 5572 total, 747 spam.
[PASS] Samples endpoint test passed.
```

---

## 🔒 Security & Performance

- **Zero Remote Cloud AI Dependencies**: All inference is executed locally using your Scikit-Learn weights.
- **Input Length Restrictions**: Message inputs exceeding 50,000 characters are automatically sanitized and clipped to prevent Denial of Service (DoS) attacks.
- **Privacy First Storage**: The frontend records lightweight previews rather than full confidential email contents.
- **Sub-Millisecond Inference**: The trained pipeline caches in memory for average prediction latency under 1ms.

---

## 📄 License

MIT License. Designed and built for robust email cybersecurity analysis.

