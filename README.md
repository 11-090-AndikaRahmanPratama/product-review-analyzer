# Product Review Analyzer

An intelligent web application that analyzes product reviews using AI to determine sentiment and extract key insights. Built with Python Pyramid backend and React frontend.

![Python](https://img.shields.io/badge/Python-3.13.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-22.12.0-green)
![React](https://img.shields.io/badge/React-18.x-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Sentiment Analysis**: Automatically detects positive, negative, or neutral sentiment using Hugging Face's DistilBERT model
- **Confidence Scoring**: Provides confidence percentage for sentiment predictions
- **Key Points Extraction**: Uses Google Gemini AI to extract main insights from reviews
- **Persistent Storage**: Saves all analyses to PostgreSQL database
- **Responsive UI**: Modern React interface with real-time updates
- **Review History**: View and browse all previously analyzed reviews
- **RESTful API**: Clean API endpoints for integration with other services

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │────────▶│ Pyramid Backend │────────▶│   PostgreSQL    │
│   (Port 3000)   │         │   (Port 6543)    │         │    Database     │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                  │
            ┌───────▼────────┐              ┌─────────▼──────┐
            │  Hugging Face  │              │  Gemini API    │
            │  DistilBERT    │              │  (Google AI)   │
            │  Sentiment     │              │  Key Points    │
            └────────────────┘              └────────────────┘
```

## Tech Stack

### Backend

- **Framework**: Python Pyramid
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI/ML**:
  - Hugging Face Transformers (Sentiment Analysis)
  - Google Generative AI (Key Points Extraction)
- **Server**: Waitress WSGI server

### Frontend

- **Framework**: React 18.x
- **HTTP Client**: Axios
- **Styling**: Custom CSS with modern design

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.13.0 or higher
- Node.js 22.12.0 or higher
- PostgreSQL 14 or higher
- pip (Python package manager)
- npm (Node package manager)

You'll also need:

- Hugging Face account (free) - [Sign up here](https://huggingface.co/)
- Google AI Studio account (free) - [Get API key here](https://aistudio.google.com/app/apikey)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/product-review-analyzer.git
cd product-review-analyzer
```

### 2. Setup PostgreSQL Database

```bash
# Open psql command line
psql -U postgres

# Create database and user
CREATE DATABASE product_reviews;
CREATE USER review_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE product_reviews TO review_user;
\q
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install pyramid waitress sqlalchemy psycopg2-binary transformers torch google-generativeai python-dotenv pyramid-cors

# Create .env file
# Copy .env.example to .env and fill in your credentials
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://review_user:your_secure_password@localhost/product_reviews
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Test your setup:**

```bash
python test_setup.py
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Or if you haven't created the React app yet:
npx create-react-app .
npm install axios
```

## Running the Application

### Start Backend Server

```bash
cd backend
# Make sure virtual environment is activated
python app.py
```

Backend will run on: `http://localhost:6543`

### Start Frontend Server

```bash
cd frontend
npm start
```

Frontend will run on: `http://localhost:3000`

## API Endpoints

### Health Check

```http
GET /
```

**Response:**

```json
{
  "status": "healthy",
  "message": "Product Review Analyzer API is running",
  "version": "1.0.0"
}
```

### Analyze Review

```http
POST /api/analyze-review
Content-Type: application/json

{
  "product_name": "HP Victus 16",
  "review_text": "This product is amazing! It works perfectly."
}
```

**Response:**

```json
{
  "id": 1,
  "product_name": "HP Victus 16",
  "review_text": "This product is amazing! It works perfectly.",
  "sentiment": "positive",
  "confidence_score": 0.9998,
  "key_points": "- Product quality exceeded expectations\n- Works as advertised\n- Highly satisfied with purchase",
  "created_at": "2024-12-12T10:30:00"
}
```

### Get All Reviews

```http
GET /api/reviews
```

**Response:**

```json
[
  {
    "id": 1,
    "product_name": "HP Victus 16",
    "review_text": "This product is amazing!",
    "sentiment": "positive",
    "confidence_score": 0.9998,
    "key_points": "- Product quality exceeded expectations",
    "created_at": "2024-12-12T10:30:00"
  }
]
```

## Project Structure

```
product-review-analyzer/
├── backend/
│   ├── venv/                      # Virtual environment
│   ├── .env                       # Environment variables (not in git)
│   ├── .env.example              # Environment template
│   ├── app.py                     # Main application entry point
│   ├── models.py                  # Database models
│   ├── views.py                   # API endpoints
│   ├── sentiment_analyzer.py     # Hugging Face integration
│   ├── gemini_analyzer.py        # Gemini AI integration
│   ├── test_setup.py             # Setup testing script
│   └── requirements.txt          # Python dependencies
│
├── frontend/
│   ├── node_modules/             # Node dependencies
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js                # Main React component
│   │   ├── App.css               # Styling
│   │   └── index.js              # React entry point
│   ├── package.json              # Node dependencies
│   └── package-lock.json
│
└── README.md                      # This file
```

## 🧪 Testing

### Test Backend API with curl

**Health Check:**

```bash
curl http://localhost:6543/
```

**Analyze Review:**

```bash
curl -X POST http://localhost:6543/api/analyze-review \
  -H "Content-Type: application/json" \
  -d "{\"product_name\":\"laptop HP victus\",\"review_text\":\"produk nya sangat bagus sangat tidak menyesal memilihnya\",\"language\":\"id\"}"
```

**Get All Reviews:**

```bash
curl http://localhost:6543/api/reviews
```

### Test Backend Setup

```bash
cd backend
python test_setup.py
```

This will verify:

- All dependencies are installed
- Environment variables are configured
- Database connection works
- AI models can be loaded

### Main Interface

The application features a clean, modern interface where users can:

- Submit product reviews for analysis
- View sentiment results with confidence scores
- See extracted key points
- Browse history of previous analyses

### Sentiment Analysis

Build with sentiment analysis

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

| Variable              | Description                  | Required   |
| --------------------- | ---------------------------- | ---------- |
| `DATABASE_URL`        | PostgreSQL connection string | Yes        |
| `HUGGINGFACE_API_KEY` | Hugging Face API token       | Optional\* |
| `GEMINI_API_KEY`      | Google Gemini API key        | Yes        |

\*Hugging Face API key is optional as the model runs locally, but recommended to avoid rate limiting warnings.

### Database Configuration

Default connection string format:

```
postgresql://username:password@host:port/database_name
```

Example:

```
postgresql://review_user:mypassword@localhost:5432/product_reviews
```

## Troubleshooting

### Common Issues

**1. ModuleNotFoundError**

```bash
# Install missing module
pip install <module_name>
```

**2. Database Connection Error**

- Verify PostgreSQL service is running
- Check credentials in `.env` file
- Test connection: `psql -U review_user -d product_reviews`

**3. CORS Error in Frontend**

- Ensure backend server is running on port 6543
- Check CORS headers in `app.py`

**4. Model Download is Slow**

- DistilBERT model (~250MB) downloads on first run
- Be patient during initial setup
- Subsequent runs use cached model

**5. Gemini API Error**

- Verify API key is valid
- Check quota at [Google AI Studio](https://aistudio.google.com/)
- Ensure you have active internet connection

**6. Port Already in Use**

```bash
# Backend (port 6543)
netstat -ano | findstr :6543
# Kill the process using the port

# Frontend (port 3000)
netstat -ano | findstr :3000
```

## Database Schema

### Reviews Table

| Column             | Type       | Description                                    |
| ------------------ | ---------- | ---------------------------------------------- |
| `id`               | Integer    | Primary key, auto-increment                    |
| `review_text`      | Text       | Original review content                        |
| `sentiment`        | String(50) | Detected sentiment (positive/negative/neutral) |
| `confidence_score` | Float      | Confidence level (0.0 to 1.0)                  |
| `key_points`       | Text       | Extracted insights from Gemini                 |
| `created_at`       | DateTime   | Timestamp of analysis                          |

## Deployment

### Backend Deployment

For production deployment, consider:

1. **Use a production WSGI server** (Gunicorn, uWSGI)

```bash
pip install gunicorn
gunicorn app:main --bind 0.0.0.0:6543
```

2. **Set up environment variables** securely
3. **Use managed PostgreSQL** (AWS RDS, Google Cloud SQL)
4. **Enable HTTPS** with SSL certificates
5. **Set up logging and monitoring**

### Frontend Deployment

Build for production:

```bash
cd frontend
npm run build
```

Deploy the `build` folder to:

- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

Update API URL in production build to point to your backend server.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- GitHub: [@yourusername](https://github.com/11-090-AndikaRahmanPratama)

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for the DistilBERT sentiment analysis model
- [Google AI](https://ai.google.dev/) for Gemini API
- [Pyramid](https://trypyramid.com/) web framework
- [React](https://react.dev/) JavaScript library

## Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search [existing issues](https://github.com/11-090-AndikaRahmanPratama/product-review-analyzer/issues)
3. Create a [new issue](https://github.com/11-090-AndikaRahmanPratama/product-review-analyzer/issues/new) with:
   - Detailed description of the problem
   - Steps to reproduce
   - Error messages or logs
   - Your environment details (OS, Python version, etc.)

## 🔮 Future Enhancements

- [ ] Multi-language support for reviews
- [ ] Batch review analysis
- [ ] Export results to CSV/PDF
- [ ] User authentication and personal dashboards
- [ ] Review comparison and trending analysis
- [ ] Integration with e-commerce platforms
- [ ] Advanced visualization charts
- [ ] Real-time analysis streaming

---
