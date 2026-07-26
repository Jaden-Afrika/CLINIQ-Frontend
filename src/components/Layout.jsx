import { useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canUseAdminTools } from '../api/auth'
import { useNotifications } from '../context/useNotifications'

function Layout() {
  const { user, logout } = useAuth()
  const { unreadCount, refreshUnreadCount } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'patient' && location.pathname === '/') refreshUnreadCount().catch(() => {})
  }, [location.pathname, user?.role, refreshUnreadCount])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/15 bg-panel px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight text-ink">CliniQ</Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-ink/75 sm:gap-5">
          {user?.role === 'patient' && <><Link to="/" className="hover:text-ink">My care</Link><Link to="/book" className="hover:text-ink">Book</Link></>}
          {user?.role === 'patient' && <Link to="/my-ticket" className="hover:underline">My Ticket</Link>}
          {user?.role === 'patient' && <Link to="/notifications" className="relative flex h-10 w-10 items-center justify-center border border-ink/20 text-ink hover:border-ink" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}><svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>{unreadCount > 0 && <span className="absolute -right-2 -top-2 min-w-5 bg-ticket px-1 text-center font-ticket text-[11px] font-bold leading-5 text-ink">{unreadCount > 99 ? '99+' : unreadCount}</span>}</Link>}
          {canUseAdminTools(user) && <Link to="/admin" className="hover:underline">Admin</Link>}
          {user?.role === 'super_admin' && <Link to="/super-admin" className="hover:underline">Account Reviews</Link>}
          {user && <Link to="/settings" className="hover:underline">Settings</Link>}
          {user && <span className="hidden text-xs text-ink/55 md:inline">{user.full_name || user.username} · {user.role}</span>}
          <button onClick={handleLogout} className="border border-ink/20 px-3 py-2 text-xs hover:border-ink hover:text-ink">
            Log Out
          </button>
        </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
