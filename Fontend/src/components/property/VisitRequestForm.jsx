import { useRef, useState } from 'react'
import { createVisite } from '../../services/visites.js'

const fieldClass =
  'mt-2 w-full rounded-xl border border-[#e5ded5] bg-white px-4 py-3 text-sm outline-none focus:border-atba-clay focus:ring-2 focus:ring-atba-clay/15'

export default function VisitRequestForm({ annonceId, onClose }) {
  const [form, setForm] = useState({
    date_visite: '',
    heure_visite: '',
    message: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const sending = useRef(false)

  function changeField(event) {
    const { name, value } = event.target

    setForm(current => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (sending.current || success) return

    sending.current = true
    setSubmitting(true)
    setError('')
    setFieldErrors({})

    try {
      await createVisite(annonceId, form)
      setSuccess(true)
    } catch (error) {
      setError(error.message || 'Impossible d’envoyer la demande.')
      setFieldErrors(error.errors || {})
    } finally {
      sending.current = false
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <section className="mt-5 rounded-xl bg-green-50 p-5">
        <h2 className="text-lg font-medium text-green-900">
          Demande envoyée
        </h2>

        <p
          role="status"
          className="mt-2 text-sm leading-6 text-green-800"
        >
          Votre demande a été enregistrée. Le créneau proposé
          reste en attente de confirmation par le propriétaire.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-sm font-medium text-green-800 underline"
        >
          Fermer
        </button>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-xl border border-[#e8e3dc] bg-[#fcfaf7] p-5"
    >
      <h2 className="text-lg font-medium">
        Proposer une visite
      </h2>

      <p className="mt-2 text-xs leading-5 text-atba-muted">
        Choisissez une date à partir de demain et proposez une heure.
        Le propriétaire devra confirmer le rendez-vous.
      </p>

      <fieldset
        disabled={submitting}
        className="mt-5 space-y-4"
      >
        <label className="block text-sm">
          Date souhaitée

          <input
            name="date_visite"
            type="date"
            required
            value={form.date_visite}
            onChange={changeField}
            className={fieldClass}
            aria-invalid={Boolean(fieldErrors.date_visite)}
          />

          {fieldErrors.date_visite && (
            <span className="mt-2 block text-xs text-red-700">
              {fieldErrors.date_visite[0]}
            </span>
          )}
        </label>

        <label className="block text-sm">
          Heure souhaitée

          <input
            name="heure_visite"
            type="time"
            step="60"
            required
            value={form.heure_visite}
            onChange={changeField}
            className={fieldClass}
            aria-invalid={Boolean(fieldErrors.heure_visite)}
          />

          {fieldErrors.heure_visite && (
            <span className="mt-2 block text-xs text-red-700">
              {fieldErrors.heure_visite[0]}
            </span>
          )}
        </label>

        <label className="block text-sm">
          Message facultatif

          <textarea
            name="message"
            rows={3}
            maxLength={2000}
            value={form.message}
            onChange={changeField}
            placeholder="Précisez vos disponibilités ou posez une question."
            className={fieldClass}
            aria-invalid={Boolean(fieldErrors.message)}
          />

          {fieldErrors.message && (
            <span className="mt-2 block text-xs text-red-700">
              {fieldErrors.message[0]}
            </span>
          )}
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-atba-clay px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? 'Envoi…' : 'Envoyer la demande'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e8e3dc] px-4 py-2 text-sm"
          >
            Annuler
          </button>
        </div>
      </fieldset>
    </form>
  )
}