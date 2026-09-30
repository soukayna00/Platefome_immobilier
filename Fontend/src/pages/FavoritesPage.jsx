import { Link } from 'react-router'
import PropertyCard from '../components/property/PropertyCard'
import { useAtba } from '../context/AtbaContext'

export default function FavoritesPage() {
  const {
    favoriteProperties,
    favoritesLoading,
    favoritesError,
    updatingFavorite,
  } = useAtba()

  return (
    <main className="mx-auto min-h-[65vh] max-w-[1280px] px-5 py-12 lg:px-9">
      <h1 className="text-4xl tracking-tight">
        Mes favoris
      </h1>

      <p className="mb-7 mt-2 text-atba-muted">
        Retrouvez les biens enregistrés dans votre compte.
      </p>

      {favoritesLoading ? (
        <p role="status" className="text-atba-muted">
          Chargement de vos favoris…
        </p>
      ) : favoritesError ? (
        <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
          {favoritesError}
        </p>
      ) : favoriteProperties.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-atba-muted">
            {favoriteProperties.length} bien
            {favoriteProperties.length > 1 ? 's' : ''} enregistré
            {favoriteProperties.length > 1 ? 's' : ''}
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteProperties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-[#e8e3dc] p-8">
          <h2 className="text-xl">
            Aucun favori pour le moment
          </h2>

          <p className="mt-3 text-sm text-atba-muted">
            Cliquez sur le cœur d’une annonce pour la retrouver ici.
          </p>

          <Link
            to="/explorer"
            className="mt-5 inline-block text-sm font-medium text-atba-clay"
          >
            Explorer les annonces →
          </Link>
        </div>
      )}

      {updatingFavorite && (
        <p role="status" className="mt-4 text-sm text-atba-muted">
          Mise à jour de vos favoris…
        </p>
      )}
    </main>
  )
}