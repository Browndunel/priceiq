import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// ⚠️  MOCK — à remplacer par un vrai appel POST /api/auth/login quand le backend est prêt
const MOCK_USERS = [
  { id: 1, email: 'demo@priceiq.com', password: 'demo1234', name: 'Demo User' },
  { id: 2, email: 'admin@priceiq.com', password: 'admin123', name: 'Admin' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('priceiq_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 800))
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...safeUser } = found
      setUser(safeUser)
      localStorage.setItem('priceiq_user', JSON.stringify(safeUser))
      setLoading(false)
      return true
    } else {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('priceiq_user')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
