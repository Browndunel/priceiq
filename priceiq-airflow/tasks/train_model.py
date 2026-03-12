"""
train_model.py
Réentraîne le RandomForestRegressor sur les données fraîches.
Sauvegarde le modèle + les métriques dans /models.
"""

import json
import pickle
import polars as pl
from pathlib import Path
from datetime import date
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

HIST_PATH    = Path("/opt/airflow/data/priceiq_dataset_cleaned.csv")
MODEL_PATH   = Path("/opt/airflow/models/model.pkl")
METRICS_PATH = Path("/opt/airflow/models/metrics.json")

FEATURES = ["price", "day_of_week", "day_of_month", "product_id"]
TARGET   = "future_price"


def _build_features(df: pl.DataFrame) -> pl.DataFrame:
    df = df.with_columns([
        pl.col("date").str.strptime(pl.Date, "%Y-%m-%d").alias("date_parsed"),
    ]).with_columns([
        pl.col("date_parsed").dt.weekday().alias("day_of_week"),
        pl.col("date_parsed").dt.day().alias("day_of_month"),
    ])

    df = df.sort(["product_id", "date"]).with_columns([
        pl.col("price").shift(-7).over("product_id").alias("future_price")
    ]).drop_nulls("future_price")

    return df


def train_model() -> None:
    df = pl.read_csv(HIST_PATH)
    df = _build_features(df)

    X = df.select(FEATURES).to_numpy()
    y = df.select(TARGET).to_numpy().ravel()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    mae = mean_absolute_error(y_test, model.predict(X_test))

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    metrics = {
        "mae":           round(mae, 4),
        "trained_at":    date.today().isoformat(),
        "train_samples": len(X_train),
        "features":      FEATURES,
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2))
    print(f"[train_model] MAE={mae:.4f} — modèle sauvegardé → {MODEL_PATH}")


if __name__ == "__main__":
    train_model()
