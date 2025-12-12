from pyramid.config import Configurator
from pyramid.response import Response
from waitress import serve
import logging
import traceback

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def cors_tween_factory(handler, registry):
    """CORS tween to add headers to all responses"""
    def cors_tween(request):
        # Handle OPTIONS preflight
        if request.method == 'OPTIONS':
            response = Response()
            response.headers.update({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            })
            return response
        
        # Handle regular requests
        response = handler(request)
        response.headers.update({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        })
        return response
    
    return cors_tween

def main():
    logger.info("Starting Product Review Analyzer API...")
    
    try:
        config = Configurator()
        
        # Add CORS tween
        config.add_tween('app.cors_tween_factory')
        
        # Routes
        config.add_route('health', '/')
        config.add_route('analyze_review', '/api/analyze-review')
        config.add_route('get_reviews', '/api/reviews')
        
        config.scan('views')
        
        app = config.make_wsgi_app()
        logger.info("Configuration completed successfully")
        return app
        
    except Exception as e:
        logger.error(f"Failed to configure app: {e}")
        logger.error(traceback.format_exc())
        raise

if __name__ == '__main__':
    try:
        app = main()
        logger.info("=" * 60)
        logger.info("🚀 Server running on http://localhost:6543")
        logger.info("=" * 60)
        logger.info("Endpoints:")
        logger.info("  GET  / - Health check")
        logger.info("  POST /api/analyze-review - Analyze review")
        logger.info("  GET  /api/reviews - Get all reviews")
        logger.info("=" * 60)
        serve(app, host='0.0.0.0', port=6543)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        logger.error(traceback.format_exc())
        raise