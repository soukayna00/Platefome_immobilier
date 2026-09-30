import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import PropertyCard from '../components/property/PropertyCard'
import PropertyFilters from '../components/property/PropertyFilters'
import { getAnnonces } from '../services/annonces'
export default function ListingsPage({ transaction }) {
  const [params] = useSearchParams()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)

  const [filters, setFilters] = useState({
    city: params.get('city') || '',
    quarter: params.get('quarter') || '',
    type: params.get('type') || '',
    max: params.get('max') || '',
  })

  // Synchroniser les filtres avec les paramètres de l’adresse.
  useEffect(() => {
    setFilters({
      city: params.get('city') || '',
      quarter: params.get('quarter') || '',
      type: params.get('type') || '',
      max: params.get('max') || '',
    })
  }, [params])

  // Charger les annonces depuis Laravel.
  useEffect(() => {
    const controller = new AbortController()

    async function loadAnnonces() {
      setLoading(true)
      setError('')
      setProperties([])
      setTotal(0)

      try {
        const result = await getAnnonces(
          transaction,
          controller.signal
        )

        if (!controller.signal.aborted) {
          setProperties(result.properties)
          setTotal(result.total)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message || 'Chargement impossible.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadAnnonces()

    return () => controller.abort()
  }, [transaction])

  // Filtrer les annonces actuellement chargées.
  const results = useMemo(() => {
    return properties.filter(property =>
      (!filters.city || property.city === filters.city) &&
      (!filters.quarter ||
        property.neighborhood
          .toLowerCase()
          .includes(filters.quarter.toLowerCase())) &&
      (!filters.type || property.propertyType === filters.type) &&
      (!filters.max || property.price <= Number(filters.max))
    )
  }, [properties, filters])

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

      <PropertyFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <p role="status" className="py-12 text-center text-atba-muted">
          Chargement des annonces…
        </p>
      ) : error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-5 text-sm text-red-700"
        >
          {error}
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-atba-muted">
            {results.length} annonce{results.length > 1 ? 's' : ''}
            {' '}affichée{results.length > 1 ? 's' : ''}
          </p>

          {total > properties.length && (
            <p className="mb-4 text-sm text-atba-muted">
              Seules les {properties.length} premières annonces sont
              chargées. Les filtres s’appliquent à cette sélection.
            </p>
          )}

          {results.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#e8e3dc] p-8 text-atba-muted">
              Aucun bien ne correspond à ces critères.
            </p>
          )}
        </>
      )}
    </main>
  )
}