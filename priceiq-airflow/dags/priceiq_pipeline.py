"""
priceiq_pipeline.py
DAG principal PriceIQ — orchestration du pipeline de données complet.

Fréquence : toutes les 6 heures
Pipeline   : fetch → clean → load → train_ml → notify

Chaque tâche est isolée dans /tasks pour faciliter les tests unitaires.
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator

from tasks.fetch_prices     import fetch_prices
from tasks.clean_data       import clean_data
from tasks.load_duckdb      import load_duckdb
from tasks.train_model      import train_model
from tasks.notify_watchlist import notify_watchlist

DEFAULT_ARGS = {
    "owner":            "priceiq",
    "depends_on_past":  False,
    "retries":          2,
    "retry_delay":      timedelta(minutes=5),
    "email_on_failure": False,
}

with DAG(
    dag_id="priceiq_pipeline",
    description="Pipeline PriceIQ : fetch → clean → DuckDB → ML → alertes",
    default_args=DEFAULT_ARGS,
    start_date=datetime(2024, 1, 1),
    schedule_interval="0 */6 * * *",
    catchup=False,
    tags=["priceiq", "etl", "ml"],
) as dag:

    t_fetch = PythonOperator(
        task_id="fetch_prices",
        python_callable=fetch_prices,
    )

    t_clean = PythonOperator(
        task_id="clean_data",
        python_callable=clean_data,
    )

    t_load = PythonOperator(
        task_id="load_duckdb",
        python_callable=load_duckdb,
    )

    t_train = PythonOperator(
        task_id="train_model",
        python_callable=train_model,
    )

    t_notify = PythonOperator(
        task_id="notify_watchlist",
        python_callable=notify_watchlist,
    )

    t_fetch >> t_clean >> t_load >> [t_train, t_notify]
