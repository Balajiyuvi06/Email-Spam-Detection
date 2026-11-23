import os
import pickle
import csv
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.utils.validation import check_is_fitted
from sklearn.exceptions import NotFittedError

class ModelService:
    def __init__(self, base_dir=None):
        if base_dir is None:
            # Current directory of model_service.py is backend/services/
            self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        else:
            self.base_dir = base_dir

        self.original_model_path = os.path.join(self.base_dir, "models", "spam_detection_model.pkl")
        self.fitted_pipeline_path = os.path.join(self.base_dir, "models", "fitted_spam_pipeline.pkl")
        self.dataset_path = os.path.join(self.base_dir, "..", "dataset", "spam.csv")
        if not os.path.exists(self.dataset_path):
            self.dataset_path = os.path.join(self.base_dir, "spam.csv")

        self.model = None
        self.vectorizer = None
        self.pipeline = None
        self.threshold = 0.0
        self.is_loaded = False
        self.load_error = None
        self.model_metadata = {}

        self._initialize_model()

    def _initialize_model(self):
        """Loads the model or builds the fitted pipeline from the dataset & saved architecture."""
        try:
            # 1. Check if fitted pipeline already exists
            if os.path.exists(self.fitted_pipeline_path):
                with open(self.fitted_pipeline_path, "rb") as f:
                    cached = pickle.load(f)
                    self.vectorizer = cached["vectorizer"]
                    self.model = cached["model"]
                    self.threshold = cached.get("threshold", 0.0)
                    self.is_loaded = True
                    self._populate_metadata("Cached Fitted Pipeline (LinearSVC + TF-IDF)")
                    return

            # 2. Inspect original model file
            if not os.path.exists(self.original_model_path):
                alt_path = os.path.join(self.base_dir, "..", "spam_detection_model.pkl")
                if os.path.exists(alt_path):
                    self.original_model_path = alt_path

            if not os.path.exists(self.original_model_path):
                raise FileNotFoundError(f"Model file not found at {self.original_model_path}")

            with open(self.original_model_path, "rb") as f:
                saved_obj = pickle.load(f)

            if isinstance(saved_obj, dict):
                loaded_model = saved_obj.get("model")
                loaded_vec = saved_obj.get("vectorizer")
                self.threshold = saved_obj.get("threshold", 0.0)
            else:
                loaded_model = saved_obj
                loaded_vec = None

            # Test if vectorizer is fitted
            vec_fitted = False
            if loaded_vec is not None:
                try:
                    check_is_fitted(loaded_vec)
                    vec_fitted = True
                except (NotFittedError, AttributeError):
                    vec_fitted = False

            if vec_fitted and loaded_model is not None:
                self.vectorizer = loaded_vec
                self.model = loaded_model
                self.is_loaded = True
                self._populate_metadata("Loaded directly from spam_detection_model.pkl")
            else:
                # The saved vectorizer was un-fitted in original pickle.
                # Fit the vectorizer using the dataset with the exact specs from the model
                print("Original vectorizer is unfitted. Fitting on dataset with exact parameters...")
                self._fit_and_cache_pipeline(loaded_model)

        except Exception as e:
            self.load_error = str(e)
            self.is_loaded = False
            print(f"Error loading model: {e}")

    def _fit_and_cache_pipeline(self, base_model=None):
        """Fits TfidfVectorizer and LinearSVC using dataset/spam.csv and caches fitted pipeline."""
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"Dataset required for vectorizer fitting not found at {self.dataset_path}")

        texts = []
        labels = []
        with open(self.dataset_path, "r", encoding="latin-1") as f:
            reader = csv.reader(f, delimiter="\t")
            for row in reader:
                if len(row) >= 2:
                    labels.append(1 if row[0].strip().lower() == "spam" else 0)
                    texts.append(row[1])

        # Vectorizer configured as in saved model specs (ngram_range (1,2), stop_words='english', 5000 features matching LinearSVC)
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=5000,
            ngram_range=(1, 2),
            lowercase=True
        )
        X = self.vectorizer.fit_transform(texts)
        y = np.array(labels)

        # Use LinearSVC(C=10) matching the original saved model
        if base_model is not None and hasattr(base_model, "fit"):
            self.model = base_model
        else:
            self.model = LinearSVC(C=10, dual="auto", random_state=42)

        self.model.fit(X, y)
        self.is_loaded = True
        self.threshold = 0.0

        # Cache fitted pipeline for instant subsequent startups
        try:
            with open(self.fitted_pipeline_path, "wb") as f:
                pickle.dump({
                    "vectorizer": self.vectorizer,
                    "model": self.model,
                    "threshold": self.threshold
                }, f)
        except Exception as err:
            print(f"Warning: Could not save cached pipeline: {err}")

        self._populate_metadata("Fitted Pipeline with LinearSVC(C=10) and TfidfVectorizer(ngram_range=(1,2), 5000 features)")

    def _populate_metadata(self, source_info):
        model_name = type(self.model).__name__ if self.model else "Unknown"
        vec_name = type(self.vectorizer).__name__ if self.vectorizer else "Unknown"
        n_features = getattr(self.model, "n_features_in_", 5000)

        self.model_metadata = {
            "source": source_info,
            "classifier": model_name,
            "classifier_full": "Linear Support Vector Classifier (LinearSVC)",
            "vectorizer": vec_name,
            "vectorizer_full": "Term Frequency-Inverse Document Frequency (TF-IDF)",
            "hyperparameters": {
                "C": getattr(self.model, "C", 10),
                "penalty": getattr(self.model, "penalty", "l2"),
                "loss": getattr(self.model, "loss", "squared_hinge"),
                "ngram_range": getattr(self.vectorizer, "ngram_range", (1, 2)),
                "max_features": n_features,
                "stop_words": getattr(self.vectorizer, "stop_words", "english"),
                "lowercase": getattr(self.vectorizer, "lowercase", True)
            },
            "classes": [
                {"id": 0, "name": "Legitimate", "system_tag": "ham"},
                {"id": 1, "name": "Spam", "system_tag": "spam"}
            ],
            "supports_predict_proba": hasattr(self.model, "predict_proba"),
            "supports_decision_function": hasattr(self.model, "decision_function"),
            "confidence_method": "Platt Sigmoid Scaling on SVM Decision Function"
        }

    def predict(self, text, subject=None):
        if not self.is_loaded:
            raise RuntimeError(f"Model is not loaded. {self.load_error or 'Unknown error'}")

        combined_text = f"{subject.strip()}\n{text.strip()}" if subject and subject.strip() else text.strip()
        if not combined_text:
            raise ValueError("Input text cannot be empty.")

        # Limit max input size for safety
        if len(combined_text) > 50000:
            combined_text = combined_text[:50000]

        # TF-IDF vectorization
        features = self.vectorizer.transform([combined_text])
        raw_pred = int(self.model.predict(features)[0])

        # Decision score
        decision_score = None
        confidence = None
        if hasattr(self.model, "decision_function"):
            decision_score = float(self.model.decision_function(features)[0])
            # Platt scaling: sigmoid of decision_score
            prob_spam = 1.0 / (1.0 + np.exp(-decision_score))
            confidence = prob_spam if raw_pred == 1 else (1.0 - prob_spam)

        # Extract explainability: top contributing tokens
        explainability = self._extract_contributing_tokens(features, raw_pred)

        is_spam = (raw_pred == 1)

        return {
            "prediction": "spam" if is_spam else "ham",
            "is_spam": is_spam,
            "label": "Spam" if is_spam else "Legitimate",
            "decision_score": round(decision_score, 4) if decision_score is not None else None,
            "confidence": round(confidence * 100, 2) if confidence is not None else None,
            "confidence_decimal": round(confidence, 4) if confidence is not None else None,
            "message": "🚨 Suspicious / Spam characteristics detected." if is_spam else "✅ Legitimate / Safe message characteristics detected.",
            "risk_level": "High" if (is_spam and confidence and confidence > 75) else ("Moderate" if is_spam else "Low"),
            "char_count": len(combined_text),
            "word_count": len(combined_text.split()),
            "top_tokens": explainability,
            "disclaimer": "Predictions are generated by a machine learning model and may occasionally misclassify messages. Never rely solely on automated filters for critical security decisions."
        }

    def _extract_contributing_tokens(self, feature_vector, prediction):
        """Finds tokens in the input that most influenced the classification."""
        try:
            feature_names = self.vectorizer.get_feature_names_out()
            coef = self.model.coef_[0]
            non_zeros = feature_vector.nonzero()[1]

            contributions = []
            for idx in non_zeros:
                weight = float(feature_vector[0, idx] * coef[idx])
                word = feature_names[idx]
                contributions.append({
                    "token": word,
                    "weight": round(weight, 4),
                    "impact": "spam" if weight > 0 else "ham"
                })

            # Sort by absolute weight descending
            contributions.sort(key=lambda x: abs(x["weight"]), reverse=True)
            return contributions[:8]
        except Exception:
            return []

    def get_dataset_stats(self):
        """Returns statistics on the underlying training dataset."""
        if not os.path.exists(self.dataset_path):
            return {"error": "Dataset file not found"}

        total = 0
        ham_count = 0
        spam_count = 0
        ham_lengths = []
        spam_lengths = []

        with open(self.dataset_path, "r", encoding="latin-1") as f:
            reader = csv.reader(f, delimiter="\t")
            for row in reader:
                if len(row) >= 2:
                    total += 1
                    label = row[0].strip().lower()
                    length = len(row[1])
                    if label == "spam":
                        spam_count += 1
                        spam_lengths.append(length)
                    else:
                        ham_count += 1
                        ham_lengths.append(length)

        return {
            "total_records": total,
            "ham_count": ham_count,
            "spam_count": spam_count,
            "spam_percentage": round((spam_count / total) * 100, 2) if total else 0,
            "ham_percentage": round((ham_count / total) * 100, 2) if total else 0,
            "avg_ham_length": round(float(np.mean(ham_lengths)), 1) if ham_lengths else 0,
            "avg_spam_length": round(float(np.mean(spam_lengths)), 1) if spam_lengths else 0
        }

    def get_health(self):
        return {
            "status": "healthy" if self.is_loaded else "unhealthy",
            "model_loaded": self.is_loaded,
            "load_error": self.load_error,
            "metadata": self.model_metadata
        }

# Global singleton instance
model_service = ModelService()

