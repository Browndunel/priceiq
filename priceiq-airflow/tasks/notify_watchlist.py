"""
notify_watchlist.py
Détecte les baisses de prix significatives et génère des alertes.
En prod : brancher sur un système d'email / push notification.
"""

import json
import duckdb
from pathlib import Path

DB_PATH     = Path("/opt/airflow/data/priceiq.duckdb")
ALERTS_PATH = Path("/opt/airflow/data/alerts_latest.json")

ALERT_THRESHOLD = -5.0


def notify_watchlist() -> list:
    con = duckdb.connect(str(DB_PATH), read_only=True)

    alerts = con.execute(f"""
        SELECT
            product_id,
            retailer,
            price,
            variation_pct,
            is_deal,
            date
        FROM prices_live
        WHERE variation_pct <= {ALERT_THRESHOLD}
          AND in_stock = true
        ORDER BY variation_pct ASC
        LIMIT 50
    """).fetchall()

    con.close()

    result = [
        {
            "product_id":    row[0],
            "retailer":      row[1],
            "price":         row[2],
            "variation_pct": row[3],
            "is_deal":       row[4],
            "date":          row[5],
            "alert":         f"Prix en baisse de {abs(row[3]):.1f}% chez {row[1]}",
        }
        for row in alerts
    ]

    ALERTS_PATH.write_text(json.dumps(result, indent=2))
    print(f"[notify_watchlist] {len(result)} alertes → {ALERTS_PATH}")

    for alert in result:
        print(f"  ⚡ Produit {alert['product_id']} — {alert['alert']}")

    return result


if __name__ == "__main__":
    notify_watchlist()
