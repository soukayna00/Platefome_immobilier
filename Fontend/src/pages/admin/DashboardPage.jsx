import { useEffect, useState } from 'react'
import { Link } from 'react-router'

const cards = [
  {
    key: 'utilisateurs',
    label: 'Utilisateurs',
    description: 'Comptes enregistrés',
  },
  {
    key: 'biens',
    label: 'Biens',
    description: 'Biens enregistrés sur la plateforme',
  },
  {
    key: 'annonces_publiees',
    label: 'Annonces publiées',
    description: 'Annonces visibles publiquement',
  },
  {
    key: 'signalements_en_attente',
    label: 'Signalements en attente',
    description: 'Signalements à examiner',
  },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadStats() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/admin/dashboard', {
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          const messages = {
            401: 'Votre session a expiré. Reconnectez-vous.',
            403: 'Accès réservé aux administrateurs actifs.',
            404: 'La route du tableau de bord est introuvable.',
          }

          throw new Error(
            messages[response.status]
            || 'Impossible de charger les statistiques.'
          )
        }

        const result = await response.json()

        if (!controller.signal.aborted) {
          setStats(result)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error.message || 'Impossible de charger le tableau de bord.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadStats()

    return () => controller.abort()
  }, [reload])

  return (
    <main className="px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-atba-clay">
            Vue d’ensemble
          </span>

          <h1 className="mt-3 text-3xl tracking-tight sm:text-4xl">
            Tableau de bord
          </h1>

          <p className="mt-3 text-sm leading-6 text-atba-muted">
            Suivez l’activité de la plateforme et les signalements
            à examiner.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => setReload(current => current + 1)}
          className="rounded-full border border-[#e8e3dc] bg-white px-5 py-2.5 text-sm transition hover:bg-atba-cream disabled:opacity-50"
        >
          Actualiser
        </button>
      </div>

      {loading ? (
        <p role="status" className="mt-8 text-sm text-atba-muted">
          Chargement des statistiques…
        </p>
      ) : error ? (
        <section
          role="alert"
          className="mt-8 rounded-xl bg-red-50 p-5 text-sm text-red-700"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setReload(current => current + 1)}
            className="mt-3 underline"
          >
            Réessayer
          </button>
        </section>
      ) : stats && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(card => (
              <section
                key={card.key}
                className="rounded-2xl border border-[#e8e3dc] bg-white p-6 shadow-sm"
              >
                <h2 className="text-sm font-medium text-atba-muted">
                  {card.label}
                </h2>

                <p className="mt-4 text-4xl font-semibold">
                  {stats[card.key]}
                </p>

                <p className="mt-3 text-xs leading-5 text-atba-muted">
                  {card.description}
                </p>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-[#e8e3dc] bg-white p-6 sm:p-8">
            <h2 className="text-xl font-medium">
              Modération des signalements
            </h2>

            <p className="mt-3 text-sm leading-6 text-atba-muted">
              {stats.signalements_en_attente > 0
                ? `${stats.signalements_en_attente} signalement(s) attendent votre examen.`
                : 'Aucun signalement en attente actuellement.'}
            </p>

            <Link
              to="/admin/signalements"
              className="mt-5 inline-block rounded-full bg-atba-clay px-5 py-2.5 text-sm text-white transition hover:brightness-95"
            >
              Consulter les signalements →
            </Link>
          </section>
        </>
      )}
    </main>
  )
}