import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main
        role="status"
        className="flex min-h-[60vh] items-center justify-center text-sm text-atba-muted"
      >
        Chargement de votre espace…
      </main>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/connexion"
        replace
        state={{
          from: location.pathname + location.search,
        }}
      />
    )
  }

  return children
}