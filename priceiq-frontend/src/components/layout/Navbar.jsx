import { Link, useNavigate } from 'react-router-dom'
import { Search, Bookmark, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useWatchlist } from '../../context/WatchlistContext.jsx'
import { useState, useRef, useEffect } from 'react'
import { MOCK_PRODUCTS } from '../../mocks/data.js'

function SearchWithSuggestions({ onSearch }) {
  const [q, setQ]               = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen]         = useState(false)
  const ref                     = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (val) => {
    setQ(val)
    if (val.length > 1) {
      const matches = MOCK_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5)
      setSuggestions(matches)
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (q.trim()) { onSearch(q.trim()); setOpen(false) }
  }

  const pick = (name) => {
    setQ(name)
    setOpen(false)
    onSearch(name)
  }

  return (
    <div ref={ref} className="relative flex-1 max-w-lg">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={e => handleChange(e.target.value)}
            onFocus={() => suggestions.length && setOpen(true)}
            placeholder="Rechercher un produit…"
            className="input-field pl-9 h-9 text-sm"
          />
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#1a1a2e] border border-white/[0.1] rounded-xl shadow-xl z-50 overflow-hidden">
          {suggestions.map(p => (
            <button
              key={p.id}
              onClick={() => pick(p.name)}
              className="w-full text-left px-4 py-2.5 hover:bg-brand-500/20 transition-colors flex items-center gap-3 border-b border-white/[0.05] last:border-0"
            >
              <Search size={12} className="text-slate-500 shrink-0" />
              <span className="text-sm text-slate-200">{p.name}</span>
              <span className="text-xs text-slate-500 ml-auto">{p.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="font-mono text-xs text-slate-600 hidden md:inline">{time.toLocaleTimeString('fr-FR')}</span>
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { watchlist }    = useWatchlist()
  const navigate         = useNavigate()

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#08080f]/90 backdrop-blur-xl border-b border-white/[0.06] h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">

        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="PriceIQ" className="h-8 w-8 object-contain" />
          <span className="font-display font-bold text-xl text-white hidden sm:inline">
            Price<span className="text-cyan-400">IQ</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-semibold">En direct</span>
        </div>

        <SearchWithSuggestions onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />

        <div className="flex items-center gap-1 ml-auto">
          <LiveClock />
          <Link to="/watchlist" className="btn-ghost relative text-sm">
            <Bookmark size={17} />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {watchlist.length}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2 pl-3 border-l border-white/[0.06] ml-1">
            <div className="w-7 h-7 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center">
              <User size={13} className="text-brand-400" />
            </div>
            <span className="text-sm text-slate-300 hidden sm:inline font-medium">{user?.name}</span>
            <button onClick={logout} className="btn-ghost text-slate-500 hover:text-red-400 p-1.5">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}