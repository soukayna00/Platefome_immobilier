import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { updatePassword, updateProfile } from '../services/account.js'

const fieldClass =
  'mt-2 w-full rounded-xl border border-[#e5ded5] bg-white px-4 py-3 text-sm outline-none focus:border-atba-clay disabled:opacity-50'

function FieldError({ errors, name }) {
  if (!errors[name]) return null

  return (
    <p className="mt-2 text-xs text-red-700">
      {errors[name][0]}
    </p>
  )
}

function AccountForms({ user, refreshUser }) {
  const [profile, setProfile] = useState({
    nom: user.nom || '',
    prenom: user.prenom || '',
    email: user.email || '',
    telephone: user.telephone || '',
  })

  const [password, setPassword] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  const [busy, setBusy] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileErrors, setProfileErrors] = useState({})
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const submitting = useRef(false)

  function changeProfile(event) {
    const { name, value } = event.target
    setProfile(current => ({ ...current, [name]: value }))
    setProfileSuccess('')
  }

  function changePassword(event) {
    const { name, value } = event.target
    setPassword(current => ({ ...current, [name]: value }))
    setPasswordSuccess('')
  }

  async function saveProfile(event) {
    event.preventDefault()
    if (submitting.current) return

    submitting.current = true
    setBusy('profile')
    setProfileError('')
    setProfileErrors({})
    setProfileSuccess('')

    try {
      const result = await updateProfile({
        nom: profile.nom.trim(),
        prenom: profile.prenom.trim(),
        email: profile.email.trim(),
        telephone: profile.telephone.trim() || null,
      })

      setProfile({
        nom: result.nom || '',
        prenom: result.prenom || '',
        email: result.email || '',
        telephone: result.telephone || '',
      })

      await refreshUser()
      setProfileSuccess('Vos informations ont été mises à jour.')
    } catch (error) {
      setProfileError(error.message || 'Impossible de modifier le profil.')
      setProfileErrors(error.errors || {})
    } finally {
      submitting.current = false
      setBusy('')
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    if (submitting.current) return

    submitting.current = true
    setBusy('password')
    setPasswordError('')
    setPasswordErrors({})
    setPasswordSuccess('')

    try {
      await updatePassword(password)

      setPassword({
        current_password: '',
        password: '',
        password_confirmation: '',
      })

      setPasswordSuccess('Votre mot de passe a été modifié.')
    } catch (error) {
      setPasswordError(
        error.message || 'Impossible de modifier le mot de passe.'
      )
      setPasswordErrors(error.errors || {})
    } finally {
      submitting.current = false
      setBusy('')
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-[#e8e3dc] bg-white p-6 sm:p-8">
        <h2 className="text-xl font-medium">Mes informations</h2>

        <form onSubmit={saveProfile} className="mt-6">
          <fieldset disabled={Boolean(busy)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                Prénom
                <input
                  name="prenom"
                  autoComplete="given-name"
                  required
                  maxLength={100}
                  value={profile.prenom}
                  onChange={changeProfile}
                  aria-invalid={Boolean(profileErrors.prenom)}
                  className={fieldClass}
                />
                <FieldError errors={profileErrors} name="prenom" />
              </label>

              <label className="block text-sm">
                Nom
                <input
                  name="nom"
                  autoComplete="family-name"
                  required
                  maxLength={100}
                  value={profile.nom}
                  onChange={changeProfile}
                  aria-invalid={Boolean(profileErrors.nom)}
                  className={fieldClass}
                />
                <FieldError errors={profileErrors} name="nom" />
              </label>
            </div>

            <label className="block text-sm">
              Adresse email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                value={profile.email}
                onChange={changeProfile}
                aria-invalid={Boolean(profileErrors.email)}
                className={fieldClass}
              />
              <FieldError errors={profileErrors} name="email" />
            </label>

            <label className="block text-sm">
              Téléphone
              <input
                name="telephone"
                type="tel"
                autoComplete="tel"
                maxLength={20}
                value={profile.telephone}
                onChange={changeProfile}
                aria-invalid={Boolean(profileErrors.telephone)}
                className={fieldClass}
              />
              <FieldError errors={profileErrors} name="telephone" />
            </label>

            <p className="text-xs leading-6 text-atba-muted">
              Si vous changez votre email ou votre téléphone, sa
              vérification devra être renouvelée.
            </p>

            {profileError && (
              <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {profileError}
              </p>
            )}

            {profileSuccess && (
              <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
                {profileSuccess}
              </p>
            )}

            <button
              type="submit"
              className="rounded-full bg-atba-clay px-5 py-3 text-sm text-white disabled:opacity-50"
            >
              {busy === 'profile' ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </fieldset>
        </form>
      </section>

      <section className="rounded-2xl border border-[#e8e3dc] bg-white p-6 sm:p-8">
        <h2 className="text-xl font-medium">Changer mon mot de passe</h2>

        <form onSubmit={savePassword} className="mt-6">
          <fieldset disabled={Boolean(busy)} className="space-y-4">
            <label className="block text-sm">
              Mot de passe actuel
              <input
                name="current_password"
                type="password"
                autoComplete="current-password"
                required
                value={password.current_password}
                onChange={changePassword}
                aria-invalid={Boolean(passwordErrors.current_password)}
                className={fieldClass}
              />
              <FieldError errors={passwordErrors} name="current_password" />
            </label>

            <label className="block text-sm">
              Nouveau mot de passe
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={256}
                value={password.password}
                onChange={changePassword}
                aria-invalid={Boolean(passwordErrors.password)}
                className={fieldClass}
              />
              <FieldError errors={passwordErrors} name="password" />
            </label>

            <label className="block text-sm">
              Confirmer le nouveau mot de passe
              <input
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={256}
                value={password.password_confirmation}
                onChange={changePassword}
                aria-invalid={Boolean(passwordErrors.password_confirmation)}
                className={fieldClass}
              />
              <FieldError
                errors={passwordErrors}
                name="password_confirmation"
              />
            </label>

            <p className="text-xs leading-6 text-atba-muted">
              Utilisez au moins 12 caractères et un mot de passe
              différent de votre mot de passe actuel.
            </p>

            {passwordError && (
              <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
                {passwordSuccess}
              </p>
            )}

            <button
              type="submit"
              className="rounded-full bg-atba-clay px-5 py-3 text-sm text-white disabled:opacity-50"
            >
              {busy === 'password'
                ? 'Modification…'
                : 'Modifier le mot de passe'}
            </button>
          </fieldset>
        </form>
      </section>
    </div>
  )
}

export default function AccountPage() {
  const { user, loading, refreshUser } = useAuth()

  if (loading) {
    return (
      <main role="status" className="mx-auto min-h-[65vh] max-w-[1280px] px-5 py-12">
        Chargement du compte…
      </main>
    )
  }

  if (!user) {
    return (
      <main className="mx-auto min-h-[65vh] max-w-5xl px-5 py-12">
        <h1 className="text-3xl">Mon compte</h1>
        <p className="mt-4 text-atba-muted">
          Connectez-vous pour gérer vos informations.
        </p>
        <Link
          to="/connexion"
          state={{ from: '/compte' }}
          className="mt-6 inline-block rounded-full bg-atba-clay px-5 py-3 text-sm text-white"
        >
          Se connecter
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-[65vh] bg-[#f7f4ef] px-5 py-12 lg:px-9">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl tracking-tight sm:text-4xl">Mon compte</h1>

        <p className="mt-3 text-sm leading-7 text-atba-muted">
          Un seul compte pour rechercher, acheter, louer ou publier un bien.
        </p>

        <div className="mb-8 mt-5 flex flex-wrap gap-3">
          <Link
            to="/espace-recherche"
            className="rounded-full bg-atba-clay px-5 py-2.5 text-sm text-white"
          >
            Espace Recherche
          </Link>
          <Link
            to="/espace-proprietaire"
            className="rounded-full border border-[#e8e3dc] bg-white px-5 py-2.5 text-sm"
          >
            Espace Propriétaire
          </Link>
        </div>

        <AccountForms
          key={user.id}
          user={user}
          refreshUser={refreshUser}
        />
      </div>
    </main>
  )
}