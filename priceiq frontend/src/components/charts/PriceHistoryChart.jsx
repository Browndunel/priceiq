import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatDate, RETAILER_COLORS } from '../../utils/index.js'

const RANGES = [{ label: '7j', days: 7 }, { label: '30j', days: 30 }, { label: '90j', days: 90 }]

function buildChartData(history, days) {
  if (!history) return []
  const retailers = Object.keys(history)
  const map = {}
  retailers.forEach(r => {
    history[r].slice(-days).forEach(({ date, price }) => {
      if (!map[date]) map[date] = { date }
      map[date][r] = price
    })
  })
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a2e] border border-white/15 shadow-xl rounded-xl px-4 py-3 text-xs">
      <p className="font-semibold text-slate-300 mb-2">{formatDate(label)}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400 min-w-[80px]">{p.dataKey}</span>
          <span className="font-mono font-semibold text-white">€{Math.round(p.value).toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  )
}

export default function PriceHistoryChart({ history }) {
  const [days, setDays] = useState(30)
  const retailers = history ? Object.keys(history) : []
  const data      = buildChartData(history, days)

  return (
    <div>
      <div className="flex gap-1 mb-5">
        {RANGES.map(r => (
          <button key={r.days} onClick={() => setDays(r.days)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              days === r.days ? 'bg-brand-600 text-white' : 'bg-white/[0.06] text-slate-500 hover:bg-white/10 hover:text-white'
            }`}>
            {r.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tickFormatter={formatDate}
            tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
            tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#64748b' }} />
          {retailers.map(r => (
            <Line key={r} type="monotone" dataKey={r}
              stroke={RETAILER_COLORS[r] || '#7c3aed'} strokeWidth={2}
              dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
