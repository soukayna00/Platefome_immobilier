import { Link, Navigate, useLocation } from 'react-router'
import { useAuth } from '../../context/AuthContext'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main
        role="status"
        className="flex min-h-[60vh] items-center justify-center bg-[#f7f4ef] text-sm text-atba-muted"
      >
        Chargement…
      </main>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/connexion"
        replace
        state={{
          from: location.pathname + location.search,
        }}
      />
    )
  }

  if (
    user.type_compte !== 'administrateur'
    || user.statut_compte !== 'actif'
  ) {
    return (
      <main className="min-h-[60vh] bg-[#f7f4ef] px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl">Accès réservé</h1>

          <p className="mt-4 text-sm leading-6 text-atba-muted">
            Cette page est réservée aux administrateurs actifs.
          </p>

          <Link
            to="/"
            className="mt-6 inline-block text-sm text-atba-clay"
          >
            ← Retour au site
          </Link>
        </div>
      </main>
    )
  }

  return children
}