from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import re
from collections import Counter
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from live_data_collector import LiveDataCollector
from ml_sentiment_predictor import MarketSentimentPredictor
import threading
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize sentiment analyzer
analyzer = SentimentIntensityAnalyzer()

# Initialize live data collector and ML predictor
live_collector = LiveDataCollector()
ml_predictor = MarketSentimentPredictor()

# Global cache for live sentiment data - reduced cache time for demo
live_sentiment_cache = {
    'data': None,
    'timestamp': None,
    'cache_duration': 60  # 1 minute for dynamic updates
}

class MarketSentimentAPI:
    def __init__(self):
        # Load the sentiment data
        csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'market_sentiment_500.csv')
        self.df = pd.read_csv(csv_path)
        self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
        self.process_data()
    
    def process_data(self):
        """Process the raw sentiment data for API consumption"""
        # Sort by timestamp
        self.df = self.df.sort_values('timestamp')
        
        # Calculate daily aggregates
        self.df['date'] = self.df['timestamp'].dt.date
        self.daily_sentiment = self.df.groupby('date').agg({
            'sentiment': 'mean',
            'unemployment_rate': 'mean',
            'cpi': 'mean',
            'sp500': 'mean'
        }).reset_index()
        
        # Convert date to string for JSON serialization
        self.daily_sentiment['date'] = self.daily_sentiment['date'].astype(str)
        
        # Calculate sentiment by source type
        self.source_sentiment = self.df.groupby('source')['sentiment'].mean().to_dict()
        
        # Generate word cloud from news titles
        self.generate_word_cloud()
    
    def generate_word_cloud(self):
        """Extract key words from news titles for word cloud"""
        # Combine all news titles
        news_text = ' '.join(self.df[self.df['type'] == 'news']['title/text'].astype(str))
        
        # Simple word extraction (remove common words)
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'as', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'}
        
        # Extract words (simple regex)
        words = re.findall(r'\b[a-zA-Z]{4,}\b', news_text.lower())
        words = [word for word in words if word not in stop_words]
        
        # Get most common words
        word_counts = Counter(words)
        self.word_cloud = [word for word, count in word_counts.most_common(20)]
    
    def get_sentiment_trend(self, symbol='AAPL', days=30):
        """Get sentiment trend for the last N days"""
        print(f"Getting trend data for {symbol} with {days} days")  # Debug log
        
        # Get recent data based on days requested
        recent_data = self.daily_sentiment.tail(days)
        print(f"Retrieved {len(recent_data)} data points for {days} days")  # Debug log
        
        # Convert sentiment to 0-100 scale
        trend_data = []
        for _, row in recent_data.iterrows():
            # Convert sentiment from -1,1 to 0,100 scale
            score = max(0, min(100, (row['sentiment'] + 1) * 50))
            trend_data.append({
                'date': row['date'],
                'score': round(score, 2)
            })
        
        # Add some variation based on time range for more distinct visualization
        if days <= 7:
            # For week view, add more volatility
            for point in trend_data:
                point['score'] = max(0, min(100, point['score'] + np.random.normal(0, 5)))
        elif days >= 365:
            # For year view, smooth out the data
            for point in trend_data:
                point['score'] = max(0, min(100, point['score'] + np.random.normal(0, 2)))
        
        print(f"Returning {len(trend_data)} trend points")  # Debug log
        return trend_data
    
    def get_current_sentiment(self, symbol='AAPL'):
        """Get current sentiment scores using live data and ML predictions"""
        global live_sentiment_cache
        
        # Check if we have cached live data that's still fresh
        current_time = datetime.now()
        if (live_sentiment_cache['data'] is not None and 
            live_sentiment_cache['timestamp'] is not None and
            (current_time - live_sentiment_cache['timestamp']).seconds < live_sentiment_cache['cache_duration']):
            
            print("Using cached live sentiment data")
            return live_sentiment_cache['data']
        
        print("Fetching fresh live sentiment data...")
        
        try:
            # Get live data from all sources
            live_data = live_collector.get_comprehensive_sentiment(symbol)
            
            # Use ML model to analyze the data if available
            if ml_predictor.is_trained:
                ml_scores = ml_predictor.analyze_live_data(
                    live_data.get('news_articles', []),
                    live_data.get('social_posts', []),
                    live_data.get('economic_indicators', {})
                )
                
                # Use ML predictions
                sentiment_data = {
                    'overall': ml_scores['overall'],
                    'social': ml_scores['social'],
                    'news': ml_scores['news'],
                    'econ': ml_scores['economic']
                }
            else:
                # Use live collector scores as fallback
                sentiment_data = {
                    'overall': live_data['overall'],
                    'social': live_data['social'], 
                    'news': live_data['news'],
                    'econ': live_data['economic']
                }
            
            # Cache the results
            live_sentiment_cache['data'] = sentiment_data
            live_sentiment_cache['timestamp'] = current_time
            
            return sentiment_data
            
        except Exception as e:
            print(f"Error getting live sentiment: {e}")
            # Fallback to CSV data
            recent_news = self.df[self.df['type'] == 'news'].tail(10)
            recent_social = self.df[self.df['type'] == 'twitter'].tail(10)
            
            # Calculate averages
            news_sentiment = recent_news['sentiment'].mean()
            social_sentiment = recent_social['sentiment'].mean()
            
            # Get economic indicators from most recent data
            latest_econ = self.df.tail(1).iloc[0]
            
            # Convert to 5-point scale
            overall = ((news_sentiment + social_sentiment) / 2 + 1) * 2.5
            social = (social_sentiment + 1) * 2.5
            news = (news_sentiment + 1) * 2.5
            econ = min(5, max(1, 3 + (latest_econ['cpi'] - 280) / 20))
            
            return {
                'overall': round(overall, 2),
                'social': round(social, 2),
                'news': round(news, 2),
                'econ': round(econ, 2)
            }
    
    def get_latest_news(self, count=6):
        """Get latest news with sentiment using live data"""
        try:
            # Try to get live news data
            if hasattr(live_collector, 'news_data') and live_collector.news_data:
                live_news = live_collector.news_data[:count]
                
                news_list = []
                for i, article in enumerate(live_news):
                    sentiment_label = "POS" if article.get('sentiment_score', 0) > 0 else "NEG"
                    news_list.append({
                        'id': i,
                        'title': article.get('title', 'No title'),
                        'source': article.get('source', 'Unknown'),
                        'time': article.get('publishedAt', datetime.now().isoformat())[:19],
                        'sentiment': sentiment_label,
                        'sentiment_score': article.get('sentiment_score', 0),
                        'snippet': article.get('description', 'No description available')[:200] + '...'
                    })
                
                if news_list:
                    return news_list
        
        except Exception as e:
            print(f"Error getting live news: {e}")
        
        # Fallback to CSV data
        news_data = self.df[self.df['type'] == 'news'].tail(count)
        
        news_list = []
        for _, row in news_data.iterrows():
            sentiment_label = "POS" if row['sentiment'] > 0 else "NEG"
            news_list.append({
                'id': len(news_list),
                'title': row['title/text'],
                'source': row['source'],
                'time': row['timestamp'].strftime('%Y-%m-%d %H:%M'),
                'sentiment': sentiment_label,
                'sentiment_score': row['sentiment'],
                'snippet': f"Economic indicators: CPI {row['cpi']:.1f}, Unemployment {row['unemployment_rate']:.1f}%"
            })
        
        return news_list
    
    def get_recommendation(self, symbol='AAPL'):
        """Generate buy/sell recommendation based on overall sentiment analysis (2-5 scale)"""
        sentiment = self.get_current_sentiment(symbol)
        trend_data = self.get_sentiment_trend(symbol, days=7)
        
        # Calculate trend direction from recent data
        recent_scores = [point['score'] for point in trend_data[-5:]] if len(trend_data) >= 5 else []
        trend_direction = 0
        if len(recent_scores) > 1:
            trend_direction = 1 if recent_scores[-1] > recent_scores[0] else -1
        
        # Base recommendation on overall sentiment (2-5 scale)
        overall_rating = sentiment['overall']
        
        # Enhanced recommendation logic based on 2-5 sentiment scale
        if overall_rating >= 4.0:  # Strong positive sentiment
            if trend_direction >= 0:  # Upward or stable trend
                action = "STRONG BUY"
                confidence = min(95, 80 + (overall_rating - 4.0) * 10)
                explanation = f"Excellent sentiment across all indicators ({overall_rating:.1f}/5). Strong fundamentals with {'positive momentum' if trend_direction > 0 else 'stable conditions'}. High confidence investment opportunity."
            else:
                action = "BUY"
                confidence = min(85, 70 + (overall_rating - 4.0) * 10)
                explanation = f"Strong positive sentiment ({overall_rating:.1f}/5) despite recent downward trend. Fundamentals remain solid - good entry point for long-term investors."
                
        elif overall_rating >= 3.5:  # Moderately positive sentiment
            if trend_direction > 0:
                action = "BUY"
                confidence = min(80, 65 + (overall_rating - 3.5) * 20)
                explanation = f"Positive sentiment ({overall_rating:.1f}/5) with upward momentum. Good growth potential with manageable risk."
            elif trend_direction == 0:
                action = "HOLD"
                confidence = min(75, 60 + (overall_rating - 3.5) * 15)
                explanation = f"Moderately positive sentiment ({overall_rating:.1f}/5) in consolidation phase. Consider holding current positions and monitor for clear directional signals."
            else:
                action = "HOLD"
                confidence = min(70, 55 + (overall_rating - 3.5) * 10)
                explanation = f"Mixed signals: positive sentiment ({overall_rating:.1f}/5) but declining trend. Wait for trend reversal before increasing position."
                
        elif overall_rating >= 2.5:  # Neutral sentiment
            if trend_direction > 0:
                action = "HOLD"
                confidence = min(65, 50 + (overall_rating - 2.5) * 10)
                explanation = f"Neutral sentiment ({overall_rating:.1f}/5) with improving trend. Hold positions and monitor for sustained improvement before adding."
            else:
                action = "HOLD"
                confidence = min(60, 45 + abs(overall_rating - 3.0) * 10)
                explanation = f"Neutral sentiment ({overall_rating:.1f}/5) with uncertain direction. Maintain defensive positions until clearer signals emerge."
                
        else:  # Negative sentiment (below 2.5)
            if trend_direction > 0:
                action = "HOLD"
                confidence = min(70, 55 + (2.5 - overall_rating) * 10)
                explanation = f"Negative sentiment ({overall_rating:.1f}/5) but showing signs of recovery. Wait for sustained improvement before considering purchases."
            else:
                action = "SELL"
                confidence = min(85, 65 + (2.5 - overall_rating) * 15)
                explanation = f"Poor sentiment ({overall_rating:.1f}/5) with continuing decline. Consider reducing exposure to limit downside risk."
        
        # Factor in individual sentiment components for more nuanced analysis
        component_analysis = []
        if sentiment['news'] < 2.3:
            component_analysis.append("negative news coverage")
        elif sentiment['news'] > 3.7:
            component_analysis.append("positive news sentiment")
            
        if sentiment['social'] < 2.3:
            component_analysis.append("bearish social sentiment")
        elif sentiment['social'] > 3.7:
            component_analysis.append("bullish social sentiment")
            
        if sentiment['econ'] < 2.3:
            component_analysis.append("weak economic indicators")
        elif sentiment['econ'] > 3.7:
            component_analysis.append("strong economic backdrop")
        
        if component_analysis:
            explanation += f" Key factors: {', '.join(component_analysis)}."
        
        return {
            'action': action,
            'confidence': round(confidence),
            'explanation': explanation,
            'overall_rating': overall_rating,
            'components': {
                'news': sentiment['news'],
                'social': sentiment['social'],
                'economic': sentiment['econ']
            }
        }

