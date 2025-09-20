# sentiment_app.py
import pandas as pd
import numpy as np
import re
import string
import streamlit as st
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# -------------------------------
# Data Preprocessing Functions
# -------------------------------
def label_sentiment(score):
    if score <= -0.2:
        return "negative"
    elif score >= 0.2:
        return "positive"
    else:
        return "neutral"

def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\d+", "", text)
    return text

# -------------------------------
# Load Dataset & Train Models
# -------------------------------
@st.cache_resource  # cache so retraining doesn't happen on every reload
def train_models():
    df = pd.read_csv("market_sentiment_500.csv")
    df["sentiment_label"] = df["sentiment"].apply(label_sentiment)
    df["clean_text"] = df["title/text"].astype(str).apply(clean_text)

    X = df["clean_text"]
    y = df["sentiment_label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    vectorizer = TfidfVectorizer(max_features=5000, stop_words="english")
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced"),
        "Random Forest": RandomForestClassifier(n_estimators=200, class_weight="balanced", random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, random_state=42),
        "SVM": SVC(kernel='linear', class_weight="balanced", probability=True)
    }

    results = []
    best_model = None
    best_acc = 0

    for name, model in models.items():
        model.fit(X_train_vec, y_train)
        y_pred = model.predict(X_test_vec)
        acc = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)
        cm = confusion_matrix(y_test, y_pred, labels=["negative", "neutral", "positive"])

        results.append({
            "Model": name,
            "Accuracy": acc,
            "Precision": report["weighted avg"]["precision"],
            "Recall": report["weighted avg"]["recall"],
            "F1-score": report["weighted avg"]["f1-score"],
            "ConfusionMatrix": cm
        })

        if acc > best_acc:
            best_acc = acc
            best_model = model
            best_model_name = name

    return best_model, vectorizer, results, best_model_name, best_acc

# Train models once
best_model, vectorizer, results, best_model_name, best_acc = train_models()

# -------------------------------
# Streamlit UI
# -------------------------------
st.title("📊 Market Sentiment Prediction App")

st.markdown(f"""
Best Model: **{best_model_name}**  
Accuracy: **{best_acc:.2%}**
""")

# User Input
user_input = st.text_area("Enter a news headline or statement:", "")

def predict_sentiment(text):
    cleaned = clean_text(text)
    vec = vectorizer.transform([cleaned])
    return best_model.predict(vec)[0]

if st.button("Predict Sentiment"):
    if user_input.strip():
        prediction = predict_sentiment(user_input)
        st.subheader("🔮 Prediction")
        st.success(f"The sentiment is **{prediction.upper()}**")
    else:
        st.warning("⚠️ Please enter some text for prediction.")

# -------------------------------
# Metrics Visualization
# -------------------------------
st.subheader("📈 Model Performance Comparison")
metrics_df = pd.DataFrame(results)[["Model", "Accuracy", "Precision", "Recall", "F1-score"]]
metrics_df.set_index("Model", inplace=True)

st.dataframe(metrics_df.style.background_gradient(cmap="Blues"))

# Plot
st.bar_chart(metrics_df)

# Confusion Matrix for Best Model
st.subheader("📊 Confusion Matrix (Best Model)")
best = max(results, key=lambda x: x["Accuracy"])
cm = best["ConfusionMatrix"]

fig, ax = plt.subplots(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt="d", cmap="YlGnBu",
            xticklabels=["negative", "neutral", "positive"],
            yticklabels=["negative", "neutral", "positive"],
            ax=ax)
ax.set_xlabel("Predicted")
ax.set_ylabel("True")
st.pyplot(fig)
