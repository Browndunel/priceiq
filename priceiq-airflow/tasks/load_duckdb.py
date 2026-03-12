"""
load_duckdb.py
Charge les prix nettoyés dans DuckDB.
Crée les tables si elles n'existent pas, upsert sinon.
"""

import duckdb
from pathlib import Path

CLEAN_PATH = Path("/opt/airflow/data/prices_clean.parquet")
DB_PATH    = Path("/opt/airflow/data/priceiq.duckdb")


def load_duckdb() -> None:
    con = duckdb.connect(str(DB_PATH))

    con.execute("""
        CREATE TABLE IF NOT EXISTS prices_live (
            product_id    INTEGER,
            retailer      VARCHAR,
            price         DOUBLE,
            in_stock      BOOLEAN,
            date          VARCHAR,
            hist_avg      DOUBLE,
            variation_pct DOUBLE,
            is_deal       BOOLEAN,
            updated_at    TIMESTAMP DEFAULT current_timestamp
        )
    """)

    con.execute("""
        CREATE TABLE IF NOT EXISTS prices_history (
            product_id    INTEGER,
            retailer      VARCHAR,
            price         DOUBLE,
            date          VARCHAR,
            variation_pct DOUBLE
        )
    """)

    con.execute("DELETE FROM prices_live WHERE date = (SELECT MAX(date) FROM prices_live)")

    con.execute(f"""
        INSERT INTO prices_live
        SELECT *, current_timestamp
        FROM read_parquet('{CLEAN_PATH}')
    """)

    con.execute(f"""
        INSERT INTO prices_history (product_id, retailer, price, date, variation_pct)
        SELECT product_id, retailer, price, date, variation_pct
        FROM read_parquet('{CLEAN_PATH}')
    """)

    count = con.execute("SELECT COUNT(*) FROM prices_live").fetchone()[0]
    print(f"[load_duckdb] {count} lignes dans prices_live")
    con.close()


if __name__ == "__main__":
    load_duckdb()
