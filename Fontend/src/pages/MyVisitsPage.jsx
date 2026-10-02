import { useEffect, useState } from 'react'
import { Link } from 'react-router'

const statuses = {
  en_attente: ['En attente', 'bg-amber-50 text-amber-800'],
  acceptee: ['Acceptée', 'bg-green-50 text-green-800'],
  refusee: ['Refusée', 'bg-red-50 text-red-700'],
  annulee: ['Annulée', 'bg-gray-100 text-gray-600'],
}

function formatDate(value) {
  const date = value?.slice(0, 10)
  if (!date) return 'Non renseignée'

  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export default function MyVisitsPage() {
  const [visits, setVisits] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadVisits() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/mes-visites?page=${page}`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Votre session a expiré. Reconnectez-vous.'
              : 'Impossible de charger vos demandes de visite.'
          )
        }

        const result = await response.json()

        if (!controller.signal.aborted) {
          setVisits(result.data)
          setTotal(result.total)
          setLastPage(result.last_page)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message || 'Impossible de charger vos visites.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadVisits()

    return () => controller.abort()
  }, [page, reload])

  const buttonClass =
    'rounded-lg border border-[#e8e3dc] bg-white px-4 py-2 text-sm disabled:opacity-40'

  return (
    <main className="min-h-[65vh] bg-[#f7f4ef] px-5 py-10 lg:px-9">
      <div className="mx-auto max-w-6xl">
        <Link to="/espace-recherche" className="text-sm text-atba-clay">
          ← Espace Recherche
        </Link>

        <div className="mb-8 mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl tracking-tight sm:text-4xl">
              Mes visites
            </h1>
            <p className="mt-3 text-sm text-atba-muted">
              Retrouvez vos demandes et les réponses des propriétaires.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => setReload(current => current + 1)}
            className={buttonClass}
          >
            Actualiser
          </button>
        </div>

        {loading ? (
          <p role="status" className="text-atba-muted">
            Chargement de vos visites…
          </p>
        ) : error ? (
          <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setReload(current => current + 1)}
              className="mt-3 text-sm underline"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-atba-muted">
              {total} demande{total > 1 ? 's' : ''}
            </p>

            {visits.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-[#ded5ca] bg-white p-8">
                <h2 className="text-xl">Aucune demande de visite</h2>
                <p className="mt-3 text-sm text-atba-muted">
                  Ouvrez une annonce et proposez un créneau au propriétaire.
                </p>
                <Link
                  to="/annonces"
                  className="mt-5 inline-block text-sm text-atba-clay"
                >
                  Découvrir les annonces →
                </Link>
              </section>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {visits.map(visit => {
                  const property = visit.annonce?.bien
                  const photo = property?.photos?.[0]?.url_photo
                  const [label, color] = statuses[visit.statut] || [
                    visit.statut,
                    'bg-gray-100 text-gray-600',
                  ]

                  return (
                    <article
                      key={visit.id}
                      className="overflow-hidden rounded-2xl border border-[#e8e3dc] bg-white shadow-sm"
                    >
                      <div className="flex gap-4 border-b border-[#eee9e2] p-5">
                        {photo && (
                          <img
                            src={photo}
                            alt=""
                            className="h-20 w-24 shrink-0 rounded-xl object-cover"
                          />
                        )}

                        <div className="min-w-0">
                          <h2 className="text-lg font-medium">
                            {property?.titre || 'Annonce'}
                          </h2>
                          <p className="mt-2 text-xs text-atba-muted">
                            {property?.ville?.nom_ville}
                            {property?.quartier && ` · ${property.quartier}`}
                          </p>
                        </div>
                      </div>

                      <div className="p-5">
                        <span
                          className={`inline-block rounded-full px-3 py-1.5 text-xs ${color}`}
                        >
                          {label}
                        </span>

                        <dl className="mt-5 space-y-3 text-sm">
                          <div className="flex justify-between gap-4">
                            <dt className="text-atba-muted">Date proposée</dt>
                            <dd className="font-medium">
                              {formatDate(visit.date_visite)}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-atba-muted">Heure proposée</dt>
                            <dd className="font-medium">
                              {visit.heure_visite?.slice(0, 5)}
                            </dd>
                          </div>
                        </dl>

                        {visit.message && (
                          <p className="mt-5 whitespace-pre-line rounded-xl bg-[#fcfaf7] p-4 text-sm leading-6 text-atba-muted">
                            {visit.message}
                          </p>
                        )}

                        {visit.statut === 'acceptee' && (
                          <p className="mt-4 text-sm text-green-800">
                            Le propriétaire a confirmé votre visite.
                          </p>
                        )}

                        {visit.statut === 'en_attente' && (
                          <p className="mt-4 text-sm text-atba-muted">
                            En attente de confirmation du propriétaire.
                          </p>
                        )}

                        {visit.annonce && (
                          <Link
                            to={`/bien/${visit.annonce_id}`}
                            className="mt-5 inline-block text-sm font-medium text-atba-clay"
                          >
                            Voir l’annonce →
                          </Link>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {lastPage > 1 && (
              <nav
                aria-label="Pagination de mes visites"
                className="mt-8 flex items-center justify-center gap-4"
              >
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(current => current - 1)}
                  className={buttonClass}
                >
                  ← Précédent
                </button>

                <span className="text-sm text-atba-muted">
                  Page {page} sur {lastPage}
                </span>

                <button
                  type="button"
                  disabled={page >= lastPage}
                  onClick={() => setPage(current => current + 1)}
                  className={buttonClass}
                >
                  Suivant →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  )
}