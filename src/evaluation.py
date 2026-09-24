"""
Model Evaluation and Metrics Module
Supports comprehensive evaluation for both Classification and Regression models,
including metrics calculation, confusion matrix, and feature importance extraction.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


def evaluate_classification(model, X_test, y_test, class_names=None):
    """
    Evaluates a classification model on test data.
    Returns dictionary with all metrics, confusion matrix, and classification report.
    """
    y_pred = model.predict(X_test)
    
    accuracy = float(accuracy_score(y_test, y_pred))
    precision_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    recall_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    
    precision_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    recall_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))

    cm = confusion_matrix(y_test, y_pred).tolist()
    
    target_names = [str(c) for c in class_names] if class_names is not None else None
    report_dict = classification_report(y_test, y_pred, target_names=target_names, output_dict=True, zero_division=0)
    report_text = classification_report(y_test, y_pred, target_names=target_names, zero_division=0)

    # ROC AUC calculation if probabilities are available
    roc_auc = None
    try:
        if hasattr(model, "predict_proba"):
            y_proba = model.predict_proba(X_test)
            if y_proba.shape[1] == 2:
                roc_auc = float(roc_auc_score(y_test, y_proba[:, 1]))
            else:
                roc_auc = float(roc_auc_score(y_test, y_proba, multi_class="ovr"))
    except Exception:
        pass

    results = {
        "task_type": "classification",
        "accuracy": accuracy,
        "precision_weighted": precision_weighted,
        "recall_weighted": recall_weighted,
        "f1_weighted": f1_weighted,
        "precision_macro": precision_macro,
        "recall_macro": recall_macro,
        "f1_macro": f1_macro,
        "roc_auc": roc_auc,
        "confusion_matrix": cm,
        "classification_report_dict": report_dict,
        "classification_report_text": report_text,
        "classes": target_names
    }
    return results


def evaluate_regression(model, X_test, y_test):
    """
    Evaluates a regression model on test data.
    Returns MAE, MSE, RMSE, and R2 score.
    """
    y_pred = model.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))

    results = {
        "task_type": "regression",
        "mae": mae,
        "mse": mse,
        "rmse": rmse,
        "r2_score": r2
    }
    return results


def extract_feature_importance(model, feature_names=None, top_n=20):
    """
    Extracts feature importances from trained Random Forest model.
    """
    if not hasattr(model, "feature_importances_"):
        return []

    importances = model.feature_importances_
    if feature_names is None or len(feature_names) != len(importances):
        feature_names = [f"Feature_{i}" for i in range(len(importances))]

    paired = [{"feature": name, "importance": float(imp)} for name, imp in zip(feature_names, importances)]
    paired.sort(key=lambda x: x["importance"], reverse=True)

    return paired[:top_n]
