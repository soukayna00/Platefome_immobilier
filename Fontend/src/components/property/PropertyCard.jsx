import { Link, useLocation, useNavigate } from 'react-router'
import { formatPrice } from '../../data/demoProperties'
import { useAtba } from '../../context/AtbaContext'
import { useAuth } from '../../context/AuthContext'

export default function PropertyCard({ property }) {
  const { favorites, toggleFavorite } = useAtba()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const saved = Boolean(user) && favorites.includes(property.id)

  function handleFavorite() {
    console.log('Clic favori — utilisateur connecté :', Boolean(user))

    if (!user) {
      navigate('/connexion', {
        state: {
          from: location.pathname + location.search,
        },
      })
      return
    }

    toggleFavorite(property.id)
  }

  return (
    <article className="overflow-hidden rounded-xl border border-[#f0ece7] bg-white shadow-[0_10px_30px_#0000000b]">
      <div className="relative h-56 overflow-hidden">
        <Link to={`/bien/${property.id}`}>
          <img
            src={property.image}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>

        <span className="absolute left-4 top-4 rounded bg-white px-2 py-1 text-xs font-bold">
          {property.transaction === 'vente' ? 'Vente' : 'Location'}
        </span>

        <button
          type="button"
          disabled={loading}
          aria-label={saved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={saved}
          onClick={handleFavorite}
          className={`absolute right-4 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-2xl disabled:opacity-50 ${
            saved ? 'text-atba-clay' : ''
          }`}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>

      <div className="p-4">
        <Link
          to={`/bien/${property.id}`}
          className="font-bold hover:text-atba-clay"
        >
          {property.title}
        </Link>

        <p className="mt-1 text-xs text-atba-muted">
          ⌖ {property.city} · {property.neighborhood}
        </p>

        <p className="mt-3 text-xl font-bold">
          {formatPrice(property)}
        </p>

        <div className="mt-3 flex gap-5 border-t border-[#e8e3dc] pt-3 text-xs text-atba-muted">
          <span>▣ {property.area} m²</span>
          <span>♧ {property.bedrooms} chambres</span>
        </div>
      </div>
    </article>
  )
}