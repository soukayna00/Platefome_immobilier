import { useRef, useState } from 'react'
import { createRecherche } from '../../services/recherches.js'

export default function SaveSearchForm({
  filters,
  cities,
  types,
  transaction = '',
  onClose,
}) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const sending = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (sending.current || success) return

    setError('')
    setFieldErrors({})

    const city = cities.find(
      item => item.nom_ville === filters.city
    )

    const type = types.find(
      item => item.libelle === filters.type
    )

    if (filters.city && !city) {
      setError('Sélectionnez une ville disponible dans la liste.')
      return
    }

    if (filters.type && !type) {
      setError('Sélectionnez un type de bien disponible dans la liste.')
      return
    }

    if (!name.trim()) {
      setFieldErrors({
        nom_recherche: ['Donnez un nom à votre recherche.'],
      })
      return
    }

    sending.current = true
    setSubmitting(true)

    try {
      await createRecherche({
        nom_recherche: name.trim(),
        type_transaction: transaction || null,
        ville_id: city?.id ?? null,
        type_bien_id: type?.id ?? null,
        quartier: filters.quarter?.trim() || null,
        prix_max:
          filters.max !== ''
          && filters.max !== undefined
          && filters.max !== null
            ? filters.max
            : null,
      })

      setSuccess(true)
    } catch (error) {
      setError(
        error.message || 'Impossible d’enregistrer cette recherche.'
      )
      setFieldErrors(error.errors || {})
    } finally {
      sending.current = false
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <section className="mt-4 rounded-xl bg-green-50 p-5">
        <p role="status" className="text-sm text-green-800">
          Votre recherche a été enregistrée.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-sm text-green-800 underline"
        >
          Fermer
        </button>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-2xl border border-[#e8e3dc] bg-[#fcfaf7] p-5"
    >
      <h2 className="text-lg font-medium">
        Enregistrer ma recherche
      </h2>

      <p className="mt-2 text-sm leading-6 text-atba-muted">
        Les critères actuellement sélectionnés seront sauvegardés.
      </p>

      <fieldset disabled={submitting} className="mt-4">
        <label className="block text-sm">
          Nom de la recherche

          <input
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Exemple : Appartement à Tanger"
            aria-invalid={Boolean(fieldErrors.nom_recherche)}
            className="mt-2 w-full rounded-xl border border-[#e8e3dc] bg-white px-4 py-3 outline-none focus:border-atba-clay"
          />
        </label>

        {Object.entries(fieldErrors).map(([field, messages]) => (
          <p key={field} className="mt-2 text-xs text-red-700">
            {Array.isArray(messages) ? messages[0] : messages}
          </p>
        ))}

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-atba-clay px-5 py-2.5 text-sm text-white disabled:opacity-50"
          >
            {submitting ? 'Enregistrement…' : 'Enregistrer'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e8e3dc] px-5 py-2.5 text-sm"
          >
            Annuler
          </button>
        </div>
      </fieldset>
    </form>
  )
}