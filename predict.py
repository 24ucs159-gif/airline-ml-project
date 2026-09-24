"""
Root entrypoint for running test predictions or interactive CLI predictions.
Usage:
    python predict.py
"""

from src.predict import Predictor

if __name__ == "__main__":
    predictor = Predictor()
    if not predictor.is_loaded:
        print("Model is not trained yet. Run 'python train_model.py' first.")
    else:
        sample_input = {
            "Customer Type": "Loyal Customer",
            "Age": 38,
            "Type of Travel": "Business travel",
            "Class": "Business",
            "Flight Distance": 2100,
            "Seat comfort": 5,
            "Departure/Arrival time convenient": 4,
            "Food and drink": 4,
            "Gate location": 3,
            "Inflight wifi service": 4,
            "Inflight entertainment": 5,
            "Online support": 4,
            "Ease of Online booking": 4,
            "On-board service": 5,
            "Leg room service": 5,
            "Baggage handling": 5,
            "Checkin service": 5,
            "Cleanliness": 5,
            "Online boarding": 4,
            "Departure Delay in Minutes": 0,
            "Arrival Delay in Minutes": 0.0
        }
        res = predictor.predict(sample_input)
        print("Sample Prediction Result:")
        print(f"Predicted Class: {res['prediction']}")
        if "confidence" in res:
            print(f"Confidence: {res['confidence']}%")
        if "probabilities" in res:
            print(f"Probabilities: {res['probabilities']}")
