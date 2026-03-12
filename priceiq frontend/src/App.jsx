import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { WatchlistProvider } from './context/WatchlistContext.jsx'
import Layout from './components/layout/Layout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import HomePage from './pages/HomePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import WatchlistPage from './pages/WatchlistPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <WatchlistProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="watchlist" element={<WatchlistPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </WatchlistProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
