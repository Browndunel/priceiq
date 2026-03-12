import { useQuery } from '@tanstack/react-query'
import { searchProducts, getProduct, getProductPrices, getPriceHistory, getPrediction, getRecommendation, getTrending } from '../api/productApi.js'
import { searchMock, getMockProduct, MOCK_TRENDING } from '../mocks/data.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
// ☝️ Mettre à false + VITE_USE_MOCK=false quand FastAPI est prêt

export const useSearch = (query) => useQuery({
  queryKey: ['search', query, Date.now().toString().slice(0, -4)], // refresh every 10s for variety
  queryFn: () => USE_MOCK ? Promise.resolve(searchMock(query)) : searchProducts(query),
  enabled: !!query && query.length > 1,
  staleTime: 10_000,
})

export const useProduct = (id) => useQuery({
  queryKey: ['product', id],
  queryFn: () => USE_MOCK ? Promise.resolve(getMockProduct(id)) : getProduct(id),
  enabled: !!id,
})

export const usePrices = (id) => useQuery({
  queryKey: ['prices', id],
  queryFn: () => USE_MOCK ? Promise.resolve(getMockProduct(id)?.prices || []) : getProductPrices(id),
  enabled: !!id,
  refetchInterval: 15_000, // simulate live refresh every 15s
})

export const usePriceHistory = (id, days) => useQuery({
  queryKey: ['history', id, days],
  queryFn: () => USE_MOCK ? Promise.resolve(getMockProduct(id)?.history || {}) : getPriceHistory(id, days),
  enabled: !!id,
})

export const usePrediction = (id) => useQuery({
  queryKey: ['prediction', id],
  queryFn: () => USE_MOCK ? Promise.resolve(getMockProduct(id)?.prediction) : getPrediction(id),
  enabled: !!id,
})

export const useRecommendation = (id) => useQuery({
  queryKey: ['recommendation', id],
  queryFn: () => USE_MOCK ? Promise.resolve(getMockProduct(id)?.recommendation) : getRecommendation(id),
  enabled: !!id,
})

export const useTrending = () => useQuery({
  queryKey: ['trending'],
  queryFn: () => USE_MOCK ? Promise.resolve(MOCK_TRENDING) : getTrending(),
  staleTime: 60_000,
})
