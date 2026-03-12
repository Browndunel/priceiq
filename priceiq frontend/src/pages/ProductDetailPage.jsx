import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Bookmark, BookmarkCheck, Package, Tag, RefreshCw } from 'lucide-react'
import { useProduct, usePrices, usePriceHistory, usePrediction, useRecommendation } from '../hooks/useProducts.js'
import { useWatchlist } from '../context/WatchlistContext.jsx'
import PriceTable from '../components/product/PriceTable.jsx'
import PriceHistoryChart from '../components/charts/PriceHistoryChart.jsx'
import PredictionBlock from '../components/product/PredictionBlock.jsx'
import RecommendationBlock from '../components/product/RecommendationBlock.jsx'
import { LoadingPage, ErrorBox, SectionHeader } from '../components/ui/index.jsx'
import { useState, useEffect } from 'react'
import { useToast } from '../components/ui/Toast.jsx'

function LiveBestPrice({ price }) {
  const [cur, setCur]   = useState(price)
  const [flash, setFlash] = useState('')
  useEffect(() => {
    const t = setInterval(() => {
      const delta = (Math.random() - 0.49) * price * 0.007
      const next  = Math.round((price + delta) * 100) / 100
      setFlash(next < cur ? 'text-emerald-400' : 'text-red-400')
      setCur(next)
      setTimeout(() => setFlash(''), 700)
    }, 5000 + Math.random() * 5000)
    return () => clearInterval(t)
  }, [price])
  return (
    <span className={`font-mono text-3xl font-bold transition-colors duration-300 ${flash || 'text-white'}`}>
      €{Math.round(cur).toLocaleString('en-IN')}
    </span>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { data: product, isLoading, isError } = useProduct(id)
  const { data: prices }                       = usePrices(id)
  const { data: history }                      = usePriceHistory(id, 30)
  const { data: prediction }                   = usePrediction(id)
  const { data: recommendation }               = useRecommendation(id)
  const { addToWatchlist, removeFromWatchlist, isWatched } = useWatchlist()
  const { addToast } = useToast()

  if (isLoading) return <LoadingPage />
  if (isError || !product) return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <ErrorBox message="Produit introuvable." />
    </div>
  )

  const watched    = isWatched(product.id)
  const available  = prices?.filter(p => p.in_stock) || []
  const bestPrice  = available.length ? Math.min(...available.map(p => p.price)) : null
  const bestRetailer = prices?.find(p => p.price === bestPrice)?.retailer

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">

      <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6 font-mono">
        <ArrowLeft size={13} /> ← Retour
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left */}
        <div className="lg:col-span-1 space-y-4">

          <div className="card p-6">
            <div className="w-full aspect-square bg-gradient-to-br from-brand-900/30 to-slate-900/50 rounded-xl mb-5 flex items-center justify-center border border-white/5">
              <Package size={56} className="text-slate-700" />
            </div>

            <span className="inline-flex items-center gap-1 text-[10px] text-brand-400 font-semibold uppercase tracking-widest mb-2">
              <Tag size={10} /> {product.category}
            </span>
            <h1 className="font-display font-bold text-2xl text-white leading-tight mb-4">{product.name}</h1>

            {bestPrice && (
              <div className="bg-gradient-to-r from-brand-900/50 to-cyan-900/30 rounded-xl p-4 mb-4 border border-brand-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Meilleur prix live</p>
                </div>
                <LiveBestPrice price={bestPrice} />
                {bestRetailer && <p className="text-xs text-slate-500 mt-0.5">chez {bestRetailer}</p>}
              </div>
            )}

              <button onClick={() => {
                  if (watched) {
                    removeFromWatchlist(product.id)
                    addToast('Retiré de la Watchlist', 'error')
                  } else {
                    addToWatchlist(product)
                    addToast(`${product.name} ajouté à la Watchlist`, 'success')
                  }
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all border ${
                watched
                  ? 'bg-brand-500/15 border-brand-500/30 text-brand-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-brand-500/10 hover:border-brand-500/30 hover:text-brand-300'
              }`}>
              {watched ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              {watched ? 'Retirer de la Watchlist' : 'Ajouter à la Watchlist'}
            </button>
          </div>

          <PredictionBlock prediction={prediction} />
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-5">
          <RecommendationBlock recommendation={recommendation} onAddWatchlist={() => addToWatchlist(product)} />

          <div className="card p-6">
            <SectionHeader title="Comparaison des prix" subtitle="Toutes enseignes · Prix live" />
            <PriceTable prices={prices} />
          </div>

          <div className="card p-6">
            <SectionHeader title="Historique des prix" subtitle="Données issues de DuckDB + Polars" />
            <PriceHistoryChart history={history} />
          </div>
        </div>
      </div>
    </div>
  )
}
