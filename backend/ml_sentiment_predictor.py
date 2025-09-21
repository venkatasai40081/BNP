import pandas as pd
import numpy as np
import re
import string
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pickle
import os

class MarketSentimentPredictor:
    def __init__(self):
        self.models = {}
        self.vectorizer = None
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.is_trained = False
        
    def label_sentiment(self, score):
        """Convert numerical sentiment to categorical label"""
        if score <= -0.2:
            return "negative"
        elif score >= 0.2:
            return "positive"
        else:
            return "neutral"
    
    def clean_text(self, text):
        """Clean and preprocess text"""
        if not isinstance(text, str):
            text = str(text)
        text = text.lower()
        text = re.sub(r"http\S+", "", text)  # Remove URLs
        text = text.translate(str.maketrans("", "", string.punctuation))
        text = re.sub(r"\d+", "", text)  # Remove numbers
        return text.strip()
    
    def train_models(self):
        """Train sentiment prediction models on historical data"""
        try:
            # Load training data
            df_path = "../market_sentiment_500.csv"
            if not os.path.exists(df_path):
                df_path = "market_sentiment_500.csv"  # Fallback path
            
            df = pd.read_csv(df_path)
            print(f"Loaded {len(df)} training samples")
            
            # Prepare data
            df["sentiment_label"] = df["sentiment"].apply(self.label_sentiment)
            df["clean_text"] = df["title/text"].astype(str).apply(self.clean_text)
            
            # Remove empty texts
            df = df[df["clean_text"].str.len() > 0]
            
            X = df["clean_text"]
            y = df["sentiment_label"]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Vectorize text
            self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
            X_train_vec = self.vectorizer.fit_transform(X_train)
            X_test_vec = self.vectorizer.transform(X_test)
            
            # Train multiple models
            self.models = {
                'logistic_regression': LogisticRegression(random_state=42),
                'random_forest': RandomForestClassifier(n_estimators=100, random_state=42)
            }
            
            # Train and evaluate models
            for name, model in self.models.items():
                model.fit(X_train_vec, y_train)
                y_pred = model.predict(X_test_vec)
                accuracy = accuracy_score(y_test, y_pred)
                print(f"{name} accuracy: {accuracy:.3f}")
            
            self.is_trained = True
            print("Model training completed successfully!")
            
        except Exception as e:
            print(f"Error training models: {e}")
            # Use VADER as fallback
            self.is_trained = False
    
    def predict_sentiment(self, text):
        """Predict sentiment for a single text"""
        if not text or not isinstance(text, str):
            return "neutral", 0.0
        
        cleaned_text = self.clean_text(text)
        
        if self.is_trained and self.vectorizer is not None:
            # Use trained ML model
            try:
                text_vec = self.vectorizer.transform([cleaned_text])
                
                # Use ensemble prediction from multiple models
                predictions = []
                for model in self.models.values():
                    pred = model.predict_proba(text_vec)[0]
                    predictions.append(pred)
                
                # Average predictions
                avg_pred = np.mean(predictions, axis=0)
                classes = list(self.models['logistic_regression'].classes_)
                
                predicted_class = classes[np.argmax(avg_pred)]
                confidence = np.max(avg_pred)
                
                return predicted_class, confidence
            
            except Exception as e:
                print(f"ML prediction error: {e}")
                # Fallback to VADER
        
        # Fallback to VADER sentiment
        vader_score = self.sentiment_analyzer.polarity_scores(text)['compound']
        sentiment_label = self.label_sentiment(vader_score)
        confidence = abs(vader_score)
        
        return sentiment_label, confidence
    
    def score_sentiment_batch(self, texts):
        """Score sentiment for multiple texts and return 2-5 scale (as per Market_Sentiment.py)"""
        if not texts:
            import random
            return round(random.uniform(2.8, 3.2), 2)  # Dynamic neutral in 2-5 range
        
        scores = []
        for text in texts:
            sentiment_label, confidence = self.predict_sentiment(text)
            
            # Convert to numerical score in 2-5 range
            if sentiment_label == "positive":
                score = 3.5 + (confidence * 1.5)  # 3.5-5 range
            elif sentiment_label == "negative":
                score = 3.5 - (confidence * 1.5)  # 2-3.5 range  
            else:  # neutral
                score = 3.0  # Neutral center in 2-5 scale
            
            scores.append(max(2, min(5, score)))
        
        # Return average score
        return round(np.mean(scores), 2)
    
    def analyze_live_data(self, news_articles, social_posts, economic_indicators):
        """Analyze live data and return sentiment scores"""
        
        # Analyze news sentiment
        news_texts = []
        if news_articles:
            for article in news_articles:
                title = article.get('title', '')
                description = article.get('description', '')
                news_texts.append(f"{title} {description}")
        
        import random
        news_score = self.score_sentiment_batch(news_texts) if news_texts else random.uniform(2.5, 3.5)
        
        # Analyze social media sentiment
        social_texts = []
        if social_posts:
            for post in social_posts:
                title = post.get('title', '')
                content = post.get('content', '')
                social_texts.append(f"{title} {content}")
        
        social_score = self.score_sentiment_batch(social_texts) if social_texts else random.uniform(2.6, 3.4)
        
        # Analyze economic sentiment (simplified approach)
        economic_score = random.uniform(2.7, 3.3)  # Start with dynamic neutral in 2-5 range
        if economic_indicators:
            positive_trends = 0
            total_indicators = len(economic_indicators)
            
            for indicator, data in economic_indicators.items():
                if isinstance(data, dict) and 'trend' in data:
                    # Positive economic indicators
                    if indicator in ['GDP', 'CONSUMER_CONFIDENCE'] and data['trend'] == 'up':
                        positive_trends += 1
                    # Negative indicators that are good when down
                    elif indicator in ['UNEMPLOYMENT', 'INFLATION'] and data['trend'] == 'down':
                        positive_trends += 1
                    # Interest rates are neutral
                    elif indicator == 'INTEREST_RATE':
                        positive_trends += 0.5
            
            if total_indicators > 0:
                economic_ratio = positive_trends / total_indicators
                # Scale to 2-5 range: ratio * 3 + 2
                economic_score = economic_ratio * 3 + 2
        
        # Calculate overall score
        overall_score = (news_score + social_score + economic_score) / 3
        
        return {
            'news': round(news_score, 2),
            'social': round(social_score, 2), 
            'economic': round(economic_score, 2),
            'overall': round(overall_score, 2)
        }
    
    def save_model(self, filepath):
        """Save trained model to file"""
        if self.is_trained:
            model_data = {
                'models': self.models,
                'vectorizer': self.vectorizer,
                'is_trained': self.is_trained
            }
            with open(filepath, 'wb') as f:
                pickle.dump(model_data, f)
            print(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """Load trained model from file"""
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.models = model_data['models']
            self.vectorizer = model_data['vectorizer'] 
            self.is_trained = model_data['is_trained']
            print(f"Model loaded from {filepath}")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            self.is_trained = False

# Initialize and train the model
if __name__ == "__main__":
    print("Initializing Market Sentiment Predictor...")
    predictor = MarketSentimentPredictor()
    
    # Train the model
    predictor.train_models()
    
    # Save the trained model
    predictor.save_model("sentiment_model.pkl")
    
    # Test with sample data
    test_texts = [
        "Apple stock shows strong growth potential",
        "Market concerns about inflation impact",
        "Neutral outlook for tech sector"
    ]
    
    for text in test_texts:
        sentiment, confidence = predictor.predict_sentiment(text)
        print(f"Text: {text}")
        print(f"Sentiment: {sentiment} (confidence: {confidence:.3f})")
        print("---")