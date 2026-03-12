import { TrendingUp, TrendingDown, Brain } from 'lucide-react'

export default function PredictionBlock({ prediction }) {
  if (!prediction) return null
  const { current_price, predicted_price, trend, confidence } = prediction
  const diff   = ((predicted_price - current_price) / current_price * 100).toFixed(1)
  const isDown = trend === 'down'
  const isUp   = trend === 'up'

  return (
    <div className={`rounded-2xl p-5 border ${isDown ? 'bg-emerald-500/8 border-emerald-500/20' : isUp ? 'bg-red-500/8 border-red-500/20' : 'bg-white/[0.04] border-white/[0.08]'}`}>

      <div className="flex items-center gap-2 mb-4">
        <Brain size={15} className="text-brand-400" />
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Prédiction de prix — dans 7 jours</p>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Prix prédit</p>
          <div className="flex items-center gap-2">
            {isDown ? <TrendingDown size={20} className="text-emerald-400" /> : isUp ? <TrendingUp size={20} className="text-red-400" /> : null}
            <span className={`font-mono text-2xl font-bold ${isDown ? 'text-emerald-400' : isUp ? 'text-red-400' : 'text-white'}`}>
            €{Math.round(predicted_price).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Variation</p>
          <p className={`text-xl font-bold font-mono ${isDown ? 'text-emerald-400' : isUp ? 'text-red-400' : 'text-slate-400'}`}>
            {isDown ? '−' : '+'}{Math.abs(diff)}%
          </p>
        </div>
      </div>

      {/* Confidence */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500">Confiance du modèle (MAE)</span>
          <span className="font-semibold text-white">{confidence}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${isDown ? 'bg-emerald-400' : isUp ? 'bg-red-400' : 'bg-brand-400'}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      <p className="text-[10px] text-slate-600 mt-3 italic">
      * Prédiction basée sur l'historique des prix. Non garantie.
      </p>
    </div>
  )
}
