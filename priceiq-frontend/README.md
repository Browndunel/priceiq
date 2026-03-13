# PriceIQ — Frontend

Application React de comparaison de prix, prédiction ML et suivi en temps réel.

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en développement
npm run dev
```

App disponible sur → http://localhost:3000

## 🔐 Comptes de démo (mock)

| Email | Mot de passe |
|-------|-------------|
| demo@priceiq.com | demo1234 |
| admin@priceiq.com | admin123 |

## 🔌 Connexion avec le Backend FastAPI

1. Dans `.env`, mettre `VITE_USE_MOCK=false`
2. S'assurer que le backend tourne sur `http://localhost:8000`
3. Le proxy Vite redirige `/api/*` → `http://localhost:8000/*`

### Endpoints attendus

| Endpoint | Description |
|----------|-------------|
| `GET /products/search?q=` | Recherche produits |
| `GET /products/:id` | Détail produit |
| `GET /products/:id/prices` | Prix par enseigne |
| `GET /products/:id/history?days=30` | Historique des prix |
| `GET /products/:id/prediction` | Prédiction ML |
| `GET /products/:id/recommendation` | Recommandation (buy_now / wait / good_deal) |
| `GET /products/trending` | Produits populaires |

## 📁 Structure

```
src/
├── api/          → Axios + endpoints
├── components/
│   ├── charts/   → PriceHistoryChart
│   ├── layout/   → Navbar, Layout
│   ├── product/  → ProductCard, PriceTable, PredictionBlock, RecommendationBlock
│   └── ui/       → Spinner, Badge, etc.
├── context/      → AuthContext, WatchlistContext
├── hooks/        → useProducts, usePrices, etc.
├── mocks/        → Données de démo (basées sur le vrai dataset)
├── pages/        → Login, Home, Search, ProductDetail, Watchlist
└── utils/        → formatPrice, formatDate, colors
```
