import { useEffect, useState } from 'react'
import CityCard from '../components/home/CityCard'
import PropertyCard from '../components/property/PropertyCard'
import { getAnnonces } from '../services/annonces.js'
import { Link } from 'react-router'

const cities = [
  ['Tanger', '/images/tanger.webp'],
  ['Rabat', '/images/rabat.webp'],
  ['Marrakech', '/images/marrakech.webp'],
  ['Casablanca', '/images/casablanca.webp'],
]

export default function ExplorePage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProperties() {
      try {
        const result = await getAnnonces(undefined, controller.signal)

        if (!controller.signal.aborted) {
          setProperties(result.properties)
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
    }

    loadProperties()

    return () => controller.abort()
  }, [])

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-9">
      <h1 className="text-4xl tracking-tight">
        Explorer le Maroc
      </h1>

      <p className="mt-2 text-atba-muted">
        Choisissez votre ville et découvrez des annonces
        de vente et de location.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cities.map(([name, image]) => (
          <CityCard key={name} name={name} image={image} />
        ))}
      </div>

      <div className="mb-5 mt-14 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl">
          Quelques biens à découvrir
        </h2>

        <Link
          to="/annonces"
          className="text-sm font-medium text-atba-clay"
        >
          Voir toutes les annonces →
        </Link>
      </div>

      {loading ? (
        <p role="status" className="text-atba-muted">
          Chargement des annonces…
        </p>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
          {error}
        </p>
      ) : properties.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[#e8e3dc] p-8 text-atba-muted">
          Aucune annonce publiée pour le moment.
        </p>
      )}
    </main>
  )
}