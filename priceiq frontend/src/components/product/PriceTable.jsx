import { useState, useEffect } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { RETAILER_COLORS } from '../../utils/index.js'
import { StockBadge } from '../ui/index.jsx'

function LivePrice({ price, isBest }) {
  const [cur, setCur]   = useState(price)
  const [flash, setFlash] = useState('')

  useEffect(() => {
    const t = setInterval(() => {
      const delta = (Math.random() - 0.49) * price * 0.006
      const next  = Math.round((price + delta) * 100) / 100
      setFlash(next < cur ? 'text-emerald-400' : 'text-red-400')
      setCur(next)
      setTimeout(() => setFlash(''), 600)
    }, 5000 + Math.random() * 8000)
    return () => clearInterval(t)
  }, [price])

  return (
    <span className={`font-mono font-semibold text-sm transition-colors duration-300 ${flash || (isBest ? 'text-cyan-400' : 'text-white')}`}>
      €{Math.round(cur).toLocaleString('en-IN')}
    </span>
  )
}

export default function PriceTable({ prices }) {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  if (!prices?.length) return null
  const sorted = [...prices].sort((a, b) => a.price - b.price)
  const best   = sorted.find(p => p.in_stock)?.price

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-semibold">Prices live</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <RefreshCw size={10} />
          <span>Mis à jour {lastRefresh.toLocaleTimeString('fr-FR')}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.04] text-left">
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Enseigne</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">Prix live</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">Stock</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">Màj</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {sorted.map((row) => {
              const isBest = row.price === best && row.in_stock
              return (
                <tr key={row.retailer}
                  className={`transition-colors ${isBest ? 'bg-cyan-500/8' : 'hover:bg-white/[0.03]'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: RETAILER_COLORS[row.retailer] || '#6d28d9' }} />
                      <span className={`font-medium text-sm ${isBest ? 'text-cyan-300' : 'text-slate-300'}`}>
                        {row.retailer}
                      </span>
                      {isBest && (
                        <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/15 border border-cyan-500/20 px-1.5 py-0.5 rounded-full">
                          MEILLEUR
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <LivePrice price={row.price} isBest={isBest} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StockBadge inStock={row.in_stock} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[10px] text-slate-600 font-mono">{row.last_updated || 'il y a 2 min'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-slate-700 hover:text-cyan-400 transition-colors">
                      <ExternalLink size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
