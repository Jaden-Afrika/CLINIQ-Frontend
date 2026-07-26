import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, login, isApprovedStaff, isApprovedDoctor } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'

function registrationErrorMessage(error) {
  if (!error.response) {
    return 'Could not reach the server. Please check your connection and try again.'
  }

  const data = error.response.data
  if (typeof data?.detail === 'string') return data.detail
  if (typeof data === 'object') {
    const entries = Object.entries(data)
    const usernameEntry = entries.find(([field]) => field === 'username')
    const fullNameEntry = entries.find(([field]) => field === 'full_name')

    if (usernameEntry) {
      const message = Array.isArray(usernameEntry[1]) ? usernameEntry[1][0] : usernameEntry[1]
      if (typeof message === 'string') {
        return `Username conflict: ${message}`
      }
    }

    if (fullNameEntry) {
      const message = Array.isArray(fullNameEntry[1]) ? fullNameEntry[1][0] : fullNameEntry[1]
      if (typeof message === 'string') return `Full name: ${message}`
    }

    const [, messages] = entries[0] || []
    const message = Array.isArray(messages) ? messages[0] : messages
    if (typeof message === 'string') return message
  }
  return 'Could not create your account. Please review your details and try again.'
}

function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('patient')
  const [doctorName, setDoctorName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !email.trim() || !password.trim() || (role === 'doctor' && (!doctorName.trim() || !specialty.trim()))) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      await register(fullName, email, password, role, phone, doctorName, specialty)
      await login(email, password)
      const user = await refreshUser()
      navigate(user?.role === 'doctor' ? (isApprovedDoctor(user) ? '/doctor' : '/admin-approval-pending') : user?.role === 'staff' && !isApprovedStaff(user) ? '/admin-approval-pending' : '/')
    } catch (err) {
      setError(registrationErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-ink/15 bg-panel p-7 shadow-sm sm:p-9">
        <p className="font-display text-3xl font-bold text-ink">CliniQ</p>
        <h1 className="mt-7 font-display text-3xl font-bold text-ink">Create an account</h1>
        <p className="mt-2 text-sm text-ink/60">A clear place in the queue starts here.</p>

        {error && <p className="mt-5 border-l-4 border-status-alert bg-status-alert/10 px-3 py-2 text-sm text-ink">{error}</p>}

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-ink/25 bg-panel px-3 py-3"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/25 bg-panel px-3 py-3"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/25 bg-panel px-3 py-3"
            minLength={8}
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold">Phone <span className="font-normal text-ink/55">(optional)</span></label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-ink/25 bg-panel px-3 py-3"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold">I am a...</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-ink/25 bg-panel px-3 py-3"
          >
            <option value="patient">Patient</option>
            <option value="staff">Staff Admin</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>
        {role === 'doctor' && <><div className="mt-5"><label className="mb-2 block text-sm font-semibold">Doctor name</label><input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="w-full border border-ink/25 bg-panel px-3 py-3" /></div><div className="mt-5"><label className="mb-2 block text-sm font-semibold">Specialty</label><input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full border border-ink/25 bg-panel px-3 py-3" /></div><p className="mt-3 text-xs leading-5 text-ink/60">Doctor accounts require super-admin approval before portal access.</p></>}

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full bg-ink py-3 text-sm font-bold text-panel hover:bg-ink/90 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="mt-6 text-center text-sm text-ink/65">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">Log in</Link>
        </p>
      </form>
    </div>
  )
}

export default Signup
