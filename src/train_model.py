"""
Model Training Script for Random Forest
Automatically detects Classification vs Regression,
fits preprocessing pipeline on train set only, trains model,
evaluates on test set, and persists artifacts to models/.
"""

import os
import sys
import json
import logging
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

# Ensure local src imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.data_preprocessing import MLDataPipeline, load_dataset, analyze_dataset
from src.evaluation import evaluate_classification, evaluate_regression, extract_feature_importance

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def train(dataset_path=None, target_col=None, models_dir="models", n_estimators=100, max_depth=18):
    """
    Complete end-to-end training routine:
    1. Loads dataset
    2. Runs analysis
    3. Builds and fits preprocessing pipeline
    4. Trains Random Forest
    5. Evaluates model on test data
    6. Saves all models and metadata
    """
    logger.info("Step 1: Loading dataset...")
    df, actual_path = load_dataset(dataset_path)

    logger.info("Step 2: Analyzing dataset...")
    analysis = analyze_dataset(df, target_col=target_col)
    logger.info(f"Dataset summary: {analysis['total_rows']} rows, {analysis['total_cols']} columns")
    logger.info(f"Target column: '{analysis['target_column']}' | Task type: {analysis['task_type']}")

    logger.info("Step 3: Preprocessing and train/test split...")
    pipeline = MLDataPipeline(target_column=analysis["target_column"], test_size=0.2, random_state=42)
    X_train, X_test, y_train, y_test = pipeline.prepare_data(df)

    # Fit preprocessor strictly on training data
    pipeline.build_and_fit_preprocessor(X_train)
    X_train_trans = pipeline.transform(X_train)
    X_test_trans = pipeline.transform(X_test)

    logger.info(f"Transformed feature space shape: {X_train_trans.shape}")

    logger.info("Step 4: Training Random Forest model...")
    if pipeline.task_type == "classification":
        model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
    else:
        model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )

    model.fit(X_train_trans, y_train)
    logger.info("Model training completed successfully.")

    logger.info("Step 5: Evaluating model on test set...")
    if pipeline.task_type == "classification":
        classes = list(pipeline.target_encoder.classes_) if pipeline.target_encoder else None
        metrics = evaluate_classification(model, X_test_trans, y_test, class_names=classes)
        logger.info(f"Test Accuracy: {metrics['accuracy'] * 100:.2f}% | Weighted F1: {metrics['f1_weighted']:.4f}")
    else:
        metrics = evaluate_regression(model, X_test_trans, y_test)
        logger.info(f"Test RMSE: {metrics['rmse']:.4f} | R2 Score: {metrics['r2_score']:.4f}")

    # Extract feature importances
    feature_names = pipeline.transformed_feature_names
    feat_importance = extract_feature_importance(model, feature_names=feature_names, top_n=25)

    logger.info("Step 6: Saving model and artifacts...")
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "random_forest_model.pkl")
    preprocessor_path = os.path.join(models_dir, "preprocessor.pkl")
    metadata_path = os.path.join(models_dir, "model_metadata.json")

    joblib.dump(model, model_path)
    pipeline.save(preprocessor_path)

    # Collect column metadata for dynamic UI inputs
    column_metadata = {}
    for col in pipeline.feature_names_in:
        is_num = col in pipeline.numerical_cols
        if is_num:
            col_series = df[col].dropna()
            column_metadata[col] = {
                "type": "numerical",
                "min": float(col_series.min()),
                "max": float(col_series.max()),
                "mean": float(col_series.mean()),
                "median": float(col_series.median()),
                "is_integer": bool((col_series % 1 == 0).all() and col_series.nunique() <= 10)
            }
        else:
            categories = sorted([str(c) for c in df[col].dropna().unique().tolist()])
            column_metadata[col] = {
                "type": "categorical",
                "categories": categories,
                "default": categories[0] if categories else ""
            }

    metadata = {
        "dataset_path": actual_path,
        "dataset_analysis": analysis,
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "metrics": metrics,
        "feature_importances": feat_importance,
        "task_type": pipeline.task_type,
        "feature_names_in": pipeline.feature_names_in,
        "numerical_columns": pipeline.numerical_cols,
        "categorical_columns": pipeline.categorical_cols,
        "column_metadata": column_metadata,
        "class_mapping": pipeline.class_mapping,
        "model_params": {
            "algorithm": "Random Forest " + ("Classifier" if pipeline.task_type == "classification" else "Regressor"),
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "random_state": 42
        }
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Artifacts successfully saved to '{models_dir}/'")
    return {
        "model": model,
        "pipeline": pipeline,
        "metrics": metrics,
        "metadata": metadata
    }


if __name__ == "__main__":
    train()
