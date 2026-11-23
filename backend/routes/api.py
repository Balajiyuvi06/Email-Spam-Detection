from flask import Blueprint, request, jsonify
from services.model_service import model_service
import time

api_bp = Blueprint("api", __name__)

@api_bp.route("/health", methods=["GET"])
def health():
    """Health check endpoint providing server and ML model status."""
    health_data = model_service.get_health()
    status_code = 200 if health_data["status"] == "healthy" else 503
    return jsonify({
        "status": health_data["status"],
        "timestamp": time.time(),
        "model_loaded": health_data["model_loaded"],
        "error": health_data["load_error"],
        "model_info": health_data["metadata"]
    }), status_code

@api_bp.route("/predict", methods=["POST"])
def predict():
    """Predicts whether an incoming email/message text is spam or legitimate."""
    if not request.is_json:
        return jsonify({"error": "Request must be a JSON payload with Content-Type: application/json"}), 400

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided."}), 400

    text = data.get("text", "")
    subject = data.get("subject", "")

    if not isinstance(text, str):
        return jsonify({"error": "The 'text' field must be a string."}), 400

    if not text.strip() and not (isinstance(subject, str) and subject.strip()):
        return jsonify({"error": "Input text cannot be empty. Please provide an email body or text message."}), 422

    try:
        start_time = time.time()
        result = model_service.predict(text=text, subject=subject)
        inference_time_ms = round((time.time() - start_time) * 1000, 2)
        result["inference_time_ms"] = inference_time_ms
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 422
    except RuntimeError as re:
        return jsonify({"error": f"Model inference error: {str(re)}"}), 500
    except Exception as e:
        return jsonify({"error": "An internal error occurred during prediction processing."}), 500

@api_bp.route("/model-info", methods=["GET"])
def model_info():
    """Returns detailed information about the ML model, vectorizer, and pipeline."""
    health_data = model_service.get_health()
    return jsonify({
        "model_loaded": health_data["model_loaded"],
        "metadata": health_data["metadata"]
    }), 200

@api_bp.route("/dataset-stats", methods=["GET"])
def dataset_stats():
    """Returns statistics derived from the actual spam.csv training dataset."""
    stats = model_service.get_dataset_stats()
    return jsonify(stats), 200

@api_bp.route("/samples", methods=["GET"])
def samples():
    """Provides verified test samples representing spam and legitimate messages."""
    return jsonify({
        "spam": [
            {
                "id": "spam-1",
                "subject": "URGENT: Reward Notification",
                "text": "Congratulations! You have won a free prize. Click here now to claim your $1000 gift card.",
                "category": "Lottery / Prize"
            },
            {
                "id": "spam-2",
                "subject": "Exclusive Limited Time Offer",
                "text": "Claim your reward today. Limited time offer! Call 08002986030 now to receive your update.",
                "category": "Promotional"
            },
            {
                "id": "spam-3",
                "subject": "Free Entry Winner",
                "text": "WINNER!! As a valued network customer you have been selected to receive a £900 prize reward! To claim call 09061701461. Claim code KL341.",
                "category": "Urgent Claim"
            }
        ],
        "legitimate": [
            {
                "id": "ham-1",
                "subject": "Weekly Team Sync Notes",
                "text": "Hi team, please find the meeting notes attached from today's discussion. Let me know if you have feedback.",
                "category": "Work / Collaboration"
            },
            {
                "id": "ham-2",
                "subject": "Appointment Confirmation",
                "text": "Your appointment is scheduled for tomorrow at 10 AM. Please arrive 10 minutes early with your photo ID.",
                "category": "Notification"
            },
            {
                "id": "ham-3",
                "subject": "Project Status Update Request",
                "text": "Can you send me the latest project report when you have time? We need to review the Q3 milestones before Friday.",
                "category": "Direct Request"
            }
        ]
    }), 200

