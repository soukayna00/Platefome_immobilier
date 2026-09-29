import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const [form, setForm] = useState({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      password_confirmation: '',
})
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors({})
    setError('')
    setSubmitting(true)

    try {
      const csrfResponse = await fetch('/sanctum/csrf-cookie', {
        credentials: 'same-origin',
      })

      if (!csrfResponse.ok) {
        throw new Error('Session indisponible')
      }

      const response = await fetch('/register', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-XSRF-TOKEN': csrfToken(),
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setErrors(data.errors || {})
        setError(data.message || 'Inscription impossible.')
        return
      }

      await refreshUser()
      navigate('/compte')
    } catch {
      setError('Impossible de contacter le serveur. Réessaie.')
    } finally {
      setSubmitting(false)
    }
  }

    const inputClass =
    'mt-2 w-full rounded-xl border border-[#e5ded5] bg-[#fcfaf7] px-4 py-3 text-sm text-[#29251f] placeholder:text-[#a49b90] outline-none transition focus:border-atba-clay focus:ring-2 focus:ring-atba-clay/15'

    return (
    <main className="bg-[#f7f4ef] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-black/5 bg-white shadow-xl shadow-black/5 lg:grid-cols-2">

        {/* Photo et présentation */}
        <section className="relative hidden min-h-[700px] lg:block">
          <img
            src="/images/riad.webp"
            alt="Architecture d’un riad marocain"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <span className="text-xs uppercase tracking-[0.25em] text-white/80">
              Votre prochain chapitre
            </span>

            <h2 className="mt-5 text-4xl leading-tight">
              Un lieu à trouver.
              <br />
              Une histoire à créer.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/80">
              Découvrez des biens au Maroc et échangez directement
              avec leurs propriétaires.
            </p>

            <div className="mt-8 h-px w-16 bg-[#d0a084]" />
          </div>
        </section>

        {/* Formulaire */}
        <section className="px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
          <Link to="/" aria-label="Accueil ATBA">
            <img
              src="/logo.png"
              alt="ATBA"
              className="h-16 w-36 object-contain object-left"
            />
          </Link>

          <div className="mt-7">
            <span className="text-xs uppercase tracking-[0.2em] text-atba-clay">
              Bienvenue chez vous
            </span>

            <h1 className="mt-3 text-3xl text-[#29251f] sm:text-4xl">
              Rejoignez ATBA
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#777168]">
              Créez votre compte pour trouver votre logement
              ou proposer votre bien.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="nom"
                className="text-sm font-medium text-[#403a33]"
              >
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                autoComplete="family-name"
                placeholder="Votre nom"
                required
                maxLength={255}
                value={form.nom}
                onChange={handleChange}
                aria-invalid={Boolean(errors.nom)}
                aria-describedby={errors.nom ? 'nom-error' : undefined}
                className={inputClass}
              />
              {errors.nom && (
                <p id="nom-error" className="mt-2 text-xs text-red-600">
                  {errors.nom[0]}
                </p>
              )}
            </div>
            <div>
                <label
                  htmlFor="prenom"
                  className="text-sm font-medium text-[#403a33]"
                >
                  Prénom
                </label>

                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Votre prénom"
                  required
                  maxLength={255}
                  value={form.prenom}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.prenom)}
                  aria-describedby={errors.prenom ? 'prenom-error' : undefined}
                  className={inputClass}
                />

                {errors.prenom && (
                  <p id="prenom-error" className="mt-2 text-xs text-red-600">
                    {errors.prenom[0]}
                  </p>
                )}
              </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#403a33]"
              >
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                required
                maxLength={255}
                value={form.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={inputClass}
              />
              {errors.email && (
                <p id="email-error" className="mt-2 text-xs text-red-600">
                  {errors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#403a33]"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Au moins 8 caractères"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                className={inputClass}
              />
              {errors.password && (
                <p id="password-error" className="mt-2 text-xs text-red-600">
                  {errors.password[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password_confirmation"
                className="text-sm font-medium text-[#403a33]"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                placeholder="Saisissez à nouveau votre mot de passe"
                required
                minLength={8}
                value={form.password_confirmation}
                onChange={handleChange}
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
              {submitting ? 'Création en cours…' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-8 border-t border-[#eee9e2] pt-6">
            <p className="text-center text-sm text-[#777168]">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/connexion"
                className="font-medium text-atba-clay hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}