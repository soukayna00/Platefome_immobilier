import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  getAdminSignalements,
  updateSignalement,
} from '../../services/admin/signalements.js'

const reasons = {
  annonce_frauduleuse: 'Annonce suspecte ou frauduleuse',
  informations_incorrectes: 'Informations incorrectes',
  photos_inappropriees: 'Photos inappropriées',
  bien_indisponible: 'Bien indisponible',
  autre: 'Autre motif',
}

const statuses = {
  en_attente: 'En attente',
  traite: 'Traité',
  rejete: 'Rejeté',
}

const statusClasses = {
  en_attente: 'bg-amber-50 text-amber-800',
  traite: 'bg-green-50 text-green-800',
  rejete: 'bg-red-50 text-red-700',
}

function formatDate(value) {
  if (!value) return 'Non renseignée'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Non renseignée'

  return date.toLocaleString('fr-MA', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [status, setStatus] = useState('en_attente')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [reload, setReload] = useState(0)

  const actionLock = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadReports() {
      setLoading(true)
      setError('')

      try {
        const result = await getAdminSignalements(
          status,
          page,
          controller.signal
        )

        if (controller.signal.aborted) return

        const finalPage = Math.max(1, result.last_page)

        if (page > finalPage) {
          setPage(finalPage)
          return
        }

        setReports(result.data)
        setTotal(result.total)
        setLastPage(finalPage)
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error.message || 'Impossible de charger les signalements.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadReports()

    return () => controller.abort()
  }, [status, page, reload])

  function changeStatus(event) {
    setStatus(event.target.value)
    setPage(1)
    setSuccess('')
    setActionError('')
  }

  async function handleDecision(report, nextStatus) {
    if (actionLock.current || report.statut !== 'en_attente') return

    const confirmed = window.confirm(
      nextStatus === 'traite'
        ? 'Marquer ce signalement comme traité ? Cette action ne retire pas l’annonce.'
        : 'Rejeter ce signalement ?'
    )

    if (!confirmed) return

    actionLock.current = true
    setBusyId(report.id)
    setActionError('')
    setSuccess('')

    try {
      await updateSignalement(report.id, nextStatus)

      setSuccess(
        nextStatus === 'traite'
          ? 'Le signalement a été marqué comme traité.'
          : 'Le signalement a été rejeté.'
      )

      setReload(current => current + 1)
    } catch (error) {
      setActionError(
        error.message || 'Impossible de modifier ce signalement.'
      )
    } finally {
      actionLock.current = false
      setBusyId(null)
    }
  }

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-atba-clay">
            Modération
          </span>

          <h1 className="mt-3 text-3xl tracking-tight">
            Signalements
          </h1>

          <p className="mt-3 text-sm leading-6 text-atba-muted">
            Examinez les problèmes signalés par les utilisateurs.
          </p>
        </div>

        <button
          type="button"
          disabled={loading || busyId !== null}
          onClick={() => setReload(current => current + 1)}
          className="rounded-full border border-[#e8e3dc] bg-white px-5 py-2.5 text-sm disabled:opacity-50"
        >
          Actualiser
        </button>
      </div>

      <label className="mb-6 block max-w-xs text-sm">
        Filtrer par statut

        <select
          value={status}
          onChange={changeStatus}
          disabled={loading || busyId !== null}
          className="mt-2 w-full rounded-xl border border-[#e8e3dc] bg-white px-4 py-3 outline-none focus:border-atba-clay disabled:opacity-50"
        >
          <option value="">Tous les signalements</option>
          <option value="en_attente">En attente</option>
          <option value="traite">Traités</option>
          <option value="rejete">Rejetés</option>
        </select>
      </label>

      {success && (
        <p
          role="status"
          className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-800"
        >
          {success}
        </p>
      )}

      {actionError && (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {actionError}
        </p>
      )}

      {loading ? (
        <p role="status" className="text-atba-muted">
          Chargement des signalements…
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
            {total} signalement{total > 1 ? 's' : ''}
          </p>

          {reports.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-[#ded5ca] bg-white p-8">
              <h2 className="text-xl">Aucun signalement</h2>

              <p className="mt-3 text-sm text-atba-muted">
                Aucun signalement ne correspond à ce filtre.
              </p>
            </section>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {reports.map(report => {
                const annonce = report.annonce
                const property = annonce?.bien
                const reporter = report.utilisateur
                const name = [reporter?.prenom, reporter?.nom]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <article
                    key={report.id}
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
                          {property?.titre || 'Annonce indisponible'}
                        </h2>

                        <p className="mt-2 text-xs text-atba-muted">
                          Signalement #{report.id}
                          {annonce && ` · Annonce #${annonce.id}`}
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      <span
                        className={`inline-block rounded-full px-3 py-1.5 text-xs ${
                          statusClasses[report.statut]
                            || 'bg-atba-cream text-atba-ink'
                        }`}
                      >
                        {statuses[report.statut] || report.statut}
                      </span>

                      <dl className="mt-5 space-y-4 text-sm">
                        <div>
                          <dt className="text-atba-muted">Motif</dt>
                          <dd className="mt-1 font-medium">
                            {reasons[report.motif] || report.motif}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-atba-muted">Signalé par</dt>
                          <dd className="mt-1 font-medium">
                            {name || 'Utilisateur'}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-atba-muted">Date du signalement</dt>
                          <dd className="mt-1">
                            {formatDate(report.date_signalement)}
                          </dd>
                        </div>

                        {report.date_traitement && (
                          <div>
                            <dt className="text-atba-muted">Date du traitement</dt>
                            <dd className="mt-1">
                              {formatDate(report.date_traitement)}
                            </dd>
                          </div>
                        )}
                      </dl>

                      {report.description && (
                        <p className="mt-5 whitespace-pre-line break-words rounded-xl bg-[#fcfaf7] p-4 text-sm leading-6">
                          {report.description}
                        </p>
                      )}

                     {annonce && (
                        <Link
                                to={`/admin/annonces/${annonce.id}`}
                                className="mt-5 inline-block text-sm font-medium text-atba-clay"
                                >
                                Consulter l’annonce →
                        </Link>
                        )}

                      {report.statut === 'en_attente' && (
                        <div className="mt-5 flex flex-wrap gap-3 border-t border-[#eee9e2] pt-5">
                          <button
                            type="button"
                            disabled={busyId !== null}
                            onClick={() => handleDecision(report, 'traite')}
                            className="rounded-full bg-atba-clay px-4 py-2.5 text-sm text-white disabled:opacity-50"
                          >
                            {busyId === report.id
                              ? 'Traitement…'
                              : 'Marquer comme traité'}
                          </button>

                          <button
                            type="button"
                            disabled={busyId !== null}
                            onClick={() => handleDecision(report, 'rejete')}
                            className="rounded-full border border-red-200 px-4 py-2.5 text-sm text-red-700 disabled:opacity-50"
                          >
                            Rejeter
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {lastPage > 1 && (
            <nav
              aria-label="Pagination des signalements"
              className="mt-8 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                disabled={page <= 1 || busyId !== null}
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
                disabled={page >= lastPage || busyId !== null}
                onClick={() => setPage(current => current + 1)}
                className="rounded-lg border border-[#e8e3dc] bg-white px-4 py-2 text-sm disabled:opacity-40"
              >
                Suivant →
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  )
}