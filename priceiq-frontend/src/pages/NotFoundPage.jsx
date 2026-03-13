import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a15] bg-grid flex items-center justify-center px-4">
      <div className="text-center page-enter">
        <p className="font-mono text-8xl font-bold text-brand-900 mb-2">404</p>
        <h1 className="font-display font-bold text-2xl text-white mb-2">Page introuvable</h1>
        <p className="text-slate-500 text-sm mb-8">Cette page n'existe pas.</p>
        <Link to="/" className="btn-primary inline-flex"><Home size={15} /> Accueil</Link>
      </div>
    </div>
  )
}
