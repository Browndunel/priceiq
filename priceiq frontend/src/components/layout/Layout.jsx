import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
