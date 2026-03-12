"""
clean_data.py
Nettoie et enrichit les prix fetchés avec Polars.
Calcule : moyenne 7j, variation %, flag anomalie.
"""

import json
import polars as pl
from pathlib import Path

RAW_PATH   = Path("/opt/airflow/data/prices_latest.json")
HIST_PATH  = Path("/opt/airflow/data/priceiq_dataset_cleaned.csv")
CLEAN_PATH = Path("/opt/airflow/data/prices_clean.parquet")


def clean_data() -> None:
    raw  = json.loads(RAW_PATH.read_text())
    hist = pl.read_csv(HIST_PATH)

    hist_avg = (
        hist.group_by("product_id")
        .agg(pl.col("price").mean().alias("hist_avg"))
    )

    rows = []
    for product_id, prices in raw.items():
        for entry in prices:
            rows.append({
                "product_id": int(product_id),
                "retailer":   entry["retailer"],
                "price":      entry["price"],
                "in_stock":   entry["in_stock"],
                "date":       entry["date"],
            })

    df = pl.DataFrame(rows)
    df = df.join(hist_avg, on="product_id", how="left")

    df = df.with_columns([
        ((pl.col("price") - pl.col("hist_avg")) / pl.col("hist_avg") * 100)
        .round(2)
        .alias("variation_pct"),
        (pl.col("price") < pl.col("hist_avg") * 0.93)
        .alias("is_deal"),
    ])

    df = df.filter(pl.col("price") > 0)

    df.write_parquet(CLEAN_PATH)
    print(f"[clean_data] {len(df)} lignes nettoyées → {CLEAN_PATH}")


if __name__ == "__main__":
    clean_data()
