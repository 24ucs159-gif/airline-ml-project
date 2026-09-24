"""
Prediction and Inference Module
Loads trained Random Forest model and preprocessing pipeline,
validates user input, executes inference, and formats results.
"""

import os
import json
import logging
import joblib
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class Predictor:
    """
    Handles model inference for real-time predictions.
    """

    def __init__(self, models_dir="models"):
        self.models_dir = models_dir
        self.model = None
        self.pipeline = None
        self.metadata = None
        self.is_loaded = False
        self.load_artifacts()

    def load_artifacts(self):
        """
        Loads saved model, preprocessor, and metadata.
        """
        model_path = os.path.join(self.models_dir, "random_forest_model.pkl")
        preprocessor_path = os.path.join(self.models_dir, "preprocessor.pkl")
        metadata_path = os.path.join(self.models_dir, "model_metadata.json")

        if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
            logger.warning("Model artifacts not found. Please run training first.")
            self.is_loaded = False
            return False

        try:
            self.model = joblib.load(model_path)
            self.pipeline = joblib.load(preprocessor_path)
            if os.path.exists(metadata_path):
                with open(metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            self.is_loaded = True
            logger.info("Predictor artifacts successfully loaded.")
            return True
        except Exception as e:
            logger.error(f"Error loading model artifacts: {e}")
            self.is_loaded = False
            raise e

    def predict(self, input_data):
        """
        Predicts target for input_data (dict or DataFrame).
        Returns a dictionary with prediction, probabilities, and confidence.
        """
        if not self.is_loaded:
            if not self.load_artifacts():
                raise RuntimeError("Models are not trained or loaded yet. Run train_model.py first.")

        # Convert dict to DataFrame if necessary
        if isinstance(input_data, dict):
            df_input = pd.DataFrame([input_data])
        elif isinstance(input_data, pd.DataFrame):
            df_input = input_data.copy()
        else:
            raise ValueError("input_data must be a dict or pandas DataFrame")

        # Validate that required features are present
        expected_features = self.pipeline.feature_names_in
        missing_features = [f for f in expected_features if f not in df_input.columns]
        if missing_features:
            raise ValueError(f"Input is missing required features: {missing_features}")

        # Ensure correct column ordering
        df_input = df_input[expected_features]

        # Preprocess features
        try:
            transformed = self.pipeline.transform(df_input)
        except Exception as e:
            raise ValueError(f"Data preprocessing failed during inference: {e}")

        # Execute prediction
        raw_pred = self.model.predict(transformed)

        result = {
            "task_type": self.pipeline.task_type,
            "raw_prediction": raw_pred[0]
        }

        if self.pipeline.task_type == "classification":
            predicted_index = int(raw_pred[0])
            class_label = predicted_index
            if self.pipeline.target_encoder:
                class_label = str(self.pipeline.target_encoder.inverse_transform([predicted_index])[0])
            result["prediction"] = class_label

            # Probabilities if available
            if hasattr(self.model, "predict_proba"):
                probs = self.model.predict_proba(transformed)[0]
                classes = [str(c) for c in self.pipeline.target_encoder.classes_] if self.pipeline.target_encoder else [f"Class_{i}" for i in range(len(probs))]
                prob_dict = {cls: float(round(p, 4)) for cls, p in zip(classes, probs)}
                result["probabilities"] = prob_dict
                result["confidence"] = float(round(max(probs) * 100, 2))
        else:
            result["prediction"] = float(round(raw_pred[0], 4))

        return result


def predict_single(input_dict, models_dir="models"):
    """
    Convenience wrapper to run a single prediction.
    """
    predictor = Predictor(models_dir=models_dir)
    return predictor.predict(input_dict)
