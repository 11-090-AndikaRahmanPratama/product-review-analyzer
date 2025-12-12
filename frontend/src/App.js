import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const API_URL = "http://localhost:6543/api";

function App() {
  const [reviewText, setReviewText] = useState("");
  const [productName, setProductName] = useState("");
  const [language, setLanguage] = useState("id");
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch (e) {
      return false;
    }
  });
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
      setError("Review harus minimal 10 karakter");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/analyze-review`, {
        product_name: productName,
        review_text: reviewText,
        language: language,
      });

      setResult(response.data);
      setReviewText("");

      // Refresh reviews list
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.error || "Terjadi error saat analisis");
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
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <header className="header">
        <div className="header-inner">
          <div>
            <h1>Analisis Review Produk</h1>
            <p>
              Analisis sentimen dan ekstrak insight penting dari review produk
            </p>
          </div>
          <div className="header-controls">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Pilih bahasa"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
            <button
              className="theme-toggle"
              onClick={() => {
                const next = !darkMode;
                setDarkMode(next);
                try {
                  localStorage.setItem("theme", next ? "dark" : "light");
                } catch (e) {}
                document.body.classList.toggle("dark", next);
              }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Analysis Form */}
        <section className="form-section">
          <h2>Kirim Review</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Nama produk"
              disabled={loading}
            />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={loading}
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Masukkan review produk Anda di sini... (minimal 10 karakter)"
              rows="6"
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Menganalisis..." : "Analisis Review"}
            </button>
          </form>

          {error && <div className="error-message">Error: {error}</div>}
        </section>

        {/* Analysis Result */}
        {result && (
          <section className="result-section">
            <h2>Hasil Analisis</h2>
            <div className="sentiment-box">
              <h3>Analisis Sentimen</h3>
              <div className="sentiment-display">
                <span className="emoji">
                  {getSentimentEmoji(result.sentiment)}
                </span>
                <span className="sentiment-label">
                  {result.sentiment === "positive"
                    ? "POSITIF"
                    : result.sentiment === "negative"
                    ? "NEGATIF"
                    : "NETRAL"}
                </span>
              </div>
              <div className="confidence">
                Kepercayaan: {(result.confidence_score * 100).toFixed(2)}%
              </div>
            </div>

            <div className="key-points-box">
              <h3>Poin Penting</h3>
              <div className="key-points-content">{result.key_points}</div>
            </div>

            <div className="review-text-box">
              <h3>Teks Review</h3>
              {result.product_name && (
                <p className="product-name">Produk: {result.product_name}</p>
              )}
              <p className="review-language">
                Bahasa:{" "}
                {result.language === "en" ? "English" : "Bahasa Indonesia"}
              </p>
              <p>{result.review_text}</p>
            </div>
          </section>
        )}

        {/* Previous Reviews */}
        <section className="reviews-section">
          <h2>Review Sebelumnya ({reviews.length})</h2>
          {loadingReviews ? (
            <p>Memuat reviews...</p>
          ) : reviews.length === 0 ? (
            <p>Belum ada review. Jadilah yang pertama!</p>
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
                  {review.product_name && (
                    <div className="review-product">{review.product_name}</div>
                  )}
                  <div className="review-language-small">
                    {review.language === "en" ? "EN" : "ID"}
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
