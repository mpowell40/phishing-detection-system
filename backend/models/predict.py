import pickle
import os
import numpy as np
import sqlite3

def save_query_to_db(url, text, confidence_score, threat_level):
    conn = sqlite3.connect('queries.db')  # Connect to the SQLite database
    cursor = conn.cursor()

    # Create a table to store user queries and confidence scores if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT,
            text TEXT,
            confidence_score REAL,
            threat_level TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Insert the query data into the database
    cursor.execute('''
        INSERT INTO queries (url, text, confidence_score, threat_level)
        VALUES (?, ?, ?, ?)
    ''', (url, text, confidence_score, threat_level))

    conn.commit()
    conn.close()


# Get the current directory of the script (predict.py)
current_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(current_dir, '..', 'models')

# Load vectorizer and scaler
with open(os.path.join(models_dir, 'tfidf_vectorizer.pkl'), 'rb') as f:
    vectorizer = pickle.load(f)

with open(os.path.join(models_dir, 'scaler.pkl'), 'rb') as f:
    scaler = pickle.load(f)

# Load models
with open(os.path.join(models_dir, 'email_model.pkl'), 'rb') as f:
    email_model = pickle.load(f)

with open(os.path.join(models_dir, 'url_model.pkl'), 'rb') as f:
    url_model = pickle.load(f)

# Updated feature extraction to match train_model.py
def extract_url_features(url):
    if not url:
        return np.array([[0, 0, 0, 0, 0, 0]])

    url_length = len(url)
    uses_https = 1 if url.lower().startswith("https://") else 0
    num_subdomains = max(0, len(url.split(".")) - 2)
    num_dashes = url.count('-')
    num_digits = sum(c.isdigit() for c in url)
    has_at_symbol = 1 if '@' in url else 0

    return np.array([[url_length, uses_https, num_subdomains, num_dashes, num_digits, has_at_symbol]])

# Combined classification logic
def classify_threat(text, url, threshold=0.55):
    predictions = []
    reasons = []

    # 🚨 Immediate phishing detection for http:// URLs
    if url.strip().lower().startswith("http://"):
        return {
            "label": "phishing",
            "probability": 1.0,
            "threat_level": "High",
            "reason": "URL uses insecure HTTP protocol"
        }

    if text.strip():
        X_text = vectorizer.transform([text])
        prob_email = email_model.predict_proba(X_text)[0][1]
        predictions.append(prob_email)
        reasons.append(f"Email content score: {prob_email:.2f}")

    if url.strip():
        features = extract_url_features(url)
        X_scaled = scaler.transform(features)
        prob_url = url_model.predict_proba(X_scaled)[0][1]
        predictions.append(prob_url)
        reasons.append(f"URL feature score: {prob_url:.2f}")

    if not predictions:
        return {
            "label": "safe",
            "probability": 0.0,
            "threat_level": "Low",
            "reason": "No content provided"
        }

    avg_prob = sum(predictions) / len(predictions)
    label = "phishing" if avg_prob >= threshold else "safe"
    threat_level = (
        "Low" if avg_prob < 0.3 else
        "Medium" if avg_prob < 0.6 else
        "High"
    )

    save_query_to_db(url, text, avg_prob, threat_level)
    print((f"Saved query to database: {url}, {text}, {avg_prob}, {threat_level}"))

    return {
        "label": label,
        "probability": round(avg_prob, 4),
        "threat_level": threat_level,
        "reason": " | ".join(reasons)
    }


# ===============================
# 🔧 Test block
# ===============================
if __name__ == "__main__":
    print("\n--- Classifier Test Cases ---")

    test_cases = [
        ("", "https://phishing.example.com/login.php"),
        ("Dear customer, your account has been compromised. Click here to verify: http://bad-site.com", ""),
        ("Dear user, please review your latest bank statement", "http://suspect.ru"),
        ("Hey Sarah, lunch tomorrow?", ""),
        ("", "https://www.google.com"),
        ("Your GSU account has been locked, log in to verify", "https://fake.gsu.edu")
    ]

    for i, (text, url) in enumerate(test_cases, 1):
        print(f"\nTest {i}")
        print(f"Text: {text}")
        print(f"URL: {url}")
        result = classify_threat(text, url)
        print("→ Result:", result)
