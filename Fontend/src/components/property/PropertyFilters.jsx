import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import SaveSearchForm from './SaveSearchForm'

export default function PropertyFilters({
  filters,
  onChange,
  transaction = '',
}) {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [cities, setCities] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveOpen, setSaveOpen] = useState(false)

  // La transaction passée par la page reste prioritaire.
  const effectiveTransaction =
    transaction
    || (location.pathname === '/acheter'
      ? 'vente'
      : location.pathname === '/louer'
        ? 'location'
        : '')

  useEffect(() => {
    const controller = new AbortController()

    async function loadCatalogues() {
      try {
        const responses = await Promise.all([
          fetch('/api/villes', {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          }),
          fetch('/api/types-bien', {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          }),
        ])

        if (responses.some(response => !response.ok)) {
          throw new Error(
            'Impossible de charger les villes et les types de biens.'
          )
        }

        const [cityData, typeData] = await Promise.all(
          responses.map(response => response.json())
        )

        if (!controller.signal.aborted) {
          setCities(cityData)
          setTypes(typeData)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message || 'Impossible de charger les filtres.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadCatalogues()

    return () => controller.abort()
  }, [])

  function changeFilter(name, value) {
    setSaveOpen(false)
    onChange({ ...filters, [name]: value })
  }

  function openSaveForm() {
    if (authLoading || loading || error) return

    if (!user) {
      navigate('/connexion', {
        state: {
          from: location.pathname + location.search,
        },
      })
      return
    }

    setSaveOpen(current => !current)
  }

  const field =
    'rounded-lg border border-[#e8e3dc] bg-white p-3 text-sm outline-none focus:border-atba-clay disabled:opacity-50'

  return (
    <div className="mb-6">
      <div className="grid gap-3 md:grid-cols-4">
        <select
          aria-label="Ville"
          value={filters.city || ''}
          disabled={loading || Boolean(error)}
          onChange={event =>
            changeFilter('city', event.target.value)
          }
          className={field}
        >
          <option value="">
            {loading ? 'Chargement des villes…' : 'Toutes les villes'}
          </option>

          {filters.city &&
            !cities.some(city => city.nom_ville === filters.city) && (
              <option value={filters.city}>{filters.city}</option>
            )}

          {cities.map(city => (
            <option key={city.id} value={city.nom_ville}>
              {city.nom_ville}
            </option>
          ))}
        </select>

        <select
          aria-label="Type de bien"
          value={filters.type || ''}
          disabled={loading || Boolean(error)}
          onChange={event =>
            changeFilter('type', event.target.value)
          }
          className={field}
        >
          <option value="">
            {loading ? 'Chargement des types…' : 'Tous les types'}
          </option>

          {filters.type &&
            !types.some(type => type.libelle === filters.type) && (
              <option value={filters.type}>{filters.type}</option>
            )}

          {types.map(type => (
            <option key={type.id} value={type.libelle}>
              {type.libelle}
            </option>
          ))}
        </select>

        <input
          aria-label="Quartier"
          maxLength={100}
          value={filters.quarter || ''}
          onChange={event =>
            changeFilter('quarter', event.target.value)
          }
          placeholder="Quartier"
          className={field}
        />

        <input
          aria-label="Budget maximum"
          type="number"
          min="0"
          max="9999999999.99"
          step="0.01"
          value={filters.max ?? ''}
          onChange={event =>
            changeFilter('max', event.target.value)
          }
          placeholder="Prix max (MAD)"
          className={field}
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={loading || authLoading || Boolean(error)}
          onClick={openSaveForm}
          aria-expanded={saveOpen && Boolean(user)}
          className="rounded-full border border-atba-clay px-5 py-2.5 text-sm text-atba-clay disabled:opacity-50"
        >
          {saveOpen && user
            ? 'Fermer le formulaire'
            : 'Enregistrer ma recherche'}
        </button>
      </div>

      {saveOpen && user && (
        <SaveSearchForm
          key={`${user.id}-${effectiveTransaction}`}
          filters={filters}
          cities={cities}
          types={types}
          transaction={effectiveTransaction}
          onClose={() => setSaveOpen(false)}
        />
      )}
    </div>
  )
}