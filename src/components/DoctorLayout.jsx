import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/useNotifications'

function DoctorLayout() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  function handleLogout() { logout(); navigate('/login') }
  return <div className="min-h-screen bg-paper"><header className="border-b border-ink/15 bg-panel px-4 py-4 sm:px-6"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4"><Link to="/doctor" className="font-display text-2xl font-bold text-ink">CliniQ <span className="text-base text-ink/55">Doctor</span></Link><nav className="flex items-center gap-3 text-sm font-semibold text-ink/75"><Link to="/doctor">Treatments</Link><Link to="/doctor/appointments">Schedule</Link><Link to="/doctor/free-slots">Free times</Link><Link to="/doctor/notifications" className="relative flex h-9 w-9 items-center justify-center border border-ink/20" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}>⌁{unreadCount > 0 && <span className="absolute -right-2 -top-2 min-w-5 bg-ticket px-1 text-center font-ticket text-[11px] leading-5 text-ink">{unreadCount > 99 ? '99+' : unreadCount}</span>}</Link><span className="hidden text-xs text-ink/55 md:inline">{user?.full_name || user?.username}</span><button onClick={handleLogout} className="border border-ink/20 px-3 py-2 text-xs">Log out</button></nav></div></header><main><Outlet /></main></div>
}
export default DoctorLayout
