import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging

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
    
    def extract_key_points(self, review_text):
        """
        Extract key points from review using Gemini
        Returns: string with bullet points
        """
        try:
            prompt = f"""Analyze this product review and extract 3-5 key points in bullet points.
Be concise and focus on the most important aspects mentioned.

Review: {review_text}

Format your response as bullet points (use - for bullets)."""
            
            logger.info("Sending request to Gemini API...")
            response = self.model.generate_content(prompt)
            logger.info("Gemini response received successfully")
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini analysis error: {e}", exc_info=True)
            return "- Unable to extract key points at this time"