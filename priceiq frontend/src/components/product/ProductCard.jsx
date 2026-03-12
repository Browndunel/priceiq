import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { RecommendationBadge } from '../ui/index.jsx'
import { useState, useEffect } from 'react'

function FlickerPrice({ price }) {
  const [displayed, setDisplayed] = useState(price)
  const [flash, setFlash] = useState('')

  useEffect(() => {
    const t = setInterval(() => {
      const delta = (Math.random() - 0.49) * price * 0.008
      const next  = Math.round((price + delta) * 100) / 100
      setFlash(next < displayed ? 'text-emerald-400' : 'text-red-400')
      setDisplayed(next)
      setTimeout(() => setFlash(''), 500)
    }, 4000 + Math.random() * 6000)
    return () => clearInterval(t)
  }, [price])

  return (
    <span className={`font-mono font-bold text-base transition-colors duration-300 ${flash || 'text-white'}`}>
      €{Math.round(displayed).toLocaleString('en-US')}
    </span>
  )
}

export default function ProductCard({ product }) {
  const available   = product.prices?.filter(p => p.in_stock) || []
  const bestPrice   = available.length ? Math.min(...available.map(p => p.price)) : null
  const lastUpdated = product.prices?.[0]?.last_updated || 'il y a 3 min'

  return (
    <Link to={`/product/${product.id}`} className="card card-hover block group overflow-hidden">
      {/* Image */}
      <div className="w-full aspect-square overflow-hidden relative">
        {product.image
          ? <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            />
          : null
        }
        <div
          className="w-full h-full bg-gradient-to-br from-brand-900/60 to-slate-900 absolute inset-0 items-center justify-center"
          style={{ display: product.image ? 'none' : 'flex' }}
        >
          <span className="text-4xl">📦</span>
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Badge flottant */}
        {product.recommendation && (
          <div className="absolute top-2 right-2">
            <RecommendationBadge type={product.recommendation.type} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-[10px] text-brand-400 font-semibold uppercase tracking-widest mb-1">{product.category}</p>
        <h3 className="font-display font-semibold text-white text-sm leading-snug mb-3 group-hover:text-brand-300 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-end justify-between">
          <div>
            {bestPrice
              ? <FlickerPrice price={bestPrice} />
              : <span className="text-xs text-slate-600">Indisponible</span>
            }
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={9} className="text-slate-600" />
              <p className="text-[10px] text-slate-600">{lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}