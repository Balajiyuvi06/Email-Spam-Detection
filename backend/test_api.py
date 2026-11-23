import unittest
import json
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app

class BackendApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def test_01_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["model_loaded"])
        self.assertIn("classifier", data["model_info"])
        print("\n[PASS] Health endpoint test passed.")

    def test_02_predict_spam(self):
        payload = {
            "subject": "Winner notification",
            "text": "Congratulations! You have won a free prize. Click here now to claim your £1000 cash reward."
        }
        response = self.client.post("/api/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["prediction"], "spam")
        self.assertTrue(data["is_spam"])
        self.assertEqual(data["label"], "Spam")
        self.assertIsNotNone(data["confidence"])
        self.assertIsNotNone(data["decision_score"])
        self.assertGreater(data["decision_score"], 0)
        print(f"[PASS] Spam prediction test passed: score={data['decision_score']}, confidence={data['confidence']}%.")

    def test_03_predict_legitimate(self):
        payload = {
            "subject": "Meeting notes",
            "text": "Hi team, please find the attached notes from our project review meeting. See you tomorrow at 10 AM."
        }
        response = self.client.post("/api/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["prediction"], "ham")
        self.assertFalse(data["is_spam"])
        self.assertEqual(data["label"], "Legitimate")
        self.assertIsNotNone(data["confidence"])
        self.assertIsNotNone(data["decision_score"])
        self.assertLess(data["decision_score"], 0)
        print(f"[PASS] Legitimate prediction test passed: score={data['decision_score']}, confidence={data['confidence']}%.")

    def test_04_predict_empty_text(self):
        payload = {"text": "   ", "subject": ""}
        response = self.client.post("/api/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(response.status_code, 422)
        data = response.get_json()
        self.assertIn("error", data)
        print("[PASS] Empty input validation test passed.")

    def test_05_predict_invalid_json(self):
        response = self.client.post("/api/predict", data="invalid json string", content_type="text/plain")
        self.assertEqual(response.status_code, 400)
        print("[PASS] Invalid payload content-type test passed.")

    def test_06_predict_very_long_input(self):
        long_text = "Free gift! " * 6000 # 66,000 characters
        payload = {"text": long_text}
        response = self.client.post("/api/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertLessEqual(data["char_count"], 50000)
        print("[PASS] Long input clipping and security test passed.")

    def test_07_model_info(self):
        response = self.client.get("/api/model-info")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["model_loaded"])
        self.assertEqual(data["metadata"]["classifier"], "LinearSVC")
        print("[PASS] Model info endpoint test passed.")

    def test_08_dataset_stats(self):
        response = self.client.get("/api/dataset-stats")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["total_records"], 5572)
        self.assertEqual(data["ham_count"], 4825)
        self.assertEqual(data["spam_count"], 747)
        print(f"[PASS] Dataset stats test passed: {data['total_records']} total, {data['spam_count']} spam.")

    def test_09_samples_endpoint(self):
        response = self.client.get("/api/samples")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("spam", data)
        self.assertIn("legitimate", data)
        self.assertGreaterEqual(len(data["spam"]), 3)
        self.assertGreaterEqual(len(data["legitimate"]), 3)
        print("[PASS] Samples endpoint test passed.")

if __name__ == "__main__":
    unittest.main()

