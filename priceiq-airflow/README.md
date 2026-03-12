# PriceIQ — Airflow Pipeline

Pipeline d'orchestration des données PriceIQ avec Apache Airflow 2.x.

## Architecture

```
fetch_prices → clean_data → load_duckdb → train_model
                                        ↘ notify_watchlist
```

| Tâche              | Rôle                                          | Sortie                      |
|--------------------|-----------------------------------------------|-----------------------------|
| `fetch_prices`     | Récupère les prix par produit/enseigne        | `data/prices_latest.json`   |
| `clean_data`       | Nettoie et enrichit (Polars)                  | `data/prices_clean.parquet` |
| `load_duckdb`      | Charge dans DuckDB (idempotent)               | Tables `prices_live` / `prices_history` |
| `train_model`      | Réentraîne RandomForest                       | `models/model.pkl`          |
| `notify_watchlist` | Génère alertes si baisse >= 5%               | `data/alerts_latest.json`   |

**Fréquence** : toutes les 6 heures (`0 */6 * * *`)

## Lancer le projet

```bash
# 1. Copier le dataset dans data/
cp ../priceiq-backend/priceiq_dataset_cleaned.csv data/

# 2. Démarrer Airflow
docker-compose up -d

# 3. Attendre ~60s puis ouvrir l'interface
open http://localhost:8080
# Login : admin / admin

# 4. Activer le DAG "priceiq_pipeline" dans l'UI
# 5. Cliquer "Trigger DAG" pour lancer manuellement
```

## Structure

```
priceiq-airflow/
├── dags/
│   └── priceiq_pipeline.py   ← DAG principal
├── tasks/
│   ├── fetch_prices.py        ← Tâche 1
│   ├── clean_data.py          ← Tâche 2
│   ├── load_duckdb.py         ← Tâche 3
│   ├── train_model.py         ← Tâche 4
│   └── notify_watchlist.py   ← Tâche 5
├── data/                      ← Datasets + outputs (gitignore en prod)
├── models/                    ← model.pkl + metrics.json
├── docker-compose.yml
└── requirements.txt
```

## Lien avec le backend FastAPI

Le backend FastAPI lit directement `data/priceiq.duckdb` et `models/model.pkl`.  
Airflow met ces fichiers à jour toutes les 6h — le backend sert toujours des données fraîches sans redémarrage.

## Pour la soutenance

- Ouvrir `localhost:8080` → montrer le graphe du DAG
- Montrer les logs de chaque tâche
- Montrer `data/alerts_latest.json` — alertes générées automatiquement
- Montrer `models/metrics.json` — MAE du modèle réentraîné
