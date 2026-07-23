import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, isApprovedStaff, isApprovedDoctor } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      const user = await refreshUser()
      navigate(user?.role === 'doctor' ? (isApprovedDoctor(user) ? '/doctor' : '/admin-approval-pending') : user?.role === 'staff' && !isApprovedStaff(user) ? '/admin-approval-pending' : '/')
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-ink/15 bg-panel p-7 shadow-sm sm:p-9">
        <p className="font-display text-3xl font-bold text-ink">CliniQ</p>
        <h1 className="mt-7 font-display text-3xl font-bold text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink/60">Log in to manage your visit.</p>

        {error && <p className="mt-5 border-l-4 border-status-alert bg-status-alert/10 px-3 py-2 text-sm text-ink">{error}</p>}

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-ink/25 bg-panel px-3 py-3"
            required
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/25 bg-panel px-3 py-3"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full bg-ink py-3 text-sm font-bold text-panel hover:bg-ink/90 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="mt-6 text-center text-sm text-ink/65">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">Sign up</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