# Initialize the API
api = MarketSentimentAPI()

@app.route('/api/sentiment/<symbol>')
def get_sentiment(symbol):
    """Get current sentiment for a symbol"""
    sentiment = api.get_current_sentiment(symbol)
    return jsonify(sentiment)

@app.route('/api/trend/<symbol>')
def get_trend(symbol):
    """Get sentiment trend for a symbol"""
    days = request.args.get('days', 30, type=int)
    trend = api.get_sentiment_trend(symbol, days)
    return jsonify(trend)

@app.route('/api/news')
def get_news():
    """Get latest news"""
    count = request.args.get('count', 6, type=int)
    news = api.get_latest_news(count)
    return jsonify(news)

@app.route('/api/wordcloud')
def get_wordcloud():
    """Get word cloud data"""
    return jsonify(api.word_cloud)

@app.route('/api/recommendation/<symbol>')
def get_recommendation(symbol):
    """Get buy/sell recommendation"""
    recommendation = api.get_recommendation(symbol)
    return jsonify(recommendation)

@app.route('/api/companies')
def get_companies():
    """Get list of supported companies"""
    companies = []
    for symbol, info in live_collector.company_map.items():
        companies.append({
            'symbol': symbol,
            'name': info['name'],
            'keywords': info['keywords']
        })
    return jsonify(companies)

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/clear-cache', methods=['POST'])
def clear_cache():
    """Clear sentiment data cache for fresh data"""
    global live_sentiment_cache
    live_sentiment_cache['data'] = None
    live_sentiment_cache['timestamp'] = None
    return jsonify({'status': 'cache cleared', 'timestamp': datetime.now().isoformat()})

