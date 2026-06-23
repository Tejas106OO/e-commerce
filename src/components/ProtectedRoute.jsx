import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, requiredRole, redirectTo = '/account' }) {
  const { isAuthenticated, user } = useAuth()
  const { addToast } = useToast()
  const location = useLocation()

  const hasRequiredRole = !requiredRole || (
    requiredRole === 'admin' ? user?.role === 'admin' :
    requiredRole === 'seller' ? (user?.role === 'seller' || user?.role === 'admin') :
    requiredRole === 'customer' ? true : false
  )

  useEffect(() => {
    if (isAuthenticated && !hasRequiredRole) {
      addToast('Access denied. Insufficient permissions.', 'error')
    }
  }, [isAuthenticated, hasRequiredRole, addToast])

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
  }

  if (!hasRequiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}
