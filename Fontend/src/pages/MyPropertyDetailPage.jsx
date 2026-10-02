import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { deleteBien } from '../services/biens.js'

const propertyStates = {
  neuf: 'Neuf',
  bon_etat: 'Bon état',
  a_renover: 'À rénover',
}

export default function MyPropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [property, setProperty] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProperty() {
      setLoading(true)
      setError('')
      setActionError('')
      setProperty(null)
      setSelectedPhoto(0)

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
              : response.status === 404
                ? 'Ce bien est introuvable ou inaccessible.'
                : 'Impossible de charger ce bien.'
          )
        }

        const result = await response.json()

        if (!controller.signal.aborted) {
          setProperty(result)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message || 'Impossible de charger ce bien.')
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

  async function handleDelete() {
    if (!property || deleting) return

    const confirmed = window.confirm(
      `Supprimer définitivement « ${property.titre} » et ses photos ?`
    )

    if (!confirmed) return

    setDeleting(true)
    setActionError('')

    try {
      await deleteBien(id)
      navigate('/mes-biens', { replace: true })
    } catch (error) {
      setActionError(
        error.message || 'Impossible de supprimer ce bien.'
      )
    } finally {
      setDeleting(false)
    }
  }

  const photos = property?.photos || []

  return (
    <main className="min-h-[65vh] bg-[#f7f4ef] px-5 py-10 lg:px-9">
      <div className="mx-auto max-w-6xl">
        <Link to="/mes-biens" className="text-sm text-atba-clay">
          ← Retour à mes biens
        </Link>

        {loading ? (
          <p role="status" className="mt-8 text-atba-muted">
            Chargement du bien…
          </p>
        ) : error ? (
          <p
            role="alert"
            className="mt-8 rounded-xl bg-red-50 p-5 text-red-700"
          >
            {error}
          </p>
        ) : property && (
          <>
            {location.state?.annonceCreated && (
              <p
                role="status"
                className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-800"
              >
                Votre annonce a été enregistrée en brouillon.
                Elle n’est pas encore visible dans les recherches publiques.
              </p>
            )}

            <div className="mb-8 mt-6">
              <span className="text-xs uppercase tracking-widest text-atba-clay">
                Mon espace propriétaire
              </span>

              <h1 className="mt-3 text-3xl tracking-tight sm:text-4xl">
                {property.titre}
              </h1>

              <p className="mt-3 text-atba-muted">
                {property.ville?.nom_ville}
                {property.quartier && ` · ${property.quartier}`}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {!deleting && (
                  <>
                    <Link
                      to={`/mes-biens/${id}/modifier`}
                      className="rounded-full bg-atba-clay px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-95"
                    >
                      Modifier le bien
                    </Link>

                    <Link
                      to={`/mes-biens/${id}/annonces/nouvelle`}
                      className="rounded-full border border-atba-clay bg-white px-5 py-2.5 text-sm font-medium text-atba-clay transition hover:bg-atba-cream"
                    >
                      Créer une annonce
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                >
                  {deleting ? 'Suppression…' : 'Supprimer le bien'}
                </button>
              </div>

              {actionError && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"
                >
                  {actionError}
                </p>
              )}
            </div>

            <div className="grid items-start gap-7 lg:grid-cols-[1.5fr_1fr]">
              <section aria-label="Photos du bien">
                {photos.length > 0 ? (
                  <>
                    <img
                      src={photos[selectedPhoto]?.url_photo}
                      alt={`${property.titre} — photo ${selectedPhoto + 1}`}
                      className="h-[300px] w-full rounded-2xl object-cover shadow-sm sm:h-[450px]"
                    />

                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => setSelectedPhoto(index)}
                          aria-label={`Afficher la photo ${index + 1}`}
                          aria-pressed={selectedPhoto === index}
                          className={`overflow-hidden rounded-xl border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atba-clay ${
                            selectedPhoto === index
                              ? 'border-atba-clay'
                              : 'border-transparent hover:border-[#d8c8ba]'
                          }`}
                        >
                          <img
                            src={photo.url_photo}
                            alt=""
                            className="h-16 w-full object-cover sm:h-24"
                          />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex h-72 items-center justify-center rounded-2xl bg-white text-atba-muted">
                    Aucune photo disponible
                  </div>
                )}

                <section className="mt-7 rounded-2xl border border-[#e8e3dc] bg-white p-6">
                  <h2 className="text-xl">Description</h2>

                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-atba-muted">
                    {property.description || 'Aucune description renseignée.'}
                  </p>
                </section>
              </section>

              <aside className="rounded-2xl border border-[#e8e3dc] bg-white p-6 shadow-sm">
                <h2 className="text-xl">Caractéristiques du bien</h2>

                <dl className="mt-5 divide-y divide-[#eee9e2] text-sm">
                  {[
                    ['Type', property.type_bien?.libelle || 'Non renseigné'],
                    ['Surface', `${Number(property.surface)} m²`],
                    ['Chambres', property.nbr_chambres],
                    ['Salles de bain', property.nbr_salle_bain],
                    ['Étage', property.etage ?? 'Non renseigné'],
                    ['Parking', property.parking ? 'Oui' : 'Non'],
                    ['Ascenseur', property.ascenseur ? 'Oui' : 'Non'],
                    [
                      'État',
                      propertyStates[property.etat_bien] || 'Non renseigné',
                    ],
                    [
                      'Adresse approximative',
                      property.adresse_approx || 'Non renseignée',
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between gap-5 py-4"
                    >
                      <dt className="text-atba-muted">{label}</dt>
                      <dd className="text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  )
}