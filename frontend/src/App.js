import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const API_URL = "http://localhost:6543/api";

function App() {
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Fetch all reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await axios.get(`${API_URL}/reviews`);
      setReviews(response.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (reviewText.trim().length < 10) {
      setError("Review must be at least 10 characters long");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/analyze-review`, {
        review_text: reviewText,
      });

      setResult(response.data);
      setReviewText("");

      // Refresh reviews list
      fetchReviews();
    } catch (err) {
      setError(
        err.response?.data?.error || "An error occurred during analysis"
      );
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "#10b981";
      case "negative":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "negative":
        return "😞";
      default:
        return "😐";
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🔍 Product Review Analyzer</h1>
        <p>Analyze sentiment and extract key insights from product reviews</p>
      </header>

      <main className="main-content">
        {/* Analysis Form */}
        <section className="form-section">
          <h2>Submit a Review</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Enter your product review here... (minimum 10 characters)"
              rows="6"
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Review"}
            </button>
          </form>

          {error && <div className="error-message">Error: {error}</div>}
        </section>

        {/* Analysis Result */}
        {result && (
          <section className="result-section">
            <h2>Analysis Result</h2>
            <div className="sentiment-box">
              <h3>Sentiment Analysis</h3>
              <div className="sentiment-display">
                <span className="emoji">
                  {getSentimentEmoji(result.sentiment)}
                </span>
                <span className="sentiment-label">
                  {result.sentiment.toUpperCase()}
                </span>
              </div>
              <div className="confidence">
                Confidence: {(result.confidence_score * 100).toFixed(2)}%
              </div>
            </div>

            <div className="key-points-box">
              <h3>Key Points</h3>
              <div className="key-points-content">{result.key_points}</div>
            </div>

            <div className="review-text-box">
              <h3>Review Text</h3>
              <p>{result.review_text}</p>
            </div>
          </section>
        )}

        {/* Previous Reviews */}
        <section className="reviews-section">
          <h2>Previous Reviews ({reviews.length})</h2>
          {loadingReviews ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p>No reviews yet. Be the first to submit one!</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="review-sentiment">
                      {getSentimentEmoji(review.sentiment)} {review.sentiment}
                    </span>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-text">{review.review_text}</p>
                  <div className="review-key-points">{review.key_points}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
