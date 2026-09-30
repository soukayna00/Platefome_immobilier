import { useEffect, useState } from 'react'
import { Link } from 'react-router'

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProperties() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/mes-biens?page=${page}`, {
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Votre session a expiré. Reconnectez-vous.'
              : 'Impossible de charger vos biens.'
          )
        }

        const result = await response.json()

        if (!controller.signal.aborted) {
          setProperties(result.data)
          setTotal(result.total)
          setLastPage(result.last_page)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message || 'Impossible de charger vos biens.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadProperties()

    return () => controller.abort()
  }, [page])

  return (
    <main className="mx-auto min-h-[65vh] max-w-[1280px] px-5 py-12 lg:px-9">
      <Link
        to="/espace-proprietaire"
        className="text-sm text-atba-clay"
      >
        ← Espace propriétaire
      </Link>

      <h1 className="mt-4 text-4xl tracking-tight">
        Mes biens
      </h1>

      <p className="mb-7 mt-2 text-atba-muted">
        Retrouvez les logements enregistrés dans votre compte.
      </p>

      <Link
        to="/mes-biens/nouveau"
        className="mb-7 inline-block rounded-lg bg-atba-clay px-5 py-3 text-sm text-white"
      >
        + Ajouter un bien
      </Link>

      {loading ? (
        <p role="status" className="text-atba-muted">
          Chargement de vos biens…
        </p>
      ) : error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-5 text-red-700"
        >
          {error}
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-atba-muted">
            {total} bien{total > 1 ? 's' : ''}
          </p>

          {properties.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map(property => (
               <Link
                key={property.id}
                to={`/mes-biens/${property.id}`}
                className="block overflow-hidden rounded-xl border border-[#e8e3dc] bg-white shadow-sm transition hover:border-atba-clay hover:shadow-md focus-visible:outline-2 focus-visible:outline-atba-clay"
                >
                  {property.photos?.[0]?.url_photo ? (
                    <img
                      src={property.photos[0].url_photo}
                      alt={property.titre}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-atba-cream text-sm text-atba-muted">
                      Aucune photo disponible
                    </div>
                  )}

                  <div className="p-5">
                    <h2 className="text-lg font-bold">
                      {property.titre}
                    </h2>

                    <p className="mt-2 text-sm text-atba-muted">
                      {property.ville?.nom_ville}
                      {property.quartier && ` · ${property.quartier}`}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      <span>{Number(property.surface)} m²</span>
                      <span>{property.nbr_chambres} chambres</span>
                      <span>{property.type_bien?.libelle}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (

            <div className="rounded-xl border border-dashed border-[#e8e3dc] p-8">
              <h2 className="text-xl">
                Aucun bien enregistré
              </h2>

              <p className="mt-3 text-sm text-atba-muted">
                Cliquez sur « Ajouter un bien » pour enregistrer
                votre premier logement.
              </p>
            </div>
          )}

          {lastPage > 1 && (
            <nav
              aria-label="Pagination de mes biens"
              className="mt-8 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(current => current - 1)}
                className="rounded-lg border border-[#e8e3dc] px-4 py-2 text-sm disabled:opacity-40"
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
                className="rounded-lg border border-[#e8e3dc] px-4 py-2 text-sm disabled:opacity-40"
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