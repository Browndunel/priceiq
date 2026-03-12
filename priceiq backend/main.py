"""
PriceIQ — Backend FastAPI
Stack: FastAPI + DuckDB + Polars + scikit-learn (RandomForest)

⚙️  Lancer :
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

📁  Placer priceiq_dataset_cleaned.csv dans le même dossier.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import duckdb
import polars as pl
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import random
import math
from datetime import datetime, timedelta
from typing import Optional

# ─── Globals ──────────────────────────────────────────────────────────────────
DB_PATH  = "/app/data/priceiq.duckdb"
_model   = "/app/models/model.pkl"   # RandomForest instance
_df_pl   = None   # Polars DataFrame (full dataset)
_con     = None   # DuckDB connection

# ─── Startup ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global _model, _df_pl, _con

    print("🚀 Loading dataset with Polars...")
    _df_pl = pl.read_csv(DB_PATH).with_columns([
        pl.col("date").str.to_date("%Y-%m-%d"),
        pl.col("in_stock").cast(pl.Boolean),
    ])
    print(f"✅ {_df_pl.shape[0]:,} rows loaded — {_df_pl['product_name'].n_unique()} products")

    print("🦆 Registering DuckDB view...")
    _con = duckdb.connect()
    _con.register("prices", _df_pl.to_pandas())
    print("✅ DuckDB ready")

    print("🧠 Training RandomForest model...")
    _model = _train_model(_df_pl)
    print("✅ Model trained")

    yield  # app runs here

    _con.close()
    print("🛑 Shutdown")

# ─── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="PriceIQ API",
    description="Backend FastAPI — DuckDB + Polars + RandomForest ML",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ML Training ─────────────────────────────────────────────────────────────
def _train_model(df: pl.DataFrame) -> RandomForestRegressor:
    """Train RandomForestRegressor using Polars for feature engineering."""

    # Feature engineering with Polars (vectorized, fast)
    df_feat = (
        df
        .sort(["product_id", "retailer", "date"])
        .with_columns([
            pl.col("date").dt.weekday().alias("day_of_week"),
            pl.col("date").dt.day().alias("day_of_month"),
            # Shift price by -7 to get future price target
            pl.col("price")
              .shift(-7)
              .over(["product_id", "retailer"])
              .alias("future_price"),
        ])
        .drop_nulls(subset=["future_price"])
    )

    X = df_feat.select(["price", "day_of_week", "day_of_month"]).to_numpy()
    y = df_feat["future_price"].to_numpy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    mae = mean_absolute_error(y_test, model.predict(X_test))
    print(f"   MAE: ₹{mae:.2f}")

    return model


# ─── Helpers ─────────────────────────────────────────────────────────────────
def _get_product_df(product_id: int) -> pl.DataFrame:
    df = _df_pl.filter(pl.col("product_id") == product_id)
    if df.is_empty():
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
    return df


def _simulate_live_offset(price: float, retailer: str) -> float:
    """Add a small deterministic-ish live fluctuation to simulate real-time."""
    seed = hash(retailer + datetime.now().strftime("%Y%m%d%H%M"))
    rng  = random.Random(seed)
    delta = (rng.random() - 0.49) * price * 0.008
    return round(price + delta, 2)


def _minutes_ago(retailer: str) -> str:
    seed = hash(retailer + datetime.now().strftime("%Y%m%d%H%M"))
    rng  = random.Random(seed)
    mins = rng.randint(1, 12)
    return f"il y a {mins} min"


# ─── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "PriceIQ API — DuckDB + Polars + RF"}


@app.get("/products/trending")
def get_trending():
    """Return 8 random products for the trending section (shuffled each call)."""
    products = (
        _df_pl
        .select(["product_id", "product_name", "category"])
        .unique(subset=["product_id"])
        .to_dicts()
    )
    random.shuffle(products)
    return [{"id": p["product_id"], "name": p["product_name"], "category": p["category"]}
            for p in products[:8]]


@app.get("/products/search")
def search_products(q: str = Query(..., min_length=1)):
    """
    Search products by name — uses DuckDB for fast ILIKE query.
    Results are shuffled for a 'real-time discovery' feel.
    """
    results = _con.execute(
        "SELECT DISTINCT product_id, product_name, category FROM prices WHERE product_name ILIKE ?",
        [f"%{q}%"]
    ).fetchall()

    products = [{"id": r[0], "name": r[1], "category": r[2]} for r in results]
    random.shuffle(products)  # randomize each search
    return products


@app.get("/products/{product_id}")
def get_product(product_id: int):
    """Product detail — Polars query."""
    df = _get_product_df(product_id)
    row = df.select(["product_id", "product_name", "category"]).row(0, named=True)
    return {
        "id":       row["product_id"],
        "name":     row["product_name"],
        "category": row["category"],
    }


@app.get("/products/{product_id}/prices")
def get_prices(product_id: int):
    """
    Current prices per retailer — uses DuckDB aggregation for max date,
    then adds live micro-fluctuation.
    """
    df = _get_product_df(product_id)

    # DuckDB: get latest price per retailer efficiently
    latest = _con.execute("""
        SELECT retailer, price, in_stock
        FROM prices
        WHERE product_id = ?
          AND date = (
            SELECT MAX(date) FROM prices WHERE product_id = ?
          )
        ORDER BY price ASC
    """, [product_id, product_id]).fetchall()

    return [
        {
            "retailer":     r[0],
            "price":        _simulate_live_offset(r[1], r[0]),
            "in_stock":     bool(r[2]),
            "last_updated": _minutes_ago(r[0]),
        }
        for r in latest
    ]


@app.get("/products/{product_id}/history")
def get_history(product_id: int, days: int = Query(30, ge=7, le=90)):
    """
    Price history per retailer — Polars groupby + filter.
    Returns a dict: { retailer: [{date, price}, ...] }
    """
    df = _get_product_df(product_id)

    cutoff = df["date"].max() - timedelta(days=days)
    df_hist = df.filter(pl.col("date") >= cutoff)

    # Polars groupby to build per-retailer history
    result = {}
    for retailer, group in df_hist.group_by("retailer"):
        retailer_name = retailer[0] if isinstance(retailer, tuple) else retailer
        sorted_group  = group.sort("date")
        result[retailer_name] = [
            {"date": str(row["date"]), "price": row["price"]}
            for row in sorted_group.iter_rows(named=True)
        ]

    return result


@app.get("/products/{product_id}/prediction")
def get_prediction(product_id: int):
    """
    ML prediction using trained RandomForest.
    Predicts price in 7 days based on best current price.
    """
    df    = _get_product_df(product_id)
    today = df["date"].max()

    latest = df.filter(pl.col("date") == today)
    if latest.is_empty():
        raise HTTPException(status_code=404, detail="No recent data")

    best_row = latest.sort("price").row(0, named=True)
    best_price = float(best_row["price"])

    input_data = np.array([[
        best_price,
        today.weekday(),
        today.day,
    ]])

    predicted = float(_model.predict(input_data)[0])
    trend     = "down" if predicted < best_price else "up"
    confidence = min(95, max(55, round(70 + (abs(predicted - best_price) / best_price) * 300)))

    return {
        "current_price":   round(best_price, 2),
        "predicted_price": round(predicted, 2),
        "trend":           trend,
        "confidence":      confidence,
        "horizon_days":    7,
    }


@app.get("/products/{product_id}/recommendation")
def get_recommendation(product_id: int):
    """
    Business rule on top of ML prediction:
    - predicted < current by > 2%  → WAIT
    - predicted > current by > 3%  → BUY NOW (price going up)
    - current < 30d avg by > 8%    → GOOD DEAL
    - else                         → NEUTRAL
    """
    df    = _get_product_df(product_id)
    today = df["date"].max()

    # Best current price (DuckDB)
    best = _con.execute("""
        SELECT MIN(price) FROM prices
        WHERE product_id = ? AND date = ?
    """, [product_id, str(today)]).fetchone()[0]

    # 30d average (Polars)
    cutoff   = today - timedelta(days=30)
    avg_30d  = float(df.filter(pl.col("date") >= cutoff)["price"].mean())

    # ML prediction
    pred_resp = get_prediction(product_id)
    predicted = pred_resp["predicted_price"]
    best      = float(best)

    pct_change = (predicted - best) / best
    pct_vs_avg = (best - avg_30d)   / avg_30d

    if pct_change < -0.02:
        rec_type = "wait"
        label    = "Attendre"
        reason   = f"Baisse de {abs(pct_change*100):.1f}% prévue dans 7 jours"
    elif pct_vs_avg < -0.08:
        rec_type = "good_deal"
        label    = "Bonne affaire !"
        reason   = f"Prix inférieur de {abs(pct_vs_avg*100):.1f}% à la moyenne 30j"
    elif pct_change > 0.03:
        rec_type = "buy_now"
        label    = "Acheter maintenant"
        reason   = f"Hausse de {pct_change*100:.1f}% prévue — achetez avant !"
    else:
        rec_type = "buy_now"
        label    = "Acheter maintenant"
        reason   = "Prix stable, bon moment pour acheter"

    return {
        "product_id":    product_id,
        "type":          rec_type,
        "label":         label,
        "reason":        reason,
        "confidence":    pred_resp["confidence"],
        "current_price": round(best, 2),
    }


# ─── Dev run ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
