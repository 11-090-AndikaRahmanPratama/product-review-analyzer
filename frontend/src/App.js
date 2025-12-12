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
  // Translations for UI
  const translations = {
    id: {
      title: "Analisis Review Produk",
      subtitle:
        "Analisis sentimen dan ekstrak insight penting dari review produk",
      sendReview: "Kirim Review",
      productNamePlaceholder: "Nama produk",
      reviewPlaceholder:
        "Masukkan review produk Anda di sini... (minimal 10 karakter)",
      analyzing: "Menganalisis...",
      analyzeButton: "Analisis Review",
      minReviewError: "Review harus minimal 10 karakter",
      analysisError: "Terjadi error saat analisis",
      sentimentAnalysis: "Analisis Sentimen",
      keyPoints: "Poin Penting",
      reviewText: "Teks Review",
      previousReviews: "Review Sebelumnya",
      loadingReviews: "Memuat reviews...",
      noReviews: "Belum ada review. Jadilah yang pertama!",
      productLabel: "Produk",
      languageLabel: "Bahasa",
      resultTitle: "Hasil Analisis",
      confidence: "Kepercayaan",
      errorPrefix: "Error:",
      positive: "POSITIF",
      negative: "NEGATIF",
      neutral: "NETRAL",
      toggleTheme: "Ganti tema",
    },
    en: {
      title: "Product Review Analyzer",
      subtitle:
        "Sentiment analysis and extract important insights from product reviews",
      sendReview: "Submit Review",
      productNamePlaceholder: "Product name",
      reviewPlaceholder:
        "Enter your product review here... (min 10 characters)",
      analyzing: "Analyzing...",
      analyzeButton: "Analyze Review",
      minReviewError: "Review must be at least 10 characters",
      analysisError: "An error occurred while analyzing",
      sentimentAnalysis: "Sentiment Analysis",
      keyPoints: "Key Points",
      reviewText: "Review Text",
      previousReviews: "Previous Reviews",
      loadingReviews: "Loading reviews...",
      noReviews: "No reviews yet. Be the first!",
      productLabel: "Product",
      languageLabel: "Language",
      resultTitle: "Analysis Result",
      confidence: "Confidence",
      errorPrefix: "Error:",
      positive: "POSITIVE",
      negative: "NEGATIVE",
      neutral: "NEUTRAL",
      toggleTheme: "Toggle theme",
    },
  };

  const t = (key) =>
    translations[language] && translations[language][key]
      ? translations[language][key]
      : translations["id"][key];

  // persist language selection
  useEffect(() => {
    try {
      const saved = localStorage.getItem("language");
      if (saved) setLanguage(saved);
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("language", language);
    } catch (e) {}
  }, [language]);
  useEffect(() => {
    try {
      document.body.classList.toggle("dark", darkMode);
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    } catch (e) {}
  }, [darkMode]);
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
      setError(t("minReviewError"));
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
      setError(err.response?.data?.error || t("analysisError"));
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
        return "";
      case "negative":
        return "";
      default:
        return "";
    }
  };

  const translateSentimentLabel = (sentiment) => {
    if (sentiment === "positive") return t("positive");
    if (sentiment === "negative") return t("negative");
    return t("neutral");
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <header className="header">
        <div className="header-inner">
          <div>
            <h1>{t("title")}</h1>
            <p>{t("subtitle")}</p>
          </div>
          <div className="header-controls">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label={t("languageLabel")}
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
              aria-label={t("toggleTheme")}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Analysis Form */}
        <section className="form-section">
          <h2>{t("sendReview")}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={t("productNamePlaceholder")}
              disabled={loading}
            />
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t("reviewPlaceholder")}
              rows="6"
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? t("analyzing") : t("analyzeButton")}
            </button>
          </form>

          {error && (
            <div className="error-message">
              {t("errorPrefix")} {error}
            </div>
          )}
        </section>

        {/* Analysis Result */}
        {result && (
          <section className="result-section">
            <h2>{t("resultTitle")}</h2>
            <div className="sentiment-box">
              <h3>{t("sentimentAnalysis")}</h3>
              <div className="sentiment-display">
                <span className="emoji">
                  {getSentimentEmoji(result.sentiment)}
                </span>
                <span className="sentiment-label">
                  {translateSentimentLabel(result.sentiment)}
                </span>
              </div>
              <div className="confidence">
                {t("confidence")}: {(result.confidence_score * 100).toFixed(2)}%
              </div>
            </div>

            <div className="key-points-box">
              <h3>{t("keyPoints")}</h3>
              <div className="key-points-content">{result.key_points}</div>
            </div>

            <div className="review-text-box">
              <h3>{t("reviewText")}</h3>
              {result.product_name && (
                <p className="product-name">
                  {t("productLabel")}: {result.product_name}
                </p>
              )}
              <p className="review-language">
                {t("languageLabel")}:{" "}
                {result.language === "en" ? "English" : "Bahasa Indonesia"}
              </p>
              <p>{result.review_text}</p>
            </div>
          </section>
        )}

        {/* Previous Reviews */}
        <section className="reviews-section">
          <h2>
            {t("previousReviews")} ({reviews.length})
          </h2>
          {loadingReviews ? (
            <p>{t("loadingReviews")}</p>
          ) : reviews.length === 0 ? (
            <p>{t("noReviews")}</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="review-sentiment">
                      {getSentimentEmoji(review.sentiment)}{" "}
                      {translateSentimentLabel(review.sentiment)}
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
