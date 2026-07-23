import { Outlet, Link } from 'react-router-dom'

function Layout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">CliniQ</Link>
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">Patient</Link>
          <Link to="/admin" className="hover:underline">Admin</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout