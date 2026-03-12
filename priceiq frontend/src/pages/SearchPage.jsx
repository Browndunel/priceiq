import { useSearchParams, Link } from 'react-router-dom'
import { Search, ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { useSearch } from '../hooks/useProducts.js'
import ProductCard from '../components/product/ProductCard.jsx'
import { LoadingPage, EmptyState } from '../components/ui/index.jsx'
import { getMockProduct } from '../mocks/data.js'
import { useState } from 'react'

const SORTS = [
  { key: 'default',    label: 'Pertinence'     },
  { key: 'price_asc',  label: 'Prix croissant'  },
  { key: 'price_desc', label: 'Prix décroissant' },
  { key: 'deal',       label: 'Meilleures affaires' },
]

export default function SearchPage() {
  const [searchParams]      = useSearchParams()
  const query               = searchParams.get('q') || ''
  const [sort, setSort]     = useState('default')
  const [category, setCategory] = useState('Tous')
  const { data: results, isLoading, isError } = useSearch(query)

  const enriched = results?.map(p => ({ ...p, ...getMockProduct(p.id) })) || []

  const categories = ['Tous', ...new Set(enriched.map(p => p.category))]

  const filtered = enriched
    .filter(p => category === 'Tous' || p.category === category)
    .sort((a, b) => {
      const pa = a.prices?.filter(p => p.in_stock).map(p => p.price) || []
      const pb = b.prices?.filter(p => p.in_stock).map(p => p.price) || []
      const ma = pa.length ? Math.min(...pa) : Infinity
      const mb = pb.length ? Math.min(...pb) : Infinity
      if (sort === 'price_asc')  return ma - mb
      if (sort === 'price_desc') return mb - ma
      if (sort === 'deal') {
        const order = { good_deal: 0, buy_now: 1, wait: 2, neutral: 3 }
        return (order[a.recommendation?.type] ?? 3) - (order[b.recommendation?.type] ?? 3)
      }
      return 0
    })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="btn-ghost p-2 text-slate-500"><ArrowLeft size={16} /></Link>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-white">
            <span className="text-brand-400">"{query}"</span>
          </h1>
          {!isLoading && <p className="text-xs text-slate-500 mt-0.5">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</p>}
        </div>
      </div>

      {/* Filters */}
      {!isLoading && enriched.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-slate-500" />
            <span className="text-xs text-slate-500 font-medium">Trier :</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {SORTS.map(s => (
              <button key={s.key} onClick={() => setSort(s.key)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  sort === s.key ? 'bg-brand-600 text-white' : 'bg-white/[0.06] text-slate-400 hover:bg-white/10'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap ml-2 pl-2 border-l border-white/[0.08]">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  category === c ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/30' : 'bg-white/[0.06] text-slate-400 hover:bg-white/10'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading
        ? <LoadingPage />
        : isError
          ? <EmptyState icon={Search} title="Erreur de recherche" subtitle="Vérifiez votre connexion" />
          : !filtered.length
            ? <EmptyState icon={Search} title="Aucun résultat" subtitle={`Aucun produit pour "${query}"`} />
            : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
      }
    </div>
  )
}