import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import PropertyCard from '../components/property/PropertyCard'
import PropertyFilters from '../components/property/PropertyFilters'
import { getAnnonces } from '../services/annonces.js'

export default function ListingsPage({ transaction }) {
  const [params, setParams] = useSearchParams()

  const city = params.get('city') || ''
  const type = params.get('type') || ''
  const quarter = params.get('quarter') || ''
  const max = params.get('max') || ''

  const requestedPage = Number(params.get('page') || 1)
  const page = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1

  const filters = { city, type, quarter, max }

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError('')

    // Attend un court instant pour éviter une requête à chaque frappe.
    const timer = setTimeout(async () => {
      try {
        const result = await getAnnonces(
          transaction,
          controller.signal,
          { city, type, quarter, max },
          page
        )

        if (!controller.signal.aborted) {
          setProperties(result.properties)
          setTotal(result.total)
          setLastPage(result.lastPage)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message || 'Impossible de charger les annonces.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [transaction, city, type, quarter, max, page])

  function changeFilters(nextFilters) {
    const nextParams = new URLSearchParams(params)

    for (const key of ['city', 'type', 'quarter', 'max']) {
      const value = nextFilters[key]

      if (value !== undefined && value !== null && value !== '') {
        nextParams.set(key, String(value))
      } else {
        nextParams.delete(key)
      }
    }

    nextParams.delete('page')
    setParams(nextParams, { replace: true })
  }

  function changePage(nextPage) {
    const nextParams = new URLSearchParams(params)

    if (nextPage === 1) {
      nextParams.delete('page')
    } else {
      nextParams.set('page', String(nextPage))
    }

    setParams(nextParams)
  }

  return (
    <main className="mx-auto min-h-[65vh] max-w-[1280px] px-5 py-12 lg:px-9">
      <h1 className="text-4xl tracking-tight">
        {transaction === 'vente'
          ? 'Acheter un bien'
          : transaction === 'location'
            ? 'Louer un bien'
            : 'Explorer les annonces'}
      </h1>

      <p className="mb-7 mt-2 text-atba-muted">
        Découvrez des biens proposés directement par des particuliers.
      </p>

      <PropertyFilters filters={filters} onChange={changeFilters} />

      {loading ? (
        <p role="status" className="text-atba-muted">
          Chargement des annonces…
        </p>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
          {error}
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-atba-muted">
            {total} annonce{total > 1 ? 's' : ''}
          </p>

          {properties.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#e8e3dc] p-8 text-atba-muted">
              {total > 0
                ? 'Cette page ne contient aucune annonce. Revenez à la première page.'
                : 'Aucun bien ne correspond à ces critères.'}
            </p>
          )}

          {(lastPage > 1 || page > 1) && (
            <nav
              aria-label="Pagination des annonces"
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
                className="rounded-lg border border-[#e8e3dc] px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Précédent
              </button>

              <span className="text-sm text-atba-muted">
                Page {page} sur {lastPage}
              </span>

              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => changePage(page + 1)}
                className="rounded-lg border border-[#e8e3dc] px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant →
              </button>

              {page > lastPage && (
                <button
                  type="button"
                  onClick={() => changePage(1)}
                  className="text-sm text-atba-clay underline"
                >
                  Première page
                </button>
              )}
            </nav>
          )}
        </>
      )}
    </main>
  )
}