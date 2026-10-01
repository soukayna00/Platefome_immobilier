import { useEffect, useRef, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router'
import { getAnnonce } from '../services/annonces.js'
import { useAtba } from '../context/AtbaContext'
import { useAuth } from '../context/AuthContext'
import VisitRequestForm from '../components/property/VisitRequestForm'

const priceFormatter = new Intl.NumberFormat('fr-MA', {
  maximumFractionDigits: 2,
})

export default function PropertyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const { favorites, toggleFavorite } = useAtba()
  const { user, loading: authLoading } = useAuth()

  const [property, setProperty] = useState(null)
  const [propertyLoading, setPropertyLoading] = useState(true)
  const [propertyError, setPropertyError] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [favoriteBusy, setFavoriteBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [visitOpen, setVisitOpen] = useState(false)

  const favoriteSubmitting = useRef(false)
  const visitPanelRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadProperty() {
      setPropertyLoading(true)
      setPropertyError('')
      setActionError('')
      setProperty(null)
      setSelectedPhoto(0)
      setVisitOpen(false)

      try {
        const result = await getAnnonce(id, controller.signal)

        if (!controller.signal.aborted) {
          setProperty(result)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setPropertyError(
            error.message || 'Impossible de charger l’annonce.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setPropertyLoading(false)
        }
      }
    }

    loadProperty()

    return () => controller.abort()
  }, [id])

  useEffect(() => {
    if (!visitOpen || !user) return

    visitPanelRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })

    visitPanelRef.current
      ?.querySelector('input[name="date_visite"]')
      ?.focus({ preventScroll: true })
  }, [visitOpen, user])

  const saved = Boolean(user) && favorites.includes(property?.id)
  const photos = property?.photos || []

  function requireLogin() {
    if (authLoading) return false

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

  async function handleFavorite() {
    if (!property || favoriteSubmitting.current || !requireLogin()) {
      return
    }

    favoriteSubmitting.current = true
    setFavoriteBusy(true)
    setActionError('')

    try {
      await toggleFavorite(property.id)
    } catch (error) {
      setActionError(
        error.message || 'Impossible de modifier vos favoris.'
      )
    } finally {
      favoriteSubmitting.current = false
      setFavoriteBusy(false)
    }
  }

  function handleContact() {
    if (!requireLogin()) return
    navigate('/messages')
  }

  function handleVisit() {
    if (!requireLogin()) return

    if (visitOpen) {
      visitPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      return
    }

    setVisitOpen(true)
  }

  function handleReport() {
    if (!requireLogin()) return
    alert('Le signalement sera bientôt relié à Laravel.')
  }

  if (propertyLoading) {
    return (
      <main
        role="status"
        className="mx-auto min-h-[65vh] max-w-[1280px] px-5 py-12"
      >
        Chargement de l’annonce…
      </main>
    )
  }

  if (propertyError || !property) {
    return (
      <main className="mx-auto min-h-[65vh] max-w-5xl px-5 py-20">
        <h1 className="text-3xl">Annonce indisponible</h1>

        <p role="alert" className="mt-4 text-atba-muted">
          {propertyError || 'Cette annonce est introuvable.'}
        </p>

        <Link to="/annonces" className="mt-6 block text-atba-clay">
          Retour aux annonces →
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-9">
      <Link to="/annonces" className="text-sm text-atba-clay">
        ← Retour aux annonces
      </Link>

      <h1 className="mt-4 text-3xl tracking-tight sm:text-4xl">
        {property.title}
      </h1>

      <p className="mb-7 mt-2 text-atba-muted">
        {property.city}
        {property.neighborhood && ` · ${property.neighborhood}`}
      </p>

      <div className="grid items-start gap-7 lg:grid-cols-[1.7fr_1fr]">
        <div>
          {photos.length > 0 ? (
            <>
              <img
                src={photos[selectedPhoto]}
                alt={`${property.title} — photo ${selectedPhoto + 1}`}
                className="h-[350px] w-full rounded-2xl object-cover md:h-[460px]"
              />

              {photos.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {photos.map((photo, index) => (
                    <button
                      key={`${photo}-${index}`}
                      type="button"
                      onClick={() => setSelectedPhoto(index)}
                      aria-label={`Afficher la photo ${index + 1}`}
                      aria-pressed={selectedPhoto === index}
                      className={`overflow-hidden rounded-xl border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atba-clay ${
                        selectedPhoto === index
                          ? 'border-atba-clay'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={photo}
                        alt=""
                        className="h-16 w-full object-cover sm:h-24"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-[350px] items-center justify-center rounded-2xl bg-atba-cream text-atba-muted">
              Aucune photo disponible
            </div>
          )}

          <section className="mt-6 rounded-2xl border border-[#e8e3dc] bg-white p-6">
            <h2 className="text-2xl">À propos du bien</h2>

            <p className="mt-4 whitespace-pre-line leading-7 text-atba-muted">
              {property.description || 'Aucune description renseignée.'}
            </p>

            <div className="mt-5 flex flex-wrap gap-6 border-t border-[#eee9e2] pt-5 text-sm">
              <span>{property.area} m²</span>
              <span>{property.bedrooms} chambres</span>
              <span>{property.bathrooms} salles de bain</span>
              <span>{property.propertyType}</span>
            </div>
          </section>
        </div>

        <aside className="rounded-2xl border border-[#e8e3dc] bg-white p-6 shadow-sm">
          <span className="text-xs uppercase tracking-widest text-atba-clay">
            {property.transaction === 'vente' ? 'Vente' : 'Location'}
          </span>

          <p className="my-4 text-3xl font-bold">
            {priceFormatter.format(property.price)} MAD

            {property.transaction === 'location' && (
              <span className="text-sm font-normal text-atba-muted">
                {' '}/ mois
              </span>
            )}
          </p>

          {actionError && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {actionError}
            </p>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={authLoading}
              onClick={handleContact}
              className="w-full rounded-xl bg-atba-clay p-3 text-white disabled:opacity-50"
            >
              Contacter le propriétaire
            </button>

            <button
              type="button"
              disabled={authLoading}
              onClick={handleVisit}
              aria-expanded={visitOpen && Boolean(user)}
              aria-controls="visit-request-panel"
              className="w-full rounded-xl border border-atba-ink p-3 disabled:opacity-50"
            >
              Demander une visite
            </button>

            {visitOpen && user && (
              <div
                id="visit-request-panel"
                ref={visitPanelRef}
                className="scroll-mt-24"
              >
                <VisitRequestForm
                  key={`${property.id}-${user.id}`}
                  annonceId={property.id}
                  onClose={() => setVisitOpen(false)}
                />
              </div>
            )}

            <button
              type="button"
              disabled={authLoading || favoriteBusy}
              onClick={handleFavorite}
              aria-pressed={saved}
              className="w-full rounded-xl border border-atba-ink p-3 disabled:opacity-50"
            >
              {favoriteBusy
                ? 'Enregistrement…'
                : saved
                  ? '♥ Retirer des favoris'
                  : '♡ Ajouter aux favoris'}
            </button>

            <button
              type="button"
              disabled={authLoading}
              onClick={handleReport}
              className="w-full p-2 text-sm text-atba-clay disabled:opacity-50"
            >
              ⚑ Signaler cette annonce
            </button>
          </div>

          <p className="mt-5 text-xs leading-5 text-atba-muted">
            Les visites nécessitent la confirmation du propriétaire.
            Les signalements ne sont pas encore enregistrés.
          </p>
        </aside>
      </div>
    </main>
  )
}