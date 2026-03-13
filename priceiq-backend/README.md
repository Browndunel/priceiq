# PriceIQ — Backend FastAPI

Stack: **FastAPI + DuckDB + Polars + scikit-learn**

## 🚀 Installation

```bash
pip install -r requirements.txt
```

Placer `priceiq_dataset_cleaned.csv` dans ce dossier.

## ▶️ Lancer le serveur

```bash
uvicorn main:app --reload --port 8000
```

Docs interactives → http://localhost:8000/docs

## 🏗️ Architecture

| Technologie | Rôle |
|-------------|------|
| **FastAPI** | API REST asynchrone |
| **Polars** | Lecture CSV, feature engineering ML, groupby historique |
| **DuckDB** | Requêtes SQL analytiques (search ILIKE, aggregations) |
| **RandomForest** | Prédiction de prix à 7 jours |

## 📡 Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /products/trending` | 8 produits populaires (shufflés) |
| `GET /products/search?q=` | Recherche ILIKE via DuckDB |
| `GET /products/:id` | Détail produit |
| `GET /products/:id/prices` | Prix live par enseigne |
| `GET /products/:id/history?days=30` | Historique Polars groupby |
| `GET /products/:id/prediction` | Prédiction RandomForest |
| `GET /products/:id/recommendation` | Recommandation ML |

## 🔌 Connecter le Frontend

Dans `src/hooks/useProducts.js` :
```js
const USE_MOCK = false
```
