import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canUseAdminTools, isApprovedDoctor } from '../api/auth'

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole === 'staff' && !canUseAdminTools(user)) {
    if (user.role === 'staff') {
      return <Navigate to="/admin-approval-pending" replace />
    }
    return <Navigate to="/" replace />
  }

  if (requiredRole === 'doctor' && !isApprovedDoctor(user)) {
    return <Navigate to={user.role === 'doctor' ? '/admin-approval-pending' : '/'} replace />
  }

  if (requiredRole && requiredRole !== 'staff' && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