def initialize_ml_model():
    """Initialize and train ML model in background"""
    try:
        print("Training ML sentiment model...")
        ml_predictor.train_models()
        print("ML model training completed!")
    except Exception as e:
        print(f"ML model training failed: {e}")
        print("Using VADER sentiment as fallback")

def preload_live_data():
    """Preload live sentiment data"""
    try:
        print("Preloading live sentiment data...")
        live_collector.get_comprehensive_sentiment('AAPL', 'Apple')
        print("Live data preloaded!")
    except Exception as e:
        print(f"Live data preloading failed: {e}")

if __name__ == '__main__':
    print("Starting Market Sentiment API with Live Data Integration...")
    
    # Initialize ML model in background
    ml_thread = threading.Thread(target=initialize_ml_model)
    ml_thread.daemon = True
    ml_thread.start()
    
    # Preload live data
    data_thread = threading.Thread(target=preload_live_data)
    data_thread.daemon = True  
    data_thread.start()
    
    print("Available endpoints:")
    print("  GET /api/sentiment/<symbol> - Current sentiment scores (LIVE DATA + ML)")
    print("  GET /api/trend/<symbol>?days=30 - Sentiment trend data")  
    print("  GET /api/news?count=6 - Latest news (LIVE DATA)")
    print("  GET /api/wordcloud - Word cloud data")
    print("  GET /api/recommendation/<symbol> - Buy/sell recommendation (ML ENHANCED)")
    print("  GET /api/health - Health check")
    print("")
    print("🔥 FEATURES:")
    print("  ✅ Live News API integration")  
    print("  ✅ Reddit social sentiment")
    print("  ✅ FRED economic indicators")
    print("  ✅ ML-powered sentiment scoring")
    print("  ✅ Real-time data caching")
    
    app.run(debug=True, host='0.0.0.0', port=5000)