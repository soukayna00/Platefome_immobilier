import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { createBien } from '../services/biens.js'

const numericFields = [
  ['surface', 'Surface (m²)', '0.01', '99999999.99', '0.01'],
  ['nbr_chambres', 'Chambres', '0', '1000', '1'],
  ['nbr_salle_bain', 'Salles de bain', '0', '1000', '1'],
  ['etage', 'Étage — facultatif', '-20', '200', '1'],
]

export default function CreatePropertyPage() {
  const navigate = useNavigate()

  const [cities, setCities] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [catalogueError, setCatalogueError] = useState('')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [thumbnail, setThumbnail] = useState(null)
  const [otherPhotos, setOtherPhotos] = useState([])
  const [photoError, setPhotoError] = useState('')
  const [previews, setPreviews] = useState({
    thumbnail: '',
    others: [],
  })

  const [form, setForm] = useState({
    titre: '',
    description: '',
    etat_bien: '',
    ville_id: '',
    type_bien_id: '',
    surface: '',
    nbr_chambres: '0',
    nbr_salle_bain: '0',
    etage: '',
    quartier: '',
    adresse_approx: '',
    parking: false,
    ascenseur: false,
  })

  useEffect(() => {
    const controller = new AbortController()

    async function loadCatalogues() {
      try {
        const responses = await Promise.all(
          ['/api/villes', '/api/types-bien'].map(url =>
            fetch(url, {
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            })
          )
        )

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
          setCatalogueError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadCatalogues()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const thumbnailUrl = thumbnail ? URL.createObjectURL(thumbnail) : ''
    const otherUrls = otherPhotos.map(file => URL.createObjectURL(file))

    setPreviews({
      thumbnail: thumbnailUrl,
      others: otherUrls,
    })

    return () => {
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl)
      otherUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [thumbnail, otherPhotos])

  function change(event) {
    const { name, value, type, checked } = event.target

    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function validatePhotos(files) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    return files.every(file =>
      allowedTypes.includes(file.type) &&
      file.size <= 5 * 1024 * 1024
    )
  }

  function chooseThumbnail(event) {
    const file = event.target.files[0]
    setPhotoError('')

    if (!file) return

    if (!validatePhotos([file])) {
      setPhotoError('Choisissez une image JPEG, PNG ou WebP de 5 Mo maximum.')
      event.target.value = ''
      return
    }

    setThumbnail(file)
  }

  function chooseOtherPhotos(event) {
    const files = Array.from(event.target.files)
    setPhotoError('')

    if (files.length === 0) return

    if (files.length > 4 || !validatePhotos(files)) {
      setPhotoError(
        'Choisissez jusqu’à 4 images JPEG, PNG ou WebP de 5 Mo maximum chacune.'
      )
      event.target.value = ''
      return
    }

    setOtherPhotos(files)
  }

  async function submit(event) {
    event.preventDefault()
    if (submitting) return

    if (!thumbnail || !validatePhotos([thumbnail, ...otherPhotos])) {
      setPhotoError('Ajoutez une photo principale valide.')
      return
    }

    setSubmitting(true)
    setError('')
    setErrors({})
    setPhotoError('')

    const data = new FormData()

    for (const [name, value] of Object.entries(form)) {
      data.append(
        name,
        typeof value === 'boolean' ? (value ? '1' : '0') : value
      )
    }

    data.append('miniature', thumbnail)
    otherPhotos.forEach(file => data.append('photos[]', file))

    try {
      await createBien(data)
      navigate('/mes-biens')
    } catch (error) {
      setError(error.message || 'Impossible d’enregistrer le bien.')
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

  const inputClass =
    'mt-2 w-full rounded-xl border border-[#e5ded5] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-atba-clay focus:ring-2 focus:ring-atba-clay/15'

  const labelClass = 'text-sm font-medium text-[#403a33]'
  const sectionClass =
    'rounded-2xl border border-[#e8e3dc] bg-white p-5 shadow-sm sm:p-8'

  return (
    <main className="min-h-[70vh] bg-[#f7f4ef] px-5 py-10 lg:py-14">
      <div className="mx-auto max-w-4xl">
        <Link to="/mes-biens" className="text-sm text-atba-clay">
          ← Retour à mes biens
        </Link>

        <div className="mb-8 mt-6">
          <span className="text-xs uppercase tracking-[0.2em] text-atba-clay">
            Espace propriétaire
          </span>
          <h1 className="mt-3 text-3xl tracking-tight sm:text-4xl">
            Présentez votre bien
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-atba-muted">
            Renseignez les caractéristiques de votre logement et ajoutez
            ses photos. Vous pourrez ensuite créer son annonce.
          </p>
        </div>

        {loading ? (
          <p role="status" className="py-10 text-atba-muted">
            Chargement du formulaire…
          </p>
        ) : catalogueError ? (
          <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
            {catalogueError}
          </p>
        ) : (
          <form onSubmit={submit}>
            <fieldset disabled={submitting} className="space-y-6">
              <legend className="sr-only">Ajouter un bien immobilier</legend>

              <section className={sectionClass}>
                <h2 className="text-xl">Informations du bien</h2>
                <p className="mt-2 text-sm text-atba-muted">
                  Donnez un titre clair et précisez sa localisation.
                </p>

                <div className="mt-6">
                  <label htmlFor="titre" className={labelClass}>
                    Titre du bien
                  </label>
                  <input
                    id="titre"
                    name="titre"
                    required
                    maxLength={255}
                    value={form.titre}
                    onChange={change}
                    placeholder="Appartement lumineux à Malabata"
                    className={inputClass}
                    {...accessibility('titre')}
                  />
                  {fieldError('titre')}
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {[
                    ['ville_id', 'Ville', cities, 'nom_ville'],
                    ['type_bien_id', 'Type de bien', types, 'libelle'],
                  ].map(([name, label, options, textKey]) => (
                    <div key={name}>
                      <label htmlFor={name} className={labelClass}>
                        {label}
                      </label>
                      <select
                        id={name}
                        name={name}
                        required
                        value={form[name]}
                        onChange={change}
                        className={inputClass}
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
                    </div>
                  ))}

                  {[
                    ['quartier', 'Quartier — facultatif', 100],
                    ['adresse_approx', 'Adresse approximative — facultative', 255],
                  ].map(([name, label, maxLength]) => (
                    <div key={name}>
                      <label htmlFor={name} className={labelClass}>
                        {label}
                      </label>
                      <input
                        id={name}
                        name={name}
                        maxLength={maxLength}
                        value={form[name]}
                        onChange={change}
                        className={inputClass}
                        {...accessibility(name)}
                      />
                      {fieldError(name)}
                    </div>
                  ))}
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className="text-xl">Caractéristiques</h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {numericFields.map(([name, label, min, max, step]) => (
                    <div key={name}>
                      <label htmlFor={name} className={labelClass}>
                        {label}
                      </label>
                      <input
                        id={name}
                        name={name}
                        type="number"
                        required={name !== 'etage'}
                        min={min}
                        max={max}
                        step={step}
                        value={form[name]}
                        onChange={change}
                        className={inputClass}
                        {...accessibility(name)}
                      />
                      {fieldError(name)}
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <label htmlFor="etat_bien" className={labelClass}>
                    État du bien — facultatif
                  </label>
                  <select
                    id="etat_bien"
                    name="etat_bien"
                    value={form.etat_bien}
                    onChange={change}
                    className={inputClass}
                    {...accessibility('etat_bien')}
                  >
                    <option value="">Non renseigné</option>
                    <option value="neuf">Neuf</option>
                    <option value="bon_etat">Bon état</option>
                    <option value="a_renover">À rénover</option>
                  </select>
                  {fieldError('etat_bien')}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    ['parking', 'Parking'],
                    ['ascenseur', 'Ascenseur'],
                  ].map(([name, label]) => (
                    <div key={name}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8e3dc] bg-[#fcfaf7] px-4 py-4 text-sm">
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

                <div className="mt-6">
                  <label htmlFor="description" className={labelClass}>
                    Description — facultative
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    maxLength={10000}
                    value={form.description}
                    onChange={change}
                    placeholder="Décrivez les pièces et les points forts du logement…"
                    className={inputClass}
                    {...accessibility('description')}
                  />
                  {fieldError('description')}
                </div>
              </section>

              <section className={sectionClass}>
                <span className="text-xs uppercase tracking-[0.18em] text-atba-clay">
                  Mettez votre logement en valeur
                </span>
                <h2 className="mt-2 text-2xl">Photos du bien</h2>
                <p className="mt-2 text-sm text-atba-muted">
                  Une photo principale et jusqu’à quatre vues supplémentaires.
                </p>

                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold">
                    Photo principale — obligatoire
                  </h3>

                  <input
                    id="thumbnail"
                    type="file"
                    required={!thumbnail}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={chooseThumbnail}
                    aria-label="Choisir la photo principale"
                    className="peer sr-only"
                    {...accessibility('miniature')}
                  />

                  <label
                    htmlFor="thumbnail"
                    className="relative flex min-h-60 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#d8c8ba] bg-[#faf8f5] text-center transition hover:border-atba-clay peer-focus-visible:ring-2 peer-focus-visible:ring-atba-clay"
                  >
                    {previews.thumbnail ? (
                      <>
                        <img
                          src={previews.thumbnail}
                          alt="Aperçu de la photo principale"
                          className="h-72 w-full object-cover"
                        />
                        <span className="absolute bottom-4 rounded-full bg-white/95 px-5 py-2 text-xs font-medium">
                          Changer la photo principale
                        </span>
                      </>
                    ) : (
                      <span className="px-6 py-10 text-sm font-medium">
                        + Choisir la photo principale
                      </span>
                    )}
                  </label>

                  <p className="mt-3 text-xs text-atba-muted">
                    Cette image apparaîtra sur les cartes de votre bien.
                  </p>
                  {fieldError('miniature')}
                </div>

                <div className="mt-8 border-t border-[#e8e3dc] pt-6">
                  <div className="mb-4 flex justify-between gap-3">
                    <h3 className="text-sm font-semibold">
                      Photos supplémentaires
                    </h3>
                    <span className="text-xs text-atba-muted">
                      {otherPhotos.length} / 4
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {previews.others.map((url, index) => (
                      <div key={url}>
                        <img
                          src={url}
                          alt={`Photo supplémentaire ${index + 1}`}
                          className="h-32 w-full rounded-xl object-cover"
                        />
                        {fieldError(`photos.${index}`)}
                      </div>
                    ))}

                    {Array.from({
                      length: Math.max(0, 4 - previews.others.length),
                    }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        aria-hidden="true"
                        className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[#ded4ca] bg-[#faf8f5] text-xs text-atba-muted"
                      >
                        Vue supplémentaire
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <input
                      id="other-photos"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={chooseOtherPhotos}
                      aria-label="Choisir les photos supplémentaires"
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="other-photos"
                      className="inline-block cursor-pointer rounded-full border border-[#d8c8ba] px-5 py-2.5 text-xs font-medium hover:text-atba-clay peer-focus-visible:ring-2 peer-focus-visible:ring-atba-clay"
                    >
                      {otherPhotos.length
                        ? 'Modifier la sélection'
                        : '+ Choisir les photos'}
                    </label>
                  </div>

                  <p className="mt-3 text-xs leading-6 text-atba-muted">
                    Sélectionnez jusqu’à quatre fichiers en une fois.
                    Une nouvelle sélection remplace la précédente.
                  </p>
                  {fieldError('photos')}
                </div>

                <p className="mt-6 rounded-lg bg-[#f0e5dc]/60 px-4 py-3 text-xs text-[#796657]">
                  JPEG, PNG ou WebP · 5 Mo maximum par photo.
                </p>

                {photoError && (
                  <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {photoError}
                  </p>
                )}
              </section>

              {error && (
                <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-sm text-xs leading-5 text-atba-muted">
                  Enregistrer le bien ne publie pas encore d’annonce.
                </p>
                <button
                  type="submit"
                  className="rounded-full bg-atba-clay px-7 py-3.5 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement…' : 'Enregistrer mon bien →'}
                </button>
              </div>
            </fieldset>
          </form>
        )}
      </div>
    </main>
  )
}