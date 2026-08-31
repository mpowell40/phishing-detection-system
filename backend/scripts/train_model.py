import numpy as np
import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
import pickle
from xgboost import XGBClassifier

# ============================
# 📩 EMAIL MODEL (Logistic Regression)
# ============================

df_email = pd.read_csv("../data/processed/emails_cleaned.csv")
df_email.fillna("", inplace=True)

df_email['text_combined'] = df_email['subject'].astype(str) + " " + df_email['body'].astype(str) + " " + df_email['urls'].astype(str)
y_email = df_email['label']

vectorizer_email = TfidfVectorizer(stop_words='english', max_features=5000)
X_email = vectorizer_email.fit_transform(df_email['text_combined'])

X_train_email, X_test_email, y_train_email, y_test_email = train_test_split(X_email, y_email, test_size=0.2, random_state=42)

print("Training Email Model...")
model_email = LogisticRegression(class_weight='balanced')
model_email.fit(X_train_email, y_train_email)

y_pred_email = model_email.predict(X_test_email)
print(f"\n📧 Email Model Accuracy: {accuracy_score(y_test_email, y_pred_email):.4f}")
print(classification_report(y_test_email, y_pred_email))

# ============================
# 🌐 URL MODEL (XGBoost)
# ============================

df_phishing = pd.read_csv("../data/raw/websites/phishing_site_urls.csv")
df_phishing['label'] = df_phishing['Label'].apply(lambda x: 1 if x == 'bad' else 0)

def extract_url_features(df):
    url_features = []
    for url in df['URL']:
        url_info = {
            'url_length': len(url),
            'uses_https': 1 if url.lower().startswith("https://") else 0,
            'num_subdomains': max(0, len(url.split(".")) - 2),
            'num_dashes': url.count('-'),
            'num_digits': sum(c.isdigit() for c in url),
            'has_at_symbol': 1 if '@' in url else 0
        }
        url_features.append(url_info)
    return pd.DataFrame(url_features)

url_features_df = extract_url_features(df_phishing)
X_url = url_features_df.values
y_url = df_phishing['label'].values

scaler = StandardScaler()
X_url_scaled = scaler.fit_transform(X_url)

X_train_url, X_test_url, y_train_url, y_test_url = train_test_split(
    X_url_scaled, y_url, test_size=0.2, random_state=42, stratify=y_url
)

print("Training URL Model with XGBoost...")
scale_pos_weight = np.sum(y_train_url == 0) / np.sum(y_train_url == 1)

model_url = XGBClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    scale_pos_weight=scale_pos_weight,
    use_label_encoder=False,
    eval_metric='logloss'
)
model_url.fit(X_train_url, y_train_url)

y_pred_url = model_url.predict(X_test_url)
print(f"\n🌐 URL Model Accuracy (XGBoost): {accuracy_score(y_test_url, y_pred_url):.4f}")
print(classification_report(y_test_url, y_pred_url))

# ============================
# 💾 Save Models & Tools
# ============================

models_dir = "../models"
os.makedirs(models_dir, exist_ok=True)

with open(os.path.join(models_dir, "email_model.pkl"), "wb") as f:
    pickle.dump(model_email, f)

with open(os.path.join(models_dir, "url_model.pkl"), "wb") as f:
    pickle.dump(model_url, f)

with open(os.path.join(models_dir, "tfidf_vectorizer.pkl"), "wb") as f:
    pickle.dump(vectorizer_email, f)

with open(os.path.join(models_dir, "scaler.pkl"), "wb") as f:
    pickle.dump(scaler, f)

print("\n✅ Models, vectorizer, and scaler saved successfully.")
