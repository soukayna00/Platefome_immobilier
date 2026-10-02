import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { updateBien } from '../services/biens.js'

export default function EditPropertyPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [cities, setCities] = useState([])
  const [types, setTypes] = useState([])
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setForm(null)
    setError('')
    setErrors({})

    async function load() {
      try {
        const responses = await Promise.all(
          [`/api/mes-biens/${id}`, '/api/villes', '/api/types-bien']
            .map(url => fetch(url, {
              credentials: 'same-origin',
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            }))
        )

        if (responses.some(response => !response.ok)) {
          throw new Error('Impossible de charger le formulaire.')
        }

        const [bien, cityData, typeData] = await Promise.all(
          responses.map(response => response.json())
        )

        if (controller.signal.aborted) return

        setCities(cityData)
        setTypes(typeData)
        setForm({
          titre: bien.titre,
          description: bien.description ?? '',
          etat_bien: bien.etat_bien ?? '',
          ville_id: String(bien.ville_id),
          type_bien_id: String(bien.type_bien_id),
          surface: bien.surface,
          nbr_chambres: bien.nbr_chambres,
          nbr_salle_bain: bien.nbr_salle_bain,
          etage: bien.etage ?? '',
          quartier: bien.quartier ?? '',
          adresse_approx: bien.adresse_approx ?? '',
          parking: Boolean(bien.parking),
          ascenseur: Boolean(bien.ascenseur),
        })
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message)
      }
    }

    load()
    return () => controller.abort()
  }, [id])

  function change(event) {
    const { name, value, type, checked } = event.target

    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function submit(event) {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError('')
    setErrors({})

    try {
      await updateBien(id, form)
      navigate(`/mes-biens/${id}`)
    } catch (error) {
      setError(error.message || 'Impossible de modifier le bien.')
      setErrors(error.errors || {})
    } finally {
      setSubmitting(false)
    }
  }

  function fieldError(name) {
    return errors[name] && (
      <p id={`${name}-error`} className="mt-2 text-xs text-red-700">
        {errors[name][0]}
      </p>
    )
  }

  function accessibility(name) {
    return {
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    }
  }

  const field =
    'mt-2 w-full rounded-xl border border-[#e5ded5] bg-[#fcfaf7] px-4 py-3 text-sm outline-none focus:border-atba-clay focus:ring-2 focus:ring-atba-clay/15'

  return (
    <main className="min-h-[70vh] bg-[#f7f4ef] px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to={`/mes-biens/${id}`} className="text-sm text-atba-clay">
          ← Retour au bien
        </Link>

        <div className="mb-7 mt-6">
          <span className="text-xs uppercase tracking-widest text-atba-clay">
            Espace propriétaire
          </span>
          <h1 className="mt-3 text-3xl">Modifier mon bien</h1>
          <p className="mt-3 text-sm text-atba-muted">
            Mettez à jour les caractéristiques de votre logement.
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {!form ? (
          !error && <p role="status">Chargement du formulaire…</p>
        ) : (
          <form onSubmit={submit}>
            <fieldset
              disabled={submitting}
              className="space-y-5 rounded-2xl border border-[#e8e3dc] bg-white p-6 shadow-sm sm:p-8"
            >
              <legend className="sr-only">Modifier les caractéristiques</legend>

              <label className="block text-sm">
                Titre
                <input
                  name="titre"
                  required
                  maxLength={255}
                  value={form.titre}
                  onChange={change}
                  className={field}
                  {...accessibility('titre')}
                />
                {fieldError('titre')}
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  ['ville_id', 'Ville', cities, 'nom_ville'],
                  ['type_bien_id', 'Type de bien', types, 'libelle'],
                ].map(([name, label, options, textKey]) => (
                  <label key={name} className="block text-sm">
                    {label}
                    <select
                      name={name}
                      required
                      value={form[name]}
                      onChange={change}
                      className={field}
                      {...accessibility(name)}
                    >
                      <option value="">Choisir</option>
                      {options.map(option => (
                        <option key={option.id} value={option.id}>
                          {option[textKey]}
                        </option>
                      ))}
                    </select>
                    {fieldError(name)}
                  </label>
                ))}

                {[
                  ['surface', 'Surface (m²)', 0.01, 99999999.99, '0.01'],
                  ['nbr_chambres', 'Chambres', 0, 1000, '1'],
                  ['nbr_salle_bain', 'Salles de bain', 0, 1000, '1'],
                  ['etage', 'Étage — facultatif', -20, 200, '1'],
                ].map(([name, label, min, max, step]) => (
                  <label key={name} className="block text-sm">
                    {label}
                    <input
                      name={name}
                      type="number"
                      required={name !== 'etage'}
                      min={min}
                      max={max}
                      step={step}
                      value={form[name]}
                      onChange={change}
                      className={field}
                      {...accessibility(name)}
                    />
                    {fieldError(name)}
                  </label>
                ))}

                {[
                  ['quartier', 'Quartier — facultatif', 100],
                  ['adresse_approx', 'Adresse approximative — facultative', 255],
                ].map(([name, label, maxLength]) => (
                  <label key={name} className="block text-sm">
                    {label}
                    <input
                      name={name}
                      maxLength={maxLength}
                      value={form[name]}
                      onChange={change}
                      className={field}
                      {...accessibility(name)}
                    />
                    {fieldError(name)}
                  </label>
                ))}
              </div>

              <label className="block text-sm">
                État du bien — facultatif
                <select
                  name="etat_bien"
                  value={form.etat_bien}
                  onChange={change}
                  className={field}
                  {...accessibility('etat_bien')}
                >
                  <option value="">Non renseigné</option>
                  <option value="neuf">Neuf</option>
                  <option value="bon_etat">Bon état</option>
                  <option value="a_renover">À rénover</option>
                </select>
                {fieldError('etat_bien')}
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['parking', 'Parking'],
                  ['ascenseur', 'Ascenseur'],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label className="flex items-center gap-3 rounded-xl border border-[#e8e3dc] bg-[#fcfaf7] p-4 text-sm">
                      <input
                        name={name}
                        type="checkbox"
                        checked={form[name]}
                        onChange={change}
                        className="h-4 w-4 accent-[#b65d40]"
                        {...accessibility(name)}
                      />
                      {label}
                    </label>
                    {fieldError(name)}
                  </div>
                ))}
              </div>

              <label className="block text-sm">
                Description — facultative
                <textarea
                  name="description"
                  rows={5}
                  maxLength={10000}
                  value={form.description}
                  onChange={change}
                  className={field}
                  {...accessibility('description')}
                />
                {fieldError('description')}
              </label>

              <p className="rounded-lg bg-[#f0e5dc]/60 p-4 text-xs text-atba-muted">
                Les photos actuelles sont conservées.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  className="rounded-full bg-atba-clay px-6 py-3 text-sm text-white hover:brightness-95 disabled:opacity-50"
                >
                  {submitting
                    ? 'Enregistrement…'
                    : 'Enregistrer les modifications'}
                </button>

                {!submitting && (
                  <Link
                    to={`/mes-biens/${id}`}
                    className="text-sm text-atba-muted"
                  >
                    Annuler
                  </Link>
                )}
              </div>
            </fieldset>
          </form>
        )}
      </div>
    </main>
  )
}