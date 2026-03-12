"""
fetch_prices.py
Simule la récupération de prix frais pour chaque produit/enseigne.
En prod : remplacer par des appels API ou scraping réel.
"""

import json
import random
import polars as pl
from pathlib import Path
from datetime import date

DATA_PATH   = Path("/opt/airflow/data/priceiq_dataset_cleaned.csv")
OUTPUT_PATH = Path("/opt/airflow/data/prices_latest.json")

RETAILERS = [
    "Amazon", "Walmart", "Best Buy", "Target", "Costco",
    "eBay", "Newegg", "B&H", "Micro Center", "Adorama"
]


def fetch_prices() -> dict:
    df = pl.read_csv(DATA_PATH)

    base_prices = (
        df.group_by("product_id")
        .agg(pl.col("price").mean().alias("base_price"))
    )

    result = {}
    today  = date.today().isoformat()

    for row in base_prices.to_dicts():
        pid        = str(row["product_id"])
        base_price = row["base_price"]
        result[pid] = []

        for retailer in RETAILERS:
            fluctuation = random.uniform(-0.06, 0.06)
            price       = round(base_price * (1 + fluctuation), 2)
            in_stock    = random.random() > 0.15

            result[pid].append({
                "retailer": retailer,
                "price":    price,
                "in_stock": in_stock,
                "date":     today,
            })

    OUTPUT_PATH.write_text(json.dumps(result, indent=2))
    print(f"[fetch_prices] {len(result)} produits — {today}")
    return result


if __name__ == "__main__":
    fetch_prices()
