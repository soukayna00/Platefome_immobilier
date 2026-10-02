import { useRef, useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { loginAdmin } from '../../services/admin/auth.js'

export default function AdminLoginPage() {
  const { user, loading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const sending = useRef(false)

  const requestedPath = location.state?.from

  const destination =
    typeof requestedPath === 'string'
    && (
      requestedPath === '/admin'
      || requestedPath.startsWith('/admin/')
    )
    && !requestedPath.startsWith('/admin/connexion')
      ? requestedPath
      : '/admin'

  async function handleSubmit(event) {
    event.preventDefault()

    if (sending.current) return

    sending.current = true
    setSubmitting(true)
    setError('')

    try {
      await loginAdmin(email, password)

      const authenticatedUser = await refreshUser()

      if (
        authenticatedUser?.type_compte !== 'administrateur'
        || authenticatedUser?.statut_compte !== 'actif'
      ) {
        throw new Error(
          'Impossible de vérifier votre session administrateur.'
        )
      }

      navigate(destination, { replace: true })
    } catch (error) {
      setError(error.message || 'Connexion impossible.')
    } finally {
      sending.current = false
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main
        role="status"
        className="flex min-h-screen items-center justify-center bg-[#f7f4ef]"
      >
        Chargement…
      </main>
    )
  }

  if (
    user?.type_compte === 'administrateur'
    && user?.statut_compte === 'actif'
  ) {
    return <Navigate to={destination} replace />
  }

  const fieldClass =
    'mt-2 w-full rounded-xl border border-[#e5ded5] bg-[#fcfaf7] px-4 py-3 text-sm outline-none focus:border-atba-clay focus:ring-2 focus:ring-atba-clay/15'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#e8e3dc] bg-white p-7 shadow-xl shadow-black/5 sm:p-10">
        <Link to="/" aria-label="Accueil ATBA">
          <img
            src="/logo.png"
            alt="ATBA"
            className="h-16 w-36 object-contain object-left"
          />
        </Link>

        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-atba-clay">
          Administration
        </p>

        <h1 className="mt-3 text-3xl">
          Connexion administrateur
        </h1>

        <p className="mt-3 text-sm leading-6 text-atba-muted">
          Connectez-vous pour superviser la plateforme.
        </p>

        <form onSubmit={handleSubmit} className="mt-7">
          <fieldset disabled={submitting} className="space-y-5">
            <label className="block text-sm">
              Adresse email

              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="block text-sm">
              Mot de passe

              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={event => setPassword(event.target.value)}
                className={fieldClass}
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-atba-clay px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </fieldset>
        </form>

        <Link
          to="/"
          className="mt-6 inline-block text-sm text-atba-muted hover:text-atba-clay"
        >
          ← Retour au site
        </Link>
      </section>
    </main>
  )
}