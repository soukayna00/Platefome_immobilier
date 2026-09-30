import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createAnnonce } from '../services/ownerAnnonces.js'

export default function CreateAnnoncePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    type_transaction: 'vente',
    prix: '',
    statut_annonce: 'brouillon',
  })

  useEffect(() => {
    const controller = new AbortController()

    async function loadProperty() {
      setLoading(true)
      setLoadError('')
      setProperty(null)

      try {
        const response = await fetch(`/api/mes-biens/${id}`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Votre session a expiré. Reconnectez-vous.'
              : 'Ce bien est introuvable ou inaccessible.'
          )
        }

        const result = await response.json()

        if (!controller.signal.aborted) {
          setProperty(result)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadProperty()
    return () => controller.abort()
  }, [id])

  function change(event) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (submitting || !property) return

    if (
      form.statut_annonce === 'publiee' &&
      !window.confirm('Publier cette annonce et la rendre visible sur ATBA ?')
    ) {
      return
    }

    setSubmitting(true)
    setError('')
    setErrors({})

    try {
      const annonce = await createAnnonce(id, form)

      if (annonce.statut_annonce === 'publiee') {
        navigate(`/bien/${annonce.id}`)
      } else {
        navigate(`/mes-biens/${id}`, {
          state: { annonceCreated: true },
        })
      }
    } catch (error) {
      setError(error.message || 'Impossible de créer l’annonce.')
      setErrors(error.errors || {})
    } finally {
      setSubmitting(false)
    }
  }

  function fieldError(name) {
    return errors[name] && (
      <p id={`${name}-error`} className="mt-2 text-xs text-red-700">
        {errors[name][0]}
      </p>
    )
  }

  function accessibility(name) {
    return {
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    }
  }

  const field =
    'mt-2 w-full rounded-xl border border-[#e5ded5] bg-[#fcfaf7] px-4 py-3 text-sm outline-none focus:border-atba-clay focus:ring-2 focus:ring-atba-clay/15'

  return (
    <main className="min-h-[70vh] bg-[#f7f4ef] px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <Link to={`/mes-biens/${id}`} className="text-sm text-atba-clay">
          ← Retour au bien
        </Link>

        <div className="mb-8 mt-6">
          <span className="text-xs uppercase tracking-widest text-atba-clay">
            Espace propriétaire
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl">
            Créer une annonce
          </h1>
          <p className="mt-3 text-sm text-atba-muted">
            Choisissez les conditions de vente ou de location de votre bien.
          </p>
        </div>

        {loading ? (
          <p role="status">Chargement du bien…</p>
        ) : loadError ? (
          <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
            {loadError}
          </p>
        ) : property && (
          <div className="grid items-start gap-6 md:grid-cols-[1fr_1.3fr]">
            <aside className="overflow-hidden rounded-2xl border border-[#e8e3dc] bg-white">
              {property.photos?.[0]?.url_photo ? (
                <img
                  src={property.photos[0].url_photo}
                  alt={property.titre}
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="flex h-56 items-center justify-center bg-atba-cream text-sm text-atba-muted">
                  Aucune photo
                </div>
              )}

              <div className="p-6">
                <h2 className="text-xl">{property.titre}</h2>
                <p className="mt-3 text-sm text-atba-muted">
                  {property.ville?.nom_ville}
                  {property.quartier && ` · ${property.quartier}`}
                </p>
                <p className="mt-4 text-sm">
                  {Number(property.surface)} m² · {property.nbr_chambres} chambres
                </p>
                <p className="mt-5 text-xs leading-6 text-atba-muted">
                  Les caractéristiques et les photos de ce bien seront
                  utilisées dans l’annonce.
                </p>
              </div>
            </aside>

            <form onSubmit={submit}>
              <fieldset
                disabled={submitting}
                className="space-y-6 rounded-2xl border border-[#e8e3dc] bg-white p-6 sm:p-8"
              >
                <legend className="sr-only">Conditions de l’annonce</legend>

                <label className="block text-sm">
                  Type de transaction
                  <select
                    name="type_transaction"
                    value={form.type_transaction}
                    onChange={change}
                    className={field}
                    {...accessibility('type_transaction')}
                  >
                    <option value="vente">Vente</option>
                    <option value="location">Location</option>
                  </select>
                  {fieldError('type_transaction')}
                </label>

                <label className="block text-sm">
                  {form.type_transaction === 'location'
                    ? 'Loyer mensuel (MAD)'
                    : 'Prix de vente (MAD)'}

                  <input
                    name="prix"
                    type="number"
                    required
                    min="0.01"
                    max="9999999999.99"
                    step="0.01"
                    value={form.prix}
                    onChange={change}
                    placeholder={
                      form.type_transaction === 'location'
                        ? 'Ex. 4500'
                        : 'Ex. 950000'
                    }
                    className={field}
                    {...accessibility('prix')}
                  />
                  {fieldError('prix')}
                </label>

                <label className="block text-sm">
                  Visibilité
                  <select
                    name="statut_annonce"
                    value={form.statut_annonce}
                    onChange={change}
                    className={field}
                    {...accessibility('statut_annonce')}
                  >
                    <option value="brouillon">Enregistrer en brouillon</option>
                    <option value="publiee">Publier maintenant</option>
                  </select>
                  {fieldError('statut_annonce')}
                </label>

                <p className="rounded-xl bg-[#f0e5dc]/60 p-4 text-xs leading-6 text-atba-muted">
                  {form.statut_annonce === 'publiee'
                    ? 'Votre annonce sera visible dans les recherches publiques.'
                    : 'Votre annonce sera enregistrée sans apparaître dans les recherches publiques.'}
                </p>

                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-full bg-atba-clay px-6 py-3 text-sm text-white hover:brightness-95 disabled:opacity-50"
                >
                  {submitting
                    ? 'Enregistrement…'
                    : form.statut_annonce === 'publiee'
                      ? 'Publier mon annonce'
                      : 'Enregistrer le brouillon'}
                </button>
              </fieldset>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}