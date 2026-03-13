import axios from 'axios'

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Auth token injection (pour quand le backend sera prêt)
api.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('priceiq_user') || 'null')
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
  return config
})

// ─── Products ────────────────────────────────────────────────────────────────

/** GET /products/search?q=... → liste de produits */
export const searchProducts = (query) =>
  api.get('/products/search', { params: { q: query } }).then(r => r.data)

/** GET /products/:id → détail produit */
export const getProduct = (id) =>
  api.get(`/products/${id}`).then(r => r.data)

/** GET /products/:id/prices → prix actuels par enseigne */
export const getProductPrices = (id) =>
  api.get(`/products/${id}/prices`).then(r => r.data)

/** GET /products/:id/history?days=30 → historique des prix */
export const getPriceHistory = (id, days = 30) =>
  api.get(`/products/${id}/history`, { params: { days } }).then(r => r.data)

/** GET /products/:id/prediction → prédiction ML */
export const getPrediction = (id) =>
  api.get(`/products/${id}/prediction`).then(r => r.data)

/** GET /products/:id/recommendation → recommandation */
export const getRecommendation = (id) =>
  api.get(`/products/${id}/recommendation`).then(r => r.data)

/** GET /products/trending → produits tendance */
export const getTrending = () =>
  api.get('/products/trending').then(r => r.data)

export default api
