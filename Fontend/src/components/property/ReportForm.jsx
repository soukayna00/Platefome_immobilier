import { useRef, useState } from 'react'
import { createSignalement } from '../../services/signalements.js'

const reasons = [
  ['annonce_frauduleuse', 'Annonce suspecte ou frauduleuse'],
  ['informations_incorrectes', 'Informations incorrectes'],
  ['photos_inappropriees', 'Photos inappropriées'],
  ['bien_indisponible', 'Bien indisponible'],
  ['autre', 'Autre motif'],
]

const fieldClass =
  'mt-2 w-full rounded-xl border border-[#e5ded5] bg-white px-4 py-3 text-sm outline-none focus:border-atba-clay'

export default function ReportForm({ annonceId, onClose }) {
  const [motif, setMotif] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const sending = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (sending.current || success) return

    sending.current = true
    setSubmitting(true)
    setError('')
    setFieldErrors({})

    try {
      await createSignalement(annonceId, {
        motif,
        description: description.trim(),
      })

      setSuccess(true)
    } catch (error) {
      setError(error.message || 'Impossible d’envoyer le signalement.')
      setFieldErrors(error.errors || {})
    } finally {
      sending.current = false
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <section className="rounded-xl bg-green-50 p-5">
        <h2 className="font-medium text-green-900">
          Signalement enregistré
        </h2>

        <p role="status" className="mt-2 text-sm leading-6 text-green-800">
          Merci. Votre signalement est en attente de traitement.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-sm text-green-800 underline"
        >
          Fermer
        </button>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#e8e3dc] bg-[#fcfaf7] p-5"
    >
      <h2 className="text-lg font-medium">Signaler cette annonce</h2>

      <p className="mt-2 text-xs leading-5 text-atba-muted">
        Indiquez le problème rencontré pour permettre son examen.
      </p>

      <fieldset disabled={submitting} className="mt-5 space-y-4">
        <label className="block text-sm">
          Motif du signalement

          <select
            required
            value={motif}
            onChange={event => setMotif(event.target.value)}
            aria-invalid={Boolean(fieldErrors.motif)}
            className={fieldClass}
          >
            <option value="">Choisir un motif</option>
            {reasons.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {fieldErrors.motif && (
            <span className="mt-2 block text-xs text-red-700">
              {fieldErrors.motif[0]}
            </span>
          )}
        </label>

        <label className="block text-sm">
          Précisions facultatives

          <textarea
            rows={4}
            maxLength={2000}
            value={description}
            onChange={event => setDescription(event.target.value)}
            aria-invalid={Boolean(fieldErrors.description)}
            placeholder="Décrivez le problème rencontré."
            className={fieldClass}
          />

          {fieldErrors.description && (
            <span className="mt-2 block text-xs text-red-700">
              {fieldErrors.description[0]}
            </span>
          )}
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-atba-clay px-4 py-2 text-sm text-white"
          >
            {submitting ? 'Envoi…' : 'Envoyer le signalement'}
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