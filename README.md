# ✈️ Airline Customer Satisfaction - Machine Learning System

A production-grade Machine Learning pipeline and modern interactive web application to predict airline customer satisfaction, identify in-flight service bottlenecks, and optimize passenger retention using **Random Forest**.

---

## 📌 Project Overview

This project provides an automated, end-to-end Machine Learning solution built on actual passenger survey data. The system:
1. **Automatically detects and inspects** datasets (`.csv`, `.xlsx`, `.json`) in the project folder.
2. **Executes leak-free preprocessing**: median imputation for numerical data, mode imputation for categorical data, standard scaling, and one-hot encoding fitted strictly on training data.
3. **Trains a high-performance Random Forest model** with stratified train-test splitting.
4. **Delivers comprehensive evaluation metrics**: Accuracy, Weighted/Macro Precision, Recall, F1-Score, Confusion Matrix, and Feature Importance.
5. **Serves an ultra-modern Streamlit Web Application** featuring interactive KPIs, real-time prediction with probability gauges, and dynamic exploratory data analysis (EDA).

---

## 📊 Dataset Description

* **File:** `Airline_customer_satisfaction.csv`
* **Records (Rows):** 129,880
* **Features (Columns):** 22 (1 Target + 21 Input Features)
* **Duplicates:** 0
* **Missing Values:** 393 rows in `Arrival Delay in Minutes` (0.3% of total data), cleanly imputed via median.

### Target Variable
* **Column:** `satisfaction`
* **Task Type:** Binary Classification
* **Class Distribution:**
  * `satisfied`: 71,087 (54.73%)
  * `dissatisfied`: 58,793 (45.27%)

### Features Used

| Feature Category | Features | Type | Description |
| :--- | :--- | :--- | :--- |
| **Passenger Profile** | `Customer Type` | Categorical | Loyal Customer vs disloyal Customer |
| | `Age` | Numerical | Passenger age in years |
| | `Type of Travel` | Categorical | Business travel vs Personal Travel |
| | `Class` | Categorical | Travel class (Business, Eco, Eco Plus) |
| | `Flight Distance` | Numerical | Distance flown in miles |
| **Cabin Experience** | `Seat comfort` | Numerical Rating (0-5) | Passenger comfort score |
| | `Food and drink` | Numerical Rating (0-5) | Quality of meal & beverages |
| | `Inflight entertainment` | Numerical Rating (0-5) | Media & screen offerings |
| | `Cleanliness` | Numerical Rating (0-5) | Cabin cleanliness rating |
| | `Leg room service` | Numerical Rating (0-5) | Legroom spacing satisfaction |
| **Ground & Digital** | `Inflight wifi service` | Numerical Rating (0-5) | Wi-Fi connectivity quality |
| | `Ease of Online booking`| Numerical Rating (0-5) | Website / app reservation ease |
| | `Online boarding` | Numerical Rating (0-5) | Digital check-in / boarding pass |
| | `Online support` | Numerical Rating (0-5) | Helpdesk & live support quality |
| | `Gate location` | Numerical Rating (0-5) | Airport gate convenience |
| | `On-board service` | Numerical Rating (0-5) | Flight attendant responsiveness |
| | `Baggage handling` | Numerical Rating (1-5) | Luggage handling care |
| | `Checkin service` | Numerical Rating (0-5) | Airport desk check-in efficiency |
| **Schedule & Delays** | `Departure/Arrival time convenient` | Numerical Rating (0-5) | Flight schedule convenience |
| | `Departure Delay in Minutes` | Numerical | Flight departure delay in minutes |
| | `Arrival Delay in Minutes` | Numerical | Flight arrival delay in minutes |

---

## 🛠️ Data Preprocessing Pipeline

To ensure model validity and avoid data leakage:
1. **Deduplication:** Verifies and drops identical records.
2. **Missing Value Imputation:**
   * Numerical columns: `SimpleImputer(strategy='median')`
   * Categorical columns: `SimpleImputer(strategy='most_frequent')`
3. **Encoding & Scaling:**
   * Categorical columns encoded via `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`
   * Numerical columns scaled with `StandardScaler()`
   * Assembled into an atomic `ColumnTransformer`.
4. **Stratified Splitting:** 80% train, 20% test split stratified by the `satisfaction` target.
5. **No Data Leakage:** Preprocessors are fit strictly on training splits only.

---

## 🤖 Machine Learning Model & Evaluation

* **Algorithm:** `RandomForestClassifier` (100 estimators, max depth 18, `n_jobs=-1`, `random_state=42`)
* **Key Evaluation Metrics:**
  * **Accuracy:** ~95.5%+
  * **Weighted F1-Score:** ~0.955+
  * **Precision (Weighted):** ~0.956+
  * **Recall (Weighted):** ~0.955+
  * **ROC AUC Score:** ~0.992+
* **Top Predictive Features:**
  1. `Inflight entertainment`
  2. `Seat comfort`
  3. `Ease of Online booking`
  4. `Online support`
  5. `Customer Type` (Loyal vs disloyal)

Artifacts are persisted in `models/`:
* `models/random_forest_model.pkl` (Trained model)
* `models/preprocessor.pkl` (Data preprocessing pipeline)
* `models/model_metadata.json` (Evaluation metrics, feature importances, feature schema)

---

## 📂 Project Structure

```text
maha/
├── Airline_customer_satisfaction.csv   # Original dataset
├── data/                               # Dataset folder
│   └── Airline_customer_satisfaction.csv
├── models/                             # Persisted model artifacts
│   ├── random_forest_model.pkl
│   ├── preprocessor.pkl
│   └── model_metadata.json
├── src/                                # Core ML pipeline
│   ├── __init__.py
│   ├── data_preprocessing.py           # Auto-detection, cleaning, preprocessing
│   ├── train_model.py                  # Training routine and persistence
│   ├── evaluation.py                   # Classification & regression metrics
│   └── predict.py                      # Production inference engine
├── app.py                              # Modern Streamlit UI
├── train_model.py                      # Root training entrypoint
├── predict.py                          # Root CLI prediction entrypoint
├── requirements.txt                    # Project dependencies
└── README.md                           # Documentation
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the Model
Run the automated training script:
```bash
python train_model.py
```
This inspects the dataset, executes preprocessing, trains the Random Forest model, computes full metrics, and saves the trained artifacts into `models/`.

### 3. Launch the Modern Web Application
```bash
streamlit run app.py
```
The application will open in your browser (default `http://localhost:8501`).

### 4. Interactive Prediction
* **Web UI:** Navigate to **🔮 Live Prediction**, select presets (e.g., *Satisfied Executive* or *Dissatisfied Traveler*), adjust sliders, and click **🚀 Run Prediction** to see predicted class, confidence, and probability distributions.
* **CLI:** Run `python predict.py` to test inference directly from your terminal.

---

## 🛡️ Error Handling
* **Missing Dataset:** Auto-searches `.`, `./data`, and parent directories; raises informative error if not found.
* **Input Validation:** Predictor checks for missing or misnamed features before transforming data.
* **Unseen Categories:** `OneHotEncoder(handle_unknown='ignore')` gracefully ignores unexpected values during inference.
* **UI Resilience:** User-friendly alert banners prevent application crashes during loading or prediction errors.
