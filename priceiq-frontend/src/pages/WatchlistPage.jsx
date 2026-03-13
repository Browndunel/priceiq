import { Link } from 'react-router-dom'
import { Bookmark, Trash2, TrendingUp, TrendingDown, ExternalLink, Package } from 'lucide-react'
import { useWatchlist } from '../context/WatchlistContext.jsx'
import { EmptyState } from '../components/ui/index.jsx'
import { getMockProduct } from '../mocks/data.js'

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useWatchlist()

  if (!watchlist.length) return (
    <div className="max-w-4xl mx-auto px-4 py-12 page-enter">
      <EmptyState icon={Bookmark} title="Watchlist vide"
        subtitle="Ajoutez des produits pour suivre leur prix en temps réel" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-white">Watchlist</h1>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-xs text-emerald-400 font-semibold">{watchlist.length} produit{watchlist.length > 1 ? 's' : ''} suivi{watchlist.length > 1 ? 's' : ''} en live</p>
        </div>
      </div>

      <div className="space-y-2">
        {watchlist.map(item => {
          const fresh     = getMockProduct(item.id)
          const cur       = fresh?.prices?.filter(p => p.in_stock)
          const curBest   = cur?.length ? Math.min(...cur.map(p => p.price)) : null
          const prevBest  = item.prices?.filter(p => p.in_stock)
          const prev      = prevBest?.length ? Math.min(...prevBest.map(p => p.price)) : null
          const diff      = prev && curBest ? ((curBest - prev) / prev * 100).toFixed(1) : null

          return (
            <div key={item.id} className="card card-hover p-4 flex items-center gap-4 group">
              <div className="w-11 h-11 bg-brand-900/40 border border-brand-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Package size={18} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.id}`}
                  className="font-semibold text-white hover:text-brand-300 transition-colors text-sm line-clamp-1">
                  {item.name}
                </Link>
                <div className="flex items-center gap-3 mt-0.5">
                  {curBest && <span className="font-mono text-base font-bold text-white">₹{Math.round(curBest).toLocaleString('en-IN')}</span>}
                  {diff !== null && (
                    <span className={`flex items-center gap-1 text-xs font-semibold font-mono ${Number(diff) < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {Number(diff) < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                      {Number(diff) < 0 ? '' : '+'}{diff}%
                    </span>
                  )}
                  <span className="text-[10px] text-slate-600">{item.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/product/${item.id}`} className="btn-ghost p-2 text-slate-500"><ExternalLink size={14} /></Link>
                <button onClick={() => removeFromWatchlist(item.id)} className="btn-ghost p-2 text-slate-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
