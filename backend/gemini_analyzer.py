import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging
import re

load_dotenv()
logger = logging.getLogger(__name__)

class GeminiAnalyzer:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            logger.error("GEMINI_API_KEY not found in environment variables")
            raise ValueError("GEMINI_API_KEY is required")
        
        genai.configure(api_key=api_key)
        # Using gemini-2.5-flash which is available and recommended
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        logger.info("Gemini analyzer initialized successfully with gemini-2.5-flash")
    
    def extract_key_points(self, review_text, language='id'):
        """
        Extract key points from review using Gemini
        `language` can be 'id' or 'en'
        Returns: string with bullet points in requested language
        """
        try:
            if language == 'en':
                prompt = f"""Analyze this product review and extract 3-5 key points in bullet points.
Be concise and focus on the most important aspects mentioned.

Review: {review_text}

Format your response as bullet points (use - for bullets). IMPORTANT: Answer in English."""
            else:
                prompt = f"""Analisis review produk ini dan ekstrak 3-5 poin penting dalam bentuk bullet points.
Singkat dan fokus pada aspek-aspek paling penting yang disebutkan.

Review: {review_text}

Format respons sebagai bullet points (gunakan - untuk bullets). PENTING: Jawab dalam Bahasa Indonesia!"""

            logger.info("Sending request to Gemini API...")
            response = self.model.generate_content(prompt)
            logger.info("Gemini response received successfully")
            text = getattr(response, 'text', None)
            if text and text.strip():
                return text
            # fallback if empty
            logger.warning("Gemini returned empty response, using fallback extractor")
            return self._fallback_extract(review_text, language)

        except Exception as e:
            logger.error(f"Gemini analysis error: {e}", exc_info=True)
            # try fallback extractor
            try:
                return self._fallback_extract(review_text, language)
            except Exception as e2:
                logger.error(f"Fallback extractor failed: {e2}", exc_info=True)
                return "- Unable to extract key points at this time" if language == 'en' else "- Tidak bisa ekstrak poin penting saat ini"

    def _fallback_extract(self, review_text, language='id'):
        """
        Fallback: Extract key points using rule-based NLP.
        Detects sentiment phrases, product aspects, and user experience.
        """
        text = review_text.strip().lower()
        
        points = []
        
        # Count positive and negative sentiment indicators
        pos_count = 0
        neg_count = 0
        
        # Indonesian keywords mapping
        if language == 'id':
            sentiment_phrases = {
                'positif': ['bagus', 'puas', 'suka', 'mantap', 'rekomendasi', 'tidak menyesal', 'sangat bagus'],
                'negatif': ['buruk', 'kecewa', 'jelek', 'tidak puas', 'bermasalah'],
                'aspek': ['produk', 'kualitas', 'desain', 'performa', 'harga', 'ongkos', 'fitur', 'baterai', 'layar', 'prosesor']
            }
            
            # Count sentiments
            pos_count = sum(1 for w in sentiment_phrases['positif'] if w in text)
            neg_count = sum(1 for w in sentiment_phrases['negatif'] if w in text)
            
            # Extract positive/negative aspects
            for aspect in sentiment_phrases['aspek']:
                if aspect in text:
                    if pos_count > neg_count:
                        points.append(f"- {aspect.capitalize()} berkualitas baik dan memuaskan")
            
            # Extract overall sentiment (only add negative if neg sentiment is strong)
            if pos_count > neg_count:
                if 'tidak menyesal' in text:
                    points.append("- Pengguna sangat puas dan tidak menyesal dengan pembelian")
                elif any(pos in text for pos in sentiment_phrases['positif']):
                    points.append("- Pengguna sangat puas dengan pembelian")
            
            if neg_count > pos_count:
                points.append("- Ada beberapa kekurangan yang mengecewakan pengguna")
            
            # Extract rekomendasi
            if any(w in text for w in ['rekomendasi', 'layak', 'bagus']):
                points.append("- Produk direkomendasikan oleh pengguna")
        else:
            # English keywords mapping
            sentiment_phrases = {
                'positif': ['good', 'great', 'satisfied', 'happy', 'recommend', 'excellent', 'love'],
                'negatif': ['bad', 'poor', 'disappointed', 'unhappy', 'issue', 'problem'],
                'aspek': ['product', 'quality', 'design', 'performance', 'price', 'features', 'battery', 'display', 'processor']
            }
            
            # Count sentiments
            pos_count = sum(1 for w in sentiment_phrases['positif'] if w in text)
            neg_count = sum(1 for w in sentiment_phrases['negatif'] if w in text)
            
            # Extract aspects
            for aspect in sentiment_phrases['aspek']:
                if aspect in text:
                    if pos_count > neg_count:
                        points.append(f"- {aspect.capitalize()} is of good quality")
            
            # Extract overall sentiment (only add negative if neg sentiment is strong)
            if pos_count > neg_count:
                if "don't regret" in text or 'satisfied' in text:
                    points.append("- User is very satisfied and happy with the purchase")
                elif any(pos in text for pos in sentiment_phrases['positif']):
                    points.append("- User is satisfied with the product")
            
            if neg_count > pos_count:
                points.append("- User experienced some issues or disappointment")
            
            if any(w in text for w in ['recommend', 'good']):
                points.append("- Product is recommended by the user")
        
        # If no points extracted, return fallback
        if not points:
            sents = [s.strip() for s in re.split(r'[\.\!\?]\s+', review_text) if s.strip()]
            if sents:
                return f"- {sents[0]}"
            return "- Produk ini layak dipertimbangkan" if language == 'id' else "- Product is worth considering"
        
        # Remove duplicates and limit to 5 points
        unique_points = list(dict.fromkeys(points))
        return "\n".join(unique_points[:5])