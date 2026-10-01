import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import {
  getMyRecherches,
  deleteRecherche,
} from '../services/recherches.js'

const priceFormatter = new Intl.NumberFormat('fr-MA', {
  maximumFractionDigits: 2,
})

function searchUrl(search) {
  const path =
    search.type_transaction === 'vente'
      ? '/acheter'
      : search.type_transaction === 'location'
        ? '/louer'
        : '/annonces'

  const params = new URLSearchParams()

  if (search.ville?.nom_ville) {
    params.set('city', search.ville.nom_ville)
  }

  if (search.type_bien?.libelle) {
    params.set('type', search.type_bien.libelle)
  }

  if (search.quartier) {
    params.set('quarter', search.quartier)
  }

  if (search.prix_max !== null && search.prix_max !== undefined) {
    params.set('max', String(search.prix_max))
  }

  const query = params.toString()

  return query ? `${path}?${query}` : path
}

export default function MySearchesPage() {
  const { user } = useAuth()

  const [searches, setSearches] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [reload, setReload] = useState(0)

  const deleting = useRef(false)
  const currentUserId = useRef(user?.id)
  currentUserId.current = user?.id

  useEffect(() => {
    const controller = new AbortController()

    async function loadSearches() {
      setLoading(true)
      setError('')
      setSearches([])
      setTotal(0)

      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const result = await getMyRecherches(
          page,
          controller.signal
        )

        if (controller.signal.aborted) return

        const finalPage = Math.max(1, result.last_page)

        if (page > finalPage) {
          setPage(finalPage)
          return
        }

        setSearches(result.data)
        setTotal(result.total)
        setLastPage(finalPage)
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error.message || 'Impossible de charger vos recherches.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadSearches()

    return () => controller.abort()
  }, [user?.id, page, reload])

  async function handleDelete(search) {
    if (deleting.current) return

    if (!window.confirm(
      `Supprimer la recherche « ${search.nom_recherche} » ?`
    )) {
      return
    }

    const requestUserId = user?.id

    deleting.current = true
    setBusyId(search.id)
    setActionError('')
    setSuccess('')

    try {
      await deleteRecherche(search.id)

      if (currentUserId.current !== requestUserId) return

      setSuccess('La recherche a été supprimée.')
      setReload(current => current + 1)
    } catch (error) {
      if (currentUserId.current === requestUserId) {
        setActionError(
          error.message || 'Impossible de supprimer cette recherche.'
        )
      }
    } finally {
      deleting.current = false
      setBusyId(null)
    }
  }

  return (
    <main className="min-h-[65vh] bg-[#f7f4ef] px-5 py-10 lg:px-9">
      <div className="mx-auto max-w-6xl">
        <Link to="/espace-recherche" className="text-sm text-atba-clay">
          ← Espace Recherche
        </Link>

        <div className="mb-8 mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl tracking-tight sm:text-4xl">
              Mes recherches
            </h1>

            <p className="mt-3 text-sm text-atba-muted">
              Retrouvez vos critères et relancez vos recherches.
            </p>
          </div>

          <Link
            to="/annonces"
            className="rounded-full bg-atba-clay px-5 py-2.5 text-sm text-white"
          >
            Nouvelle recherche →
          </Link>
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
            Chargement de vos recherches…
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
              {total} recherche{total > 1 ? 's' : ''}
            </p>

            {searches.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-[#ded5ca] bg-white p-8">
                <h2 className="text-xl">
                  Aucune recherche enregistrée
                </h2>

                <p className="mt-3 text-sm leading-6 text-atba-muted">
                  Sélectionnez vos critères sur la page des annonces,
                  puis cliquez sur « Enregistrer ma recherche ».
                </p>
              </section>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {searches.map(search => (
                  <article
                    key={search.id}
                    className="rounded-2xl border border-[#e8e3dc] bg-white p-6 shadow-sm"
                  >
                    <span className="rounded-full bg-atba-cream px-3 py-1.5 text-xs">
                      {search.type_transaction === 'vente'
                        ? 'Vente'
                        : search.type_transaction === 'location'
                          ? 'Location'
                          : 'Vente et location'}
                    </span>

                    <h2 className="mt-5 break-words text-xl font-medium">
                      {search.nom_recherche}
                    </h2>

                    <dl className="mt-5 space-y-3 text-sm">
                      {[
                        ['Ville', search.ville?.nom_ville || 'Toutes les villes'],
                        ['Type', search.type_bien?.libelle || 'Tous les types'],
                        ['Quartier', search.quartier || 'Tous les quartiers'],
                        [
                          'Budget maximum',
                          search.prix_max != null
                            ? `${priceFormatter.format(Number(search.prix_max))} MAD`
                            : 'Sans limite',
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex justify-between gap-4"
                        >
                          <dt className="text-atba-muted">{label}</dt>
                          <dd className="text-right font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-6 flex flex-wrap gap-3 border-t border-[#eee9e2] pt-5">
                      <Link
                        to={searchUrl(search)}
                        className="rounded-full bg-atba-clay px-4 py-2.5 text-sm text-white"
                      >
                        Relancer la recherche →
                      </Link>

                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => handleDelete(search)}
                        className="rounded-full border border-red-200 px-4 py-2.5 text-sm text-red-700 disabled:opacity-50"
                      >
                        {busyId === search.id
                          ? 'Suppression…'
                          : 'Supprimer'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {lastPage > 1 && (
              <nav
                aria-label="Pagination des recherches"
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
      </div>
    </main>
  )
}