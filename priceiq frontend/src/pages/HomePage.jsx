import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Brain, BarChart2, Bell, Zap, RefreshCw } from 'lucide-react'
import { useTrending } from '../hooks/useProducts.js'
import ProductCard from '../components/product/ProductCard.jsx'
import { LoadingPage, SectionHeader } from '../components/ui/index.jsx'
import { getMockProduct, RETAILERS } from '../mocks/data.js'

const FEATURES = [
  { icon: Brain,    title: 'Prédiction ML',   desc: 'Random Forest entraîné sur 27k datapoints' },
  { icon: Search,   title: 'Comparaison live', desc: '10 enseignes comparées en temps réel'     },
  { icon: Bell,     title: 'Watchlist',         desc: 'Alertes de changement de prix automatiques'},
  { icon: Zap,      title: 'Recommandation IA', desc: 'Acheter maintenant ou attendre ?'         },
]

// Fake live feed — price flickers
function LiveFeed() {
  const [feed, setFeed] = useState([])
  const products = ['OnePlus 11R 5G','Redmi 10 Power','Samsung Galaxy M33','boAt Airdopes 141','iQOO Z6 Lite']

  useEffect(() => {
    const push = () => {
      const product  = products[Math.floor(Math.random() * products.length)]
      const retailer = RETAILERS[Math.floor(Math.random() * 5)]
      const price    = Math.round(5000 + Math.random() * 35000)
      const dir      = Math.random() > 0.5 ? 'up' : 'down'
      setFeed(prev => [{ product, retailer, price, dir, id: Date.now() }, ...prev].slice(0, 5))
    }
    push()
    const t = setInterval(push, 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live Price Feed</span>
      </div>
      {feed.map(f => (
        <div key={f.id} className="flex items-center justify-between py-1 border-b border-white/4 last:border-0 animate-fade-in">
          <div>
            <p className="text-xs font-medium text-white truncate max-w-[140px]">{f.product}</p>
            <p className="text-[10px] text-slate-500">{f.retailer}</p>
          </div>
          <span className={`text-xs font-mono font-semibold ${f.dir === 'down' ? 'text-emerald-400' : 'text-red-400'}`}>
            {f.dir === 'down' ? '▼' : '▲'} €{f.price.toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { data: trending, isLoading, refetch } = useTrending()
  const enriched = trending?.map(p => ({ ...p, ...getMockProduct(p.id) })) || []

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">

      {/* Hero */}
      <section className="pt-14 pb-10 page-enter">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Comparaison intelligente · Mise à jour continue
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl text-blue-400 leading-[1.1] mb-4 drop-shadow-lg">
              Le prix juste,
              <br />
              <span className="gradient-text">au bon moment.</span>
            </h1>
           <p className="text-slate-300 text-lg max-w-md mb-8 leading-relaxed">
           Comparez, prédisez et suivez les prix sur des centaines de produits.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Rechercher un produit…" className="input-field pl-10 h-12 text-base" autoFocus />
              </div>
              {/* <button type="submit" className="btn-primary h-12 px-5 shrink-0"> */}
               {/* <Search size={16} /> Rechercher */}
              {/* </button> */}
            </form>
          </div>
          <div className="lg:col-span-2">
            <LiveFeed />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-4 hover:border-brand-500/30 transition-all duration-200 group">
            <div className="w-9 h-9 bg-brand-500/15 rounded-xl flex items-center justify-center mb-3 group-hover:bg-brand-500/25 transition-colors">
              <Icon size={17} className="text-brand-400" />
            </div>
            <p className="font-semibold text-white text-sm mb-1">{title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      {/* Trending */}
      <section>
        <SectionHeader
          title="Produits populaires"
          subtitle="Actualisé en temps réel · Trié aléatoirement"
          action={
            <button onClick={() => refetch()} className="btn-ghost text-xs gap-1.5">
              <RefreshCw size={13} /> Actualiser
            </button>
          }
        />
        {isLoading
          ? <LoadingPage />
          : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {enriched.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        }
      </section>
    </div>
  )
}
