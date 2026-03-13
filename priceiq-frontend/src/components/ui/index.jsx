import { ShoppingCart, Clock, TrendingDown, Minus, Search, Bookmark } from 'lucide-react'

export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }[size]
  return <div className={`${s} border-2 border-brand-800 border-t-brand-400 rounded-full animate-spin ${className}`} />
}

export function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Spinner size="lg" />
      <p className="text-xs text-slate-500 font-mono animate-pulse">Chargement des données…</p>
    </div>
  )
}

export function ErrorBox({ message = 'Une erreur est survenue' }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-400 text-sm">
      {message}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/[0.08]">
          <Icon size={24} className="text-slate-600" />
        </div>
      )}
      <p className="font-display text-xl text-slate-400">{title}</p>
      {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
    </div>
  )
}

const REC_ICONS  = { buy_now: ShoppingCart, wait: Clock, good_deal: TrendingDown, neutral: Minus }
const REC_CLASS  = { buy_now: 'badge-buy', wait: 'badge-wait', good_deal: 'badge-deal', neutral: 'badge-neutral' }
const REC_LABELS = { buy_now: 'Acheter maintenant', wait: 'Attendre', good_deal: 'Bonne affaire !', neutral: 'Neutre' }

export function RecommendationBadge({ type, size = 'sm' }) {
  const Icon  = REC_ICONS[type]  || Minus
  const cls   = REC_CLASS[type]  || 'badge-neutral'
  const label = REC_LABELS[type] || type
  return (
    <span className={`${cls} ${size === 'lg' ? 'text-sm px-3 py-1.5' : ''}`}>
      <Icon size={size === 'lg' ? 14 : 11} strokeWidth={2.5} />
      {label}
    </span>
  )
}

export function StockBadge({ inStock }) {
  return inStock
    ? <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">En stock</span>
    : <span className="text-xs font-medium text-slate-500 bg-white/5 border border-white/[0.08] px-2 py-0.5 rounded-full">Rupture</span>
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-xl font-display text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/** Live price ticker — shows a price that occasionally flickers */
export function LivePriceTicker({ price, currency = '₹' }) {
  const [displayed, setDisplayed] = useState(price)
  const [cls, setCls] = useState('')

  useEffect(() => {
    if (price === displayed) return
    setCls(price > displayed ? 'price-up' : 'price-down')
    setDisplayed(price)
    const t = setTimeout(() => setCls(''), 600)
    return () => clearTimeout(t)
  }, [price])

  return (
    <span className={`font-mono font-semibold transition-colors duration-300 ${cls}`}>
      {currency}{Number(displayed).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
    </span>
  )
}

import { useState, useEffect } from 'react'
