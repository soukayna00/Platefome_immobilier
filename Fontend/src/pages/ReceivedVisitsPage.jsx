import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  updateVisitStatus,
  contactVisitRequester,
} from '../services/receivedVisits.js'

const statuses = {
  en_attente: 'En attente',
  acceptee: 'Acceptée',
  refusee: 'Refusée',
  annulee: 'Annulée',
}

const statusClasses = {
  en_attente: 'bg-amber-50 text-amber-800',
  acceptee: 'bg-green-50 text-green-800',
  refusee: 'bg-red-50 text-red-700',
  annulee: 'bg-gray-100 text-gray-600',
}

function formatDate(value) {
  const date = value?.slice(0, 10)
  if (!date) return 'Date non renseignée'

  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export default function ReceivedVisitsPage() {
  const navigate = useNavigate()
  const actionLock = useRef(false)

  const [visits, setVisits] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadVisits() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/visites-recues?page=${page}`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Votre session a expiré. Reconnectez-vous.'
              : 'Impossible de charger les demandes reçues.'
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
          setError(error.message || 'Impossible de charger les demandes.')
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

  async function handleDecision(visit, statut) {
    if (actionLock.current) return

    const confirmed = window.confirm(
      statut === 'acceptee'
        ? 'Confirmer ce rendez-vous de visite ?'
        : 'Refuser cette demande de visite ?'
    )

    if (!confirmed) return

    actionLock.current = true
    setBusyId(visit.id)
    setActionError('')
    setSuccess('')

    try {
      const updated = await updateVisitStatus(visit.id, statut)

      setVisits(current =>
        current.map(item => item.id === updated.id ? updated : item)
      )

      setSuccess(
        statut === 'acceptee'
          ? 'La demande de visite a été acceptée.'
          : 'La demande de visite a été refusée.'
      )
    } catch (error) {
      setActionError(
        error.message || 'Impossible de traiter cette demande.'
      )
      setReload(current => current + 1)
    } finally {
      actionLock.current = false
      setBusyId(null)
    }
  }

  async function handleContact(visit) {
    if (actionLock.current) return

    actionLock.current = true
    setBusyId(visit.id)
    setActionError('')
    setSuccess('')

    try {
      const conversation = await contactVisitRequester(visit.id)

      navigate(`/messages?conversation=${conversation.id}`)
    } catch (error) {
      setActionError(
        error.message || 'Impossible d’ouvrir la conversation.'
      )
    } finally {
      actionLock.current = false
      setBusyId(null)
    }
  }

  const controlsDisabled = loading || busyId !== null

  return (
    <main className="min-h-[65vh] bg-[#f7f4ef] px-5 py-10 lg:px-9">
      <div className="mx-auto max-w-6xl">
        <Link to="/espace-proprietaire" className="text-sm text-atba-clay">
          ← Espace propriétaire
        </Link>

        <div className="mb-8 mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl tracking-tight sm:text-4xl">
              Demandes de visite reçues
            </h1>

            <p className="mt-3 text-sm leading-6 text-atba-muted">
              Consultez les demandes, confirmez un rendez-vous
              ou contactez le demandeur.
            </p>
          </div>

          <button
            type="button"
            disabled={controlsDisabled}
            onClick={() => setReload(current => current + 1)}
            className="rounded-full border border-[#e8e3dc] bg-white px-5 py-2.5 text-sm disabled:opacity-50"
          >
            Actualiser
          </button>
        </div>

        {actionError && (
          <p
            role="alert"
            className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {actionError}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-800"
          >
            {success}
          </p>
        )}

        {loading ? (
          <p role="status" className="text-atba-muted">
            Chargement des demandes…
          </p>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-5 text-red-700"
          >
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
                <h2 className="text-xl">Aucune demande reçue</h2>

                <p className="mt-3 text-sm leading-6 text-atba-muted">
                  Les demandes de visite de vos annonces apparaîtront ici.
                </p>

                <Link
                  to="/mes-annonces"
                  className="mt-5 inline-block text-sm text-atba-clay"
                >
                  Voir mes annonces →
                </Link>
              </section>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {visits.map(visit => {
                  const property = visit.annonce?.bien
                  const requester = visit.utilisateur
                  const name = [requester?.prenom, requester?.nom]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <article
                      key={visit.id}
                      className="overflow-hidden rounded-2xl border border-[#e8e3dc] bg-white shadow-sm"
                    >
                      <div className="flex gap-4 border-b border-[#eee9e2] p-5">
                        {property?.photos?.[0]?.url_photo && (
                          <img
                            src={property.photos[0].url_photo}
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
                          className={`inline-block rounded-full px-3 py-1.5 text-xs ${
                            statusClasses[visit.statut]
                            || 'bg-atba-cream text-atba-ink'
                          }`}
                        >
                          {statuses[visit.statut] || visit.statut}
                        </span>

                        <dl className="mt-5 space-y-3 text-sm">
                          <div className="flex justify-between gap-4">
                            <dt className="text-atba-muted">Demandeur</dt>
                            <dd className="text-right font-medium">
                              {name || 'Utilisateur'}
                            </dd>
                          </div>

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

                        <div className="mt-5 flex flex-wrap gap-2">
                          {visit.statut === 'en_attente' && (
                            <>
                              <button
                                type="button"
                                disabled={busyId !== null}
                                onClick={() =>
                                  handleDecision(visit, 'acceptee')
                                }
                                className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:opacity-50"
                              >
                                Accepter
                              </button>

                              <button
                                type="button"
                                disabled={busyId !== null}
                                onClick={() =>
                                  handleDecision(visit, 'refusee')
                                }
                                className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                Refuser
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            disabled={busyId !== null}
                            onClick={() => handleContact(visit)}
                            className="rounded-full border border-atba-clay px-4 py-2 text-sm font-medium text-atba-clay transition hover:bg-atba-cream disabled:opacity-50"
                          >
                            Contacter le demandeur
                          </button>
                        </div>

                        {busyId === visit.id && (
                          <p
                            role="status"
                            className="mt-3 text-xs text-atba-muted"
                          >
                            Traitement…
                          </p>
                        )}

                        {visit.annonce?.bien_id && (
                          <Link
                            to={`/mes-biens/${visit.annonce.bien_id}`}
                            className="mt-5 inline-block text-sm font-medium text-atba-clay"
                          >
                            Consulter mon bien →
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
                aria-label="Pagination des demandes reçues"
                className="mt-8 flex items-center justify-center gap-4"
              >
                <button
                  type="button"
                  disabled={controlsDisabled || page <= 1}
                  onClick={() => setPage(current => current - 1)}
                  className="rounded-lg border border-[#e8e3dc] bg-white px-4 py-2 text-sm disabled:opacity-40"
                >
                  ← Précédent
                </button>

                <span className="text-sm text-atba-muted">
                  Page {page} sur {lastPage}
                </span>

                <button
                  type="button"
                  disabled={controlsDisabled || page >= lastPage}
                  onClick={() => setPage(current => current + 1)}
                  className="rounded-lg border border-[#e8e3dc] bg-white px-4 py-2 text-sm disabled:opacity-40"
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