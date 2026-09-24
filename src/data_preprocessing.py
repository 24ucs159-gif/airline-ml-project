"""
Data Preprocessing Pipeline for Machine Learning
Supports auto-detection of datasets (.csv, .xlsx, .json),
automatic target and feature classification, missing value handling,
duplicate removal, encoding, scaling, and train/test splitting.
"""

import os
import glob
import json
import logging
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def locate_dataset(search_dirs=None):
    """
    Automatically locate a dataset file (.csv, .xlsx, .json) in given directories.
    Defaults to current directory and ./data directory.
    """
    if search_dirs is None:
        search_dirs = [".", "./data", "../data", ".."]

    supported_extensions = ["*.csv", "*.xlsx", "*.xls", "*.json"]
    found_files = []

    for s_dir in search_dirs:
        if os.path.exists(s_dir):
            for ext in supported_extensions:
                found_files.extend(glob.glob(os.path.join(s_dir, ext)))

    # Filter out any temporary or checkpoint files
    valid_files = [
        f for f in found_files 
        if not os.path.basename(f).startswith("~$") 
        and not os.path.basename(f).startswith(".")
        and not "requirements" in os.path.basename(f).lower()
    ]

    if not valid_files:
        raise FileNotFoundError("No valid dataset (.csv, .xlsx, .json) found in project directory.")

    # Sort prioritizing Airline dataset or largest file
    valid_files.sort(key=lambda x: (
        0 if "airline" in os.path.basename(x).lower() else 1,
        -os.path.getsize(x)
    ))
    chosen_file = os.path.abspath(valid_files[0])
    logger.info(f"Dataset located at: {chosen_file}")
    return chosen_file


