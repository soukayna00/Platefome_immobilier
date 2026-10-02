import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import SearchBar from '../components/search/SearchBar'
import PropertyCard from '../components/property/PropertyCard'
import CityCard from '../components/home/CityCard'
import { getAnnonces } from '../services/annonces.js'

const cities = [
  ['Tanger', '/images/tanger.webp'],
  ['Rabat', '/images/rabat.webp'],
  ['Marrakech', '/images/marrakech.webp'],
  ['Casablanca', '/images/casablanca.webp'],
]
const features = [
  [
    '⌕',
    'Enregistrer une recherche',
    'Sauvegardez vos critères et relancez votre recherche.',
  ],
  [
    '♡',
    'Retrouver mes favoris',
    'Gardez les annonces qui vous intéressent.',
  ],
  [
    '▤',
    'Suivre mes visites',
    'Consultez vos demandes et les réponses des propriétaires.',
  ],
]

const indicators = [
  ['✓', 'E-mail vérifié', 'Adresse e-mail confirmée.'],
  ['▤', 'Annonce contrôlée', 'Informations examinées.'],
  [
    '⚑',
    'Signaler une annonce',
    'Signalement examiné par la modération.',
  ],
]

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProperties() {
      try {
        const result = await getAnnonces(undefined, controller.signal)

        if (!controller.signal.aborted) {
          setProperties(result.properties.slice(0, 6))
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
    <main>
      {/* Présentation et recherche */}
      <section className="flex min-h-[650px] items-center bg-[linear-gradient(90deg,rgba(19,27,26,.48),rgba(19,27,26,.12)_67%),url('/images/hero.webp')] bg-cover bg-center pt-24 text-white">
        <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-9">
          <h1 className="max-w-3xl text-5xl leading-[1.04] tracking-[-.05em] sm:text-6xl lg:text-[73px]">
            Votre prochain
            <br />
            chez-vous, en direct.
          </h1>

          <p className="mb-8 mt-3 text-lg sm:text-xl">
            Achetez ou louez entre particuliers au Maroc.
          </p>

          <SearchBar />
        </div>
      </section>

      {/* Annonces chargées depuis Laravel */}
      <section className="mx-auto max-w-[1280px] px-5 py-16 lg:px-9">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-3xl tracking-tight sm:text-4xl">
            Des biens à découvrir
          </h2>

          <Link
            to="/explorer"
            className="text-xs font-bold text-atba-clay"
          >
            Explorer les annonces →
          </Link>
        </div>

        {loading ? (
          <p role="status" className="text-atba-muted">
            Chargement des annonces…
          </p>
        ) : error ? (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-5 text-red-700"
          >
            {error}
          </p>
        ) : properties.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        ) : (
          <p className="text-atba-muted">
            Aucune annonce publiée pour le moment.
          </p>
        )}
      </section>

      {/* Contact avec les propriétaires */}
      <section className="grid md:grid-cols-2" id="contact">
        <div className="min-h-[360px] bg-[url('/images/interior.webp')] bg-cover bg-center md:min-h-[440px]" />

        <div className="flex flex-col items-start justify-center px-6 py-12 md:px-12 lg:px-20">
          <span className="mb-4 h-0.5 w-8 bg-atba-clay" />

          <h2 className="text-3xl leading-tight tracking-tight sm:text-4xl">
            Échangez directement
            <br />
            avec le propriétaire
          </h2>

          <p className="mt-4 max-w-md leading-7 text-atba-muted">
            Posez vos questions, obtenez plus d’informations et
            organisez une visite. Sur ATBA, vous êtes en contact
            direct avec le propriétaire.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/messages"
              className="rounded-full bg-atba-clay px-6 py-3 text-sm text-white"
            >
              Contacter
            </Link>

            <Link
              to="/acheter"
              className="rounded-full border border-atba-ink px-6 py-3 text-sm"
            >
              Demander une visite
            </Link>
          </div>
        </div>
      </section>

      {/* Présentation des fonctionnalités */}
      <section className="bg-atba-cream py-10">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-9">
          <h2 className="mb-7 text-3xl tracking-tight">
            Votre recherche, à votre rythme
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map(([icon, title, description]) => (
              <div key={title} className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f0e5dc] text-2xl text-atba-clay">
                  {icon}
                </span>

                <div>
                  <strong className="text-sm">{title}</strong>
                  <p className="text-xs text-atba-muted">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Espace propriétaire */}
      <section className="grid md:grid-cols-2" id="proprietaire">
        <div className="flex flex-col items-start justify-center px-6 py-12 md:px-12 lg:px-20">
          <span className="mb-4 h-0.5 w-8 bg-atba-clay" />

          <h2 className="text-3xl tracking-tight sm:text-4xl">
            Vous avez un bien ?
          </h2>

          <p className="mt-4 max-w-md leading-7 text-atba-muted">
            Ajoutez votre bien, puis publiez une annonce de vente
            ou de location. Échangez directement avec les
            particuliers intéressés.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              to="/espace-proprietaire"
              className="rounded-full bg-atba-clay px-6 py-3 text-sm text-white"
            >
              Déposer une annonce →
            </Link>

            <Link
              to="/espace-proprietaire"
              className="text-sm text-atba-clay underline"
            >
              Gérer mes biens →
            </Link>
          </div>
        </div>

        <div className="min-h-[330px] bg-[url('/images/owner.webp')] bg-cover bg-center md:min-h-[400px]" />
      </section>

      {/* Navigation par ville */}
      <section
        className="mx-auto max-w-[1280px] px-5 py-14 lg:px-9"
        id="villes"
      >
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-3xl tracking-tight">
            Explorer par ville
          </h2>

          <Link to="/explorer" className="text-xs text-atba-clay">
            Voir toutes les villes →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cities.map(([name, image]) => (
            <CityCard key={name} name={name} image={image} />
          ))}
        </div>
      </section>

      {/* Présentation des indicateurs */}
      <section className="bg-atba-cream py-8">
        <div className="mx-auto grid max-w-[1280px] gap-5 px-5 text-sm md:grid-cols-3 lg:px-9">
          {indicators.map(([icon, title, description]) => (
            <div key={title} className="rounded-lg bg-white p-4">
              <strong className="text-atba-clay">
                {icon} {title}
              </strong>

              <p className="mt-1 text-xs text-atba-muted">
                {description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 px-5 text-center text-xs text-atba-muted">
          Ces indicateurs ne certifient pas la propriété juridique du bien.
        </p>
      </section>
    </main>
  )
}