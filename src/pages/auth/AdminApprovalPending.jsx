import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function AdminApprovalPending() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-5">
      <div className="w-full max-w-md border border-ink/15 bg-panel p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">Account review</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Approval pending</h1>
        <p className="mt-4 leading-6 text-ink/65">Your account is waiting for a super admin to verify it. Doctor accounts in particular need approval before the doctor portal can be used.</p>
        <Link
          to={user?.role === 'doctor' ? '/login' : '/'}
          className="mt-7 inline-block border border-ink/25 px-5 py-3 text-sm font-semibold text-ink hover:border-ink"
        >
          {user?.role === 'doctor' ? 'Back to login' : 'Return to home'}
        </Link>
      </div>
    </div>
  )
}

export default AdminApprovalPending