def load_dataset(file_path=None):
    """
    Loads dataset from file path into a pandas DataFrame.
    Supports CSV, Excel, and JSON.
    """
    if file_path is None:
        file_path = locate_dataset()

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file does not exist: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".csv":
        df = pd.read_csv(file_path)
    elif ext in [".xlsx", ".xls"]:
        df = pd.read_excel(file_path)
    elif ext == ".json":
        df = pd.read_json(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")

    if df.empty:
        raise ValueError(f"Dataset at {file_path} is empty.")

    logger.info(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns.")
    return df, file_path


def identify_target_column(df, explicit_target=None):
    """
    Automatically detects or verifies target column.
    """
    if explicit_target and explicit_target in df.columns:
        return explicit_target

    candidate_names = [
        "satisfaction", "target", "label", "class", "churn",
        "status", "outcome", "survived", "default", "price", "result"
    ]

    # Exact or lowercase match
    lower_map = {col.lower(): col for col in df.columns}
    for candidate in candidate_names:
        if candidate in lower_map:
            return lower_map[candidate]

    # Look for last column if object or small unique set
    last_col = df.columns[-1]
    if df[last_col].dtype == "object" or df[last_col].nunique() <= 10:
        return last_col

    # First column if object with few categories
    first_col = df.columns[0]
    if df[first_col].dtype == "object" and df[first_col].nunique() <= 10:
        return first_col

    return None


def analyze_dataset(df, target_col=None):
    """
    Comprehensive analysis of the dataset:
    - Shape (rows, cols)
    - Missing values
    - Duplicate count
    - Feature lists (numerical, categorical)
    - Target distribution / stats
    - Task type (classification vs regression)
    """
    total_rows, total_cols = df.shape
    duplicate_count = int(df.duplicated().sum())

    missing_series = df.isnull().sum()
    missing_dict = {col: int(count) for col, count in missing_series.items() if count > 0}
    missing_pct = {col: float(round(count / total_rows * 100, 2)) for col, count in missing_series.items() if count > 0}

    detected_target = identify_target_column(df, target_col)
    
    feature_cols = [c for c in df.columns if c != detected_target] if detected_target else list(df.columns)
    
    numerical_cols = []
    categorical_cols = []
    
    for c in feature_cols:
        if pd.api.types.is_numeric_dtype(df[c]):
            numerical_cols.append(c)
        else:
            categorical_cols.append(c)

    task_type = "classification"
    target_distribution = None
    target_stats = None

    if detected_target:
        y = df[detected_target].dropna()
        is_numeric = pd.api.types.is_numeric_dtype(y)
        unique_count = y.nunique()

        if is_numeric and unique_count > 20:
            task_type = "regression"
            target_stats = {
                "mean": float(y.mean()),
                "std": float(y.std()),
                "min": float(y.min()),
                "25%": float(y.quantile(0.25)),
                "50%": float(y.median()),
                "75%": float(y.quantile(0.75)),
                "max": float(y.max()),
            }
        else:
            task_type = "classification"
            target_distribution = {str(k): int(v) for k, v in y.value_counts().items()}

    summary = {
        "total_rows": total_rows,
        "total_cols": total_cols,
        "duplicate_count": duplicate_count,
        "missing_counts": missing_dict,
        "missing_percentages": missing_pct,
        "target_column": detected_target,
        "task_type": task_type,
        "numerical_columns": numerical_cols,
        "categorical_columns": categorical_cols,
        "target_distribution": target_distribution,
        "target_stats": target_stats,
    }

    return summary


class MLDataPipeline:
    """
    Handles preprocessing, train/test splitting, fitting transformer pipelines,
    and transforming raw data for training and inference.
    """

    def __init__(self, target_column=None, test_size=0.2, random_state=42):
        self.target_column = target_column
        self.test_size = test_size
        self.random_state = random_state
        self.preprocessor = None
        self.target_encoder = None
        self.numerical_cols = []
        self.categorical_cols = []
        self.task_type = "classification"
        self.feature_names_in = []
        self.transformed_feature_names = []
        self.class_mapping = None

    def prepare_data(self, df):
        """
        Cleans initial dataset:
        - Drops exact duplicates
        - Separates X and y
        - Identifies categorical vs numerical
        """
        # Remove duplicates
        df_clean = df.drop_duplicates().copy()

        if self.target_column is None:
            self.target_column = identify_target_column(df_clean)
            if not self.target_column:
                raise ValueError("Target column could not be automatically detected. Please specify target_column.")

        # Drop rows where target is missing
        df_clean = df_clean.dropna(subset=[self.target_column])

        y = df_clean[self.target_column]
        X = df_clean.drop(columns=[self.target_column])

        self.feature_names_in = list(X.columns)

        # Determine task type
        if pd.api.types.is_numeric_dtype(y) and y.nunique() > 20:
            self.task_type = "regression"
        else:
            self.task_type = "classification"

        self.numerical_cols = [c for c in X.columns if pd.api.types.is_numeric_dtype(X[c])]
        self.categorical_cols = [c for c in X.columns if not pd.api.types.is_numeric_dtype(X[c])]

        # Target encoding if classification
        if self.task_type == "classification":
            self.target_encoder = LabelEncoder()
            y_encoded = self.target_encoder.fit_transform(y.astype(str))
            self.class_mapping = {
                str(cls): int(idx) for idx, cls in enumerate(self.target_encoder.classes_)
            }
        else:
            y_encoded = y.values

        # Split train/test (stratify if classification and smallest class >= 2)
        stratify_arg = None
        if self.task_type == "classification":
            counts = pd.Series(y_encoded).value_counts()
            if (counts >= 2).all():
                stratify_arg = y_encoded

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y_encoded,
            test_size=self.test_size,
            random_state=self.random_state,
            stratify=stratify_arg
        )

        return X_train, X_test, y_train, y_test

    def build_and_fit_preprocessor(self, X_train):
        """
        Creates ColumnTransformer for numerical and categorical features.
        Fits only on X_train to prevent data leakage.
        """
        transformers = []

        if self.numerical_cols:
            num_pipeline = Pipeline([
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler())
            ])
            transformers.append(("num", num_pipeline, self.numerical_cols))

        if self.categorical_cols:
            cat_pipeline = Pipeline([
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
            ])
            transformers.append(("cat", cat_pipeline, self.categorical_cols))

        self.preprocessor = ColumnTransformer(transformers=transformers, remainder="drop")
        self.preprocessor.fit(X_train)

        # Retrieve feature names after transformation
        transformed_names = []
        if self.numerical_cols:
            transformed_names.extend(self.numerical_cols)

        if self.categorical_cols:
            try:
                cat_encoder = self.preprocessor.named_transformers_["cat"].named_steps["onehot"]
                cat_names = cat_encoder.get_feature_names_out(self.categorical_cols)
                transformed_names.extend(list(cat_names))
            except Exception:
                pass

        self.transformed_feature_names = transformed_names
        return self.preprocessor

    def transform(self, X):
        """
        Transforms input DataFrame using fitted preprocessor.
        """
        if self.preprocessor is None:
            raise RuntimeError("Preprocessor has not been fitted yet.")
        return self.preprocessor.transform(X)

    def save(self, filepath="models/preprocessor.pkl"):
        """
        Saves pipeline and metadata to disk.
        """
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self, filepath)
        logger.info(f"Preprocessor saved to {filepath}")

    @classmethod
    def load(cls, filepath="models/preprocessor.pkl"):
        """
        Loads preprocessor from disk.
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Preprocessor file not found at {filepath}")
        return joblib.load(filepath)
