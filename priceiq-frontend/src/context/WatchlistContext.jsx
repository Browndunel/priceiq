import { createContext, useContext, useState, useEffect } from 'react'

const WatchlistContext = createContext(null)

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('priceiq_watchlist') || '[]')
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('priceiq_watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const addToWatchlist = (product) => {
    setWatchlist(prev => prev.find(p => p.id === product.id) ? prev : [...prev, { ...product, addedAt: Date.now() }])
  }

  const removeFromWatchlist = (productId) => {
    setWatchlist(prev => prev.filter(p => p.id !== productId))
  }

  const isWatched = (productId) => watchlist.some(p => p.id === productId)

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isWatched }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export const useWatchlist = () => useContext(WatchlistContext)
