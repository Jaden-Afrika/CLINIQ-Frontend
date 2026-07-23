import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">CliniQ</Link>
        <nav className="flex items-center space-x-4">
          <Link to="/" className="hover:underline">Book</Link>
          <Link to="/my-ticket" className="hover:underline">My Ticket</Link>
          <Link to="/admin" className="hover:underline">Admin</Link>
          {user && (
            <span className="text-sm text-blue-100">
              {user.username} ({user.role})
            </span>
          )}
          <button onClick={handleLogout} className="text-sm bg-blue-700 px-3 py-1 rounded hover:bg-blue-800">
            Log Out
          </button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
