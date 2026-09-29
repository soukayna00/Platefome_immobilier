import {Link,useLocation,useNavigate,useParams,} from 'react-router'
import { demoProperties, formatPrice } from '../data/demoProperties'
import { useAtba } from '../context/AtbaContext'
import { useAuth } from '../context/AuthContext'

export default function PropertyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { favorites, toggleFavorite } = useAtba()
  const { user, loading } = useAuth()

  const property = demoProperties.find(item => item.id === Number(id))
  const saved = Boolean(user) && favorites.includes(property?.id)

  function requireLogin() {
    if (!user) {
      navigate('/connexion', {
        state: {
          from: location.pathname + location.search,
        },
      })
      return false
    }

    return true
  }

  function handleFavorite() {
    if (!requireLogin()) return
    toggleFavorite(property.id)
  }

  function handleContact() {
    if (!requireLogin()) return
    navigate('/messages')
  }

  function handleVisit() {
    if (!requireLogin()) return
    alert('La demande de visite sera bientôt reliée à Laravel.')
  }

  function handleReport() {
    if (!requireLogin()) return
    alert('Le signalement sera bientôt relié à Laravel.')
  }

  if (!property) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-20">
        <h1 className="text-3xl">Bien introuvable</h1>
        <Link to="/explorer" className="mt-4 block text-atba-clay">
          Explorer les biens →
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-9">
      <Link to="/explorer" className="text-sm text-atba-clay">
        ← Retour aux annonces
      </Link>

      <h1 className="mt-4 text-4xl tracking-tight">
        {property.title}
      </h1>

      <p className="mb-7 mt-2 text-atba-muted">
        ⌖ {property.city} · {property.neighborhood}
      </p>

      <div className="grid gap-7 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <img
            src={property.image}
            alt={property.title}
            className="h-[350px] w-full rounded-xl object-cover md:h-[460px]"
          />

          <div className="mt-3 grid grid-cols-3 gap-3">
            <img
              src={property.image}
              alt="Photographie principale du bien"
              className="h-24 w-full rounded-lg object-cover"
            />
            <img
              src="/images/interior.webp"
              alt="Ambiance intérieure illustrative"
              className="h-24 w-full rounded-lg object-cover"
            />
            <img
              src="/images/owner.webp"
              alt="Photographie secondaire illustrative"
              className="h-24 w-full rounded-lg object-cover"
            />
          </div>

          <section className="mt-6 rounded-xl border border-[#e8e3dc] p-6">
            <h2 className="text-2xl">À propos du bien</h2>

            <p className="mt-3 text-atba-muted">
              Annonce fictive pour illustrer la fiche ATBA.
              Les caractéristiques et photographies secondaires
              sont des exemples.
            </p>

            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              <span>{property.area} m²</span>
              <span>{property.bedrooms} chambres</span>
              <span>{property.propertyType}</span>
            </div>
          </section>
        </div>

        <aside>
          <div className="rounded-xl border border-[#e8e3dc] bg-white p-6 shadow-sm">
            <span className="text-xs uppercase tracking-widest text-atba-clay">
              {property.transaction === 'vente' ? 'Vente' : 'Location'}
            </span>

            <p className="my-4 text-3xl font-bold">
              {formatPrice(property)}
            </p>

            <p className="mb-5 text-xs text-atba-muted">
              Bien de démonstration — les actions de visite et de
              signalement ne sont pas encore enregistrées.
            </p>

            <div className="grid gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={handleContact}
                className="rounded-lg bg-atba-clay p-3 text-center text-white disabled:opacity-50"
              >
                Contacter le propriétaire
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleVisit}
                className="rounded-lg border border-atba-ink p-3 disabled:opacity-50"
              >
                Demander une visite
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleFavorite}
                aria-pressed={saved}
                className="rounded-lg border border-atba-ink p-3 disabled:opacity-50"
              >
                {saved
                  ? '♥ Retirer des favoris'
                  : '♡ Ajouter aux favoris'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleReport}
                className="p-2 text-sm text-atba-clay disabled:opacity-50"
              >
                ⚑ Signaler cette annonce
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}