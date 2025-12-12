from transformers import pipeline
import os
from dotenv import load_dotenv

load_dotenv()

class SentimentAnalyzer:
    def __init__(self):
        # Using multilingual model that supports Indonesian, English, and many other languages
        hf_token = os.getenv('HUGGINGFACE_API_KEY')
        
        try:
            self.analyzer = pipeline(
                "sentiment-analysis",
                model="nlptown/bert-base-multilingual-uncased-sentiment",
                token=hf_token if hf_token else None,
                device=-1  # Use CPU explicitly to avoid meta tensor issues
            )
            print("Loaded multilingual sentiment analyzer (supports Indonesian)")
        except Exception as e:
            print(f"Error loading multilingual model: {e}")
            try:
                # Fallback to English model
                self.analyzer = pipeline(
                    "sentiment-analysis",
                    model="distilbert-base-uncased-finetuned-sst-2-english",
                    token=hf_token if hf_token else None,
                    device=-1
                )
                print("Loaded English sentiment analyzer (fallback)")
            except Exception as e2:
                print(f"Error loading model: {e2}")
                raise
    
    def analyze(self, text, language='id'):
        """
        Analyze sentiment of text (supports Indonesian and other languages)
        Returns: dict with 'sentiment' and 'confidence_score'
        """
        try:
            result = self.analyzer(text[:512])[0]  # Limit to 512 chars

            # Log raw result for debugging
            print(f"Raw sentiment model output: {result}")

            # Map different label formats from different models
            label = str(result.get('label', '')).upper().strip()
            confidence = float(result.get('score', result.get('confidence', 0.0)))

            sentiment = 'neutral'

            # If label contains STAR/STARS, extract numeric rating
            if 'STAR' in label:
                import re
                m = re.search(r"(\d)", label)
                if m:
                    n = int(m.group(1))
                    if n >= 4:
                        sentiment = 'positive'
                    elif n == 3:
                        sentiment = 'neutral'
                    else:
                        sentiment = 'negative'
                else:
                    # fallback to previous heuristics
                    if '5' in label or '4' in label:
                        sentiment = 'positive'
                    elif '1' in label or '2' in label:
                        sentiment = 'negative'
                    else:
                        sentiment = 'neutral'
            else:
                # Handle English model output (POSITIVE, NEGATIVE, NEUTRAL)
                if 'POSITIVE' in label:
                    sentiment = 'positive'
                elif 'NEGATIVE' in label:
                    sentiment = 'negative'
                elif 'NEUTRAL' in label:
                    sentiment = 'neutral'
                else:
                    sentiment = 'neutral'

            print(f"Label: {label}, Sentiment: {sentiment}, Score: {confidence}")

            # If model confidence is low, apply a simple heuristic (keyword-based)
            try:
                if confidence < 0.6:
                    text_low = text.lower()
                    if language == 'id':
                        pos_words = ['bagus', 'puas', 'suka', 'mantap', 'tidak menyesal', 'bagus sekali', 'rekomendasi']
                        neg_words = ['buruk', 'kecewa', 'menyesal', 'tidak puas', 'jelek']
                    else:
                        pos_words = ['good', 'great', 'satisfied', 'happy', 'recommend']
                        neg_words = ['bad', 'poor', 'disappointed', 'regret', 'not satisfied']

                    pos_count = sum(1 for w in pos_words if w in text_low)
                    neg_count = sum(1 for w in neg_words if w in text_low)
                    if pos_count > neg_count:
                        print(f"Heuristic override to positive (pos_count={pos_count}, neg_count={neg_count})")
                        sentiment = 'positive'
                        confidence = max(confidence, 0.75)
                    elif neg_count > pos_count:
                        print(f"Heuristic override to negative (pos_count={pos_count}, neg_count={neg_count})")
                        sentiment = 'negative'
                        confidence = max(confidence, 0.6)
            except Exception as e:
                print(f"Heuristic override error: {e}")

            return {
                'sentiment': sentiment,
                'confidence_score': round(confidence, 4)
            }
        except Exception as e:
            print(f"Sentiment analysis error: {e}")
            return {
                'sentiment': 'neutral',
                'confidence_score': 0.5
            }