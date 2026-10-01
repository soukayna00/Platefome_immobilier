import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  getAdminAnnonces,
  updateAdminAnnonceStatus,
} from '../../services/admin/annonces.js'

const statuses = {
  brouillon: 'Brouillon',
  publiee: 'Publiée',
  suspendue: 'Suspendue',
}

const statusClasses = {
  brouillon: 'bg-gray-100 text-gray-700',
  publiee: 'bg-green-50 text-green-800',
  suspendue: 'bg-red-50 text-red-700',
}

const priceFormatter = new Intl.NumberFormat('fr-MA', {
  maximumFractionDigits: 2,
})

const fieldClass =
  'mt-2 w-full rounded-xl border border-[#e8e3dc] bg-white px-4 py-3 text-sm outline-none focus:border-atba-clay disabled:opacity-50'

export default function AdminAnnoncesPage() {
  const [annonces, setAnnonces] = useState([])
  const [status, setStatus] = useState('')
  const [transaction, setTransaction] = useState('')
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

    async function loadAnnonces() {
      setLoading(true)
      setError('')

      try {
        const result = await getAdminAnnonces(
          status,
          page,
          controller.signal,
          transaction
        )

        if (controller.signal.aborted) return

        const finalPage = Math.max(1, result.last_page)

        if (page > finalPage) {
          setPage(finalPage)
          return
        }

        setAnnonces(result.data)
        setTotal(result.total)
        setLastPage(finalPage)
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error.message || 'Impossible de charger les annonces.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadAnnonces()

    return () => controller.abort()
  }, [status, transaction, page, reload])

  function changeFilter(setter, value) {
    setter(value)
    setPage(1)
    setSuccess('')
    setActionError('')
  }

  async function handleStatusChange(annonce) {
    if (actionLock.current) return

    const nextStatus =
      annonce.statut_annonce === 'publiee'
        ? 'suspendue'
        : annonce.statut_annonce === 'suspendue'
          ? 'publiee'
          : null

    if (!nextStatus) return

    const confirmed = window.confirm(
      nextStatus === 'suspendue'
        ? 'Suspendre cette annonce ? Elle ne sera plus visible sur le site public.'
        : 'Rétablir cette annonce ? Elle sera de nouveau visible sur le site public.'
    )

    if (!confirmed) return

    actionLock.current = true
    setBusyId(annonce.id)
    setActionError('')
    setSuccess('')

    try {
      await updateAdminAnnonceStatus(annonce.id, nextStatus)

      setSuccess(
        nextStatus === 'suspendue'
          ? 'L’annonce a été suspendue.'
          : 'L’annonce a été rétablie.'
      )

      setReload(current => current + 1)
    } catch (error) {
      setActionError(
        error.message || 'Impossible de modifier cette annonce.'
      )
    } finally {
      actionLock.current = false
      setBusyId(null)
    }
  }

  const controlsDisabled = loading || busyId !== null

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-atba-clay">
            Modération
          </span>

          <h1 className="mt-3 text-3xl tracking-tight">
            Gestion des annonces
          </h1>

          <p className="mt-3 text-sm leading-6 text-atba-muted">
            Consultez les annonces et gérez leur visibilité.
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

      <div className="mb-6 grid max-w-2xl gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          Statut

          <select
            value={status}
            disabled={controlsDisabled}
            onChange={event =>
              changeFilter(setStatus, event.target.value)
            }
            className={fieldClass}
          >
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillons</option>
            <option value="publiee">Publiées</option>
            <option value="suspendue">Suspendues</option>
          </select>
        </label>

        <label className="block text-sm">
          Transaction

          <select
            value={transaction}
            disabled={controlsDisabled}
            onChange={event =>
              changeFilter(setTransaction, event.target.value)
            }
            className={fieldClass}
          >
            <option value="">Vente et location</option>
            <option value="vente">Vente</option>
            <option value="location">Location</option>
          </select>
        </label>
      </div>

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
          Chargement des annonces…
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
            {total} annonce{total > 1 ? 's' : ''}
          </p>

          {annonces.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-[#ded5ca] bg-white p-8">
              <h2 className="text-xl">Aucune annonce</h2>

              <p className="mt-3 text-sm text-atba-muted">
                Aucune annonce ne correspond à ces filtres.
              </p>
            </section>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {annonces.map(annonce => {
                const property = annonce.bien
                const author = annonce.auteur
                const authorName = [author?.prenom, author?.nom]
                  .filter(Boolean)
                  .join(' ')

                const canChangeStatus = [
                  'publiee',
                  'suspendue',
                ].includes(annonce.statut_annonce)

                return (
                  <article
                    key={annonce.id}
                    className="overflow-hidden rounded-2xl border border-[#e8e3dc] bg-white shadow-sm"
                  >
                    {property?.photos?.[0]?.url_photo ? (
                      <img
                        src={property.photos[0].url_photo}
                        alt={property.titre || 'Bien immobilier'}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-atba-cream text-sm text-atba-muted">
                        Aucune photo disponible
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs ${
                            statusClasses[annonce.statut_annonce]
                              || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statuses[annonce.statut_annonce]
                            || annonce.statut_annonce}
                        </span>

                        <span className="text-xs text-atba-muted">
                          Annonce #{annonce.id}
                        </span>
                      </div>

                      <h2 className="mt-4 text-lg font-medium">
                        {property?.titre || 'Bien indisponible'}
                      </h2>

                      <p className="mt-2 text-sm text-atba-muted">
                        {property?.ville?.nom_ville}
                        {property?.quartier && ` · ${property.quartier}`}
                      </p>

                      <p className="mt-4 text-xl font-bold">
                        {priceFormatter.format(Number(annonce.prix))} MAD
                        {annonce.type_transaction === 'location' && (
                          <span className="text-sm font-normal text-atba-muted">
                            {' '}/ mois
                          </span>
                        )}
                      </p>

                      <dl className="mt-5 space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-atba-muted">Auteur</dt>
                          <dd className="text-right">
                            {authorName || 'Utilisateur'}
                          </dd>
                        </div>

                        <div className="flex justify-between gap-4">
                          <dt className="text-atba-muted">Transaction</dt>
                          <dd>
                            {annonce.type_transaction === 'vente'
                              ? 'Vente'
                              : 'Location'}
                          </dd>
                        </div>

                        <div className="flex justify-between gap-4">
                          <dt className="text-atba-muted">Surface</dt>
                          <dd>
                            {property?.surface != null
                              ? `${Number(property.surface)} m²`
                              : 'Non renseignée'}
                          </dd>
                        </div>
                      </dl>

                      {property?.description && (
                        <p className="mt-5 line-clamp-3 whitespace-pre-line break-words text-sm leading-6 text-atba-muted">
                          {property.description}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#eee9e2] pt-5">
                       <Link
                            to={`/admin/annonces/${annonce.id}`}
                            className="rounded-full border border-[#e8e3dc] px-4 py-2.5 text-sm text-atba-clay"
                            >
                            Consulter l’annonce →
                            </Link>

                        {canChangeStatus && (
                          <button
                            type="button"
                            disabled={busyId !== null}
                            onClick={() => handleStatusChange(annonce)}
                            className={`rounded-full px-4 py-2.5 text-sm disabled:opacity-50 ${
                              annonce.statut_annonce === 'publiee'
                                ? 'border border-red-200 text-red-700'
                                : 'bg-atba-clay text-white'
                            }`}
                          >
                            {busyId === annonce.id
                              ? 'Enregistrement…'
                              : annonce.statut_annonce === 'publiee'
                                ? 'Suspendre'
                                : 'Rétablir'}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {lastPage > 1 && (
            <nav
              aria-label="Pagination des annonces"
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