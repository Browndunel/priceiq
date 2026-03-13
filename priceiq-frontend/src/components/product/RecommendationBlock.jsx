import { ShoppingCart, Clock, TrendingDown, Minus, ExternalLink, Bookmark } from 'lucide-react'

const CONFIG = {
  buy_now:   { grad: 'from-brand-600 to-brand-800',   icon: ShoppingCart, cta: 'Acheter maintenant'  },
  wait:      { grad: 'from-amber-500 to-amber-700',   icon: Clock,        cta: 'Surveiller le prix'   },
  good_deal: { grad: 'from-cyan-500 to-cyan-700',     icon: TrendingDown, cta: "Profiter de l'offre"  },
  neutral:   { grad: 'from-slate-600 to-slate-800',   icon: Minus,        cta: 'Voir les offres'       },
}

export default function RecommendationBlock({ recommendation, onAddWatchlist }) {
  if (!recommendation) return null
  const { type, label, reason } = recommendation
  const cfg  = CONFIG[type] || CONFIG.neutral
  const Icon = cfg.icon

  return (
    <div className={`bg-gradient-to-br ${cfg.grad} rounded-2xl p-6`}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-xl text-white">{label}</p>
          <p className="text-sm text-white/70 mt-0.5">{reason}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 bg-white/20 hover:bg-white/[0.03]0 text-white font-semibold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
          <ExternalLink size={14} /> {cfg.cta}
        </button>
        <button onClick={onAddWatchlist}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20">
          <Bookmark size={14} /> Watchlist
        </button>
      </div>
    </div>
  )
}
