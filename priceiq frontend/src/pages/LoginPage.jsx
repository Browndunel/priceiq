import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, loading, error, isAuthenticated } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen bg-[#0a0a15] bg-grid flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative" style={{ animation: 'fadeUp 0.5s ease forwards' }}>

        {/* Card */}
        <div className="bg-[#13131f] border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(109,40,217,0.15)]">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-brand-500/30 rounded-2xl blur-xl" />
              <img src="/logo.png" alt="PriceIQ" className="relative w-16 h-16 object-contain" />
            </div>
            <h1 className="font-display font-bold text-3xl text-white">
              Price<span className="text-cyan-400">IQ</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 text-center">Comparaison de prix intelligente</p>
          </div>

          {/* Live badge */}
          <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold">Comparaison de prix en temps réel</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@email.com" className="input-field" required autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="input-field pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center h-11 disabled:opacity-50 disabled:cursor-not-allowed mt-1">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Zap size={15} /> Se connecter <ArrowRight size={15} /></>
              }
            </button>
          </form>

          {/* Demo creds */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <p className="text-xs text-center text-slate-600 mb-3 font-medium uppercase tracking-wider">Accès démo</p>
            <div className="space-y-1.5">
              {[
                { email: 'demo@priceiq.com',  password: 'demo1234' },
                { email: 'admin@priceiq.com', password: 'admin123' },
              ].map(c => (
                <button key={c.email} type="button"
                  onClick={() => { setEmail(c.email); setPassword(c.password) }}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-brand-500/10 hover:border-brand-500/30 border border-white/6 transition-all flex justify-between items-center group">
                  <span className="text-xs font-mono text-slate-400 group-hover:text-slate-200">{c.email}</span>
                  <span className="text-xs font-mono text-slate-600 group-hover:text-slate-400">{c.password}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
