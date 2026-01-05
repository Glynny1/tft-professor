import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { trackPage } from '../utils/analytics'
import { useEffect } from 'react'
import { GlobalSearch } from './GlobalSearch'

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? 'bg-accent text-white' : 'text-slate-200 hover:text-white hover:bg-slate/50'
  }`

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    trackPage(location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen text-slate-100 bg-gradient-to-b from-midnight to-slate">
      <header className="sticky top-0 z-10 border-b border-slate/40 bg-midnight/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="text-lg font-semibold text-gold">
              TFT Professor
            </NavLink>
            <nav className="flex items-center gap-2 text-sm">
              <NavLink to="/" className={navLinkClasses}>
                Home
              </NavLink>
              <NavLink to="/builder" className={navLinkClasses}>
                Builder
              </NavLink>
              <NavLink to="/results" className={navLinkClasses}>
                Results
              </NavLink>
              <NavLink to="/admin" className={navLinkClasses}>
                Admin
              </NavLink>
            </nav>
          </div>
          <GlobalSearch />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

