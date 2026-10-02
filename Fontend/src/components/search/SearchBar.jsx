import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

export default function SearchBar() {
  const navigate = useNavigate()

  const [transaction, setTransaction] = useState('vente')
  const [city, setCity] = useState('')
  const [quarter, setQuarter] = useState('')
  const [type, setType] = useState('')
  const [max, setMax] = useState('')

  const [cities, setCities] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          throw new Error('Impossible de charger les villes et les types.')
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

  function submit(event) {
    event.preventDefault()

    const params = new URLSearchParams()
    const criteria = {
      city,
      quarter: quarter.trim(),
      type,
      max,
    }

    for (const [key, value] of Object.entries(criteria)) {
      if (value !== '') {
        params.set(key, value)
      }
    }

    const path = transaction === 'vente' ? '/acheter' : '/louer'
    const query = params.toString()

    navigate(query ? `${path}?${query}` : path)
  }

  const field =
    'min-w-0 rounded-lg border border-[#e8e3dc] bg-white px-3 py-2'

  const label = 'mb-1 block text-[11px] text-atba-muted'

  const input =
    'w-full bg-transparent text-sm outline-none disabled:opacity-50'

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-[1130px] rounded-xl bg-white p-3 text-atba-ink shadow-xl"
    >
      <div className="mb-3 flex gap-1">
        {[
          ['vente', 'Acheter'],
          ['location', 'Louer'],
        ].map(([value, text]) => (
          <button
            key={value}
            type="button"
            aria-pressed={transaction === value}
            onClick={() => setTransaction(value)}
            className={`rounded-lg px-7 py-2 text-xs ${
              transaction === value
                ? 'bg-atba-clay text-white'
                : 'bg-atba-cream'
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <div className={field}>
          <label htmlFor="search-city" className={label}>
            Ville
          </label>

          <select
            id="search-city"
            value={city}
            disabled={loading || Boolean(error)}
            onChange={event => setCity(event.target.value)}
            className={input}
          >
            <option value="">
              {loading ? 'Chargement…' : 'Toutes les villes'}
            </option>

            {cities.map(city => (
              <option key={city.id} value={city.nom_ville}>
                {city.nom_ville}
              </option>
            ))}
          </select>
        </div>

        <div className={field}>
          <label htmlFor="search-quarter" className={label}>
            Quartier
          </label>

          <input
            id="search-quarter"
            value={quarter}
            maxLength={100}
            onChange={event => setQuarter(event.target.value)}
            placeholder="Tous les quartiers"
            className={input}
          />
        </div>

        <div className={field}>
          <label htmlFor="search-type" className={label}>
            Type de bien
          </label>

          <select
            id="search-type"
            value={type}
            disabled={loading || Boolean(error)}
            onChange={event => setType(event.target.value)}
            className={input}
          >
            <option value="">
              {loading ? 'Chargement…' : 'Tous les biens'}
            </option>

            {types.map(type => (
              <option key={type.id} value={type.libelle}>
                {type.libelle}
              </option>
            ))}
          </select>
        </div>

        <div className={field}>
          <label htmlFor="search-max" className={label}>
            Budget max (MAD)
          </label>

          <input
            id="search-max"
            type="number"
            min="0"
            step="any"
            value={max}
            onChange={event => setMax(event.target.value)}
            placeholder="Sans limite"
            className={input}
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-atba-clay px-6 py-3 text-sm font-bold text-white hover:bg-[#9e4128] sm:col-span-2 lg:col-span-1"
        >
          ⌕ Rechercher
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error} Vous pouvez rechercher par quartier et budget.
        </p>
      )}
    </form>
  )
}