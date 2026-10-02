import { useState } from 'react'
import {  useNavigate,Link, useLocation  } from 'react-router'
import { useAuth } from '../context/AuthContext'

function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}


export default function LoginPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const csrfResponse = await fetch('/sanctum/csrf-cookie', {
        credentials: 'same-origin',
      })
      if (!csrfResponse.ok) throw new Error('Session indisponible.')

      const response = await fetch('/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-XSRF-TOKEN': csrfToken(),
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.message || 'Identifiants incorrects.')
        return
      }
    await refreshUser()

    const destination = location.state?.from || '/compte'
    navigate(destination, { replace: true })
    } catch {
      setError('Connexion impossible. Réessaie.')
    } finally {
      setSubmitting(false)
    }
  }
  const inputClass =
    'mt-2 w-full rounded-xl border border-[#e5ded5] bg-[#fcfaf7] px-4 py-3 text-sm text-[#29251f] placeholder:text-[#a49b90] outline-none transition focus:border-atba-clay focus:ring-2 focus:ring-atba-clay/15'
    return (
    <main className="bg-[#f7f4ef] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-black/5 bg-white shadow-xl shadow-black/5 lg:grid-cols-2">

        {/* Panneau photo */}
        <section className="relative hidden min-h-[640px] lg:block">
          <img
            src="/images/interior.webp"
            alt="Intérieur chaleureux d’un logement"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <span className="text-xs uppercase tracking-[0.25em] text-white/80">
              Retrouvez votre espace
            </span>

            <h2 className="mt-5 text-4xl leading-tight">
              Votre recherche.
              <br />
              Votre prochain chez-vous.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/80">
              Retrouvez vos favoris et poursuivez vos échanges
              avec les propriétaires.
            </p>

            <div className="mt-8 h-px w-16 bg-[#d0a084]" />
          </div>
        </section>

        {/* Panneau de connexion */}
        <section className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
          <Link to="/" aria-label="Accueil ATBA" className="self-start">
            <img
              src="/logo.png"
              alt="ATBA"
              className="h-16 w-36 object-contain object-left"
            />
          </Link>

          <div className="mt-7">
            <span className="text-xs uppercase tracking-[0.2em] text-atba-clay">
              Heureux de vous retrouver
            </span>

            <h1 className="mt-3 text-3xl text-[#29251f] sm:text-4xl">
              Bienvenue sur ATBA
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#777168]">
              Connectez-vous pour retrouver votre espace personnel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="text-sm font-medium text-[#403a33]"
              >
                Adresse email
              </label>

              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={event => setEmail(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-[#403a33]"
              >
                Mot de passe
              </label>

              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className={inputClass}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-atba-clay px-5 py-3.5 text-sm font-medium text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-atba-clay disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-8 border-t border-[#eee9e2] pt-6">
            <p className="text-center text-sm text-[#777168]">
              Pas encore de compte ?{' '}
              <Link
                to="/inscription"
                className="font-medium text-atba-clay hover:underline"
              >
                Rejoindre ATBA
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}