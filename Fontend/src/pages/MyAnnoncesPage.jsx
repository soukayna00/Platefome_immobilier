import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import {getMyAnnonces,updateAnnonce,deleteAnnonce} from '../services/ownerAnnonces.js'

const priceFormatter = new Intl.NumberFormat('fr-MA', {
  maximumFractionDigits: 2,
})

const statusLabels = {
  brouillon: 'Brouillon',
  publiee: 'Publiée',
}

const fieldClass =
  'mt-2 w-full rounded-xl border border-[#e5ded5] bg-white px-4 py-3 text-sm outline-none focus:border-atba-clay focus:ring-2 focus:ring-atba-clay/15'

export default function MyAnnoncesPage() {
  const [annonces, setAnnonces] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    type_transaction: 'vente',
    prix: '',
    statut_annonce: 'brouillon',
  })

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [success, setSuccess] = useState('')

  const submitting = useRef(false)
  const deleting = useRef(false)
  const busy = saving || deletingId !== null

  useEffect(() => {
    const controller = new AbortController()

    async function loadAnnonces() {
      setLoading(true)
      setError('')

      try {
        const result = await getMyAnnonces(page, controller.signal)

        if (!controller.signal.aborted) {
          setAnnonces(result.data)
          setTotal(result.total)
          setLastPage(result.last_page)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message || 'Impossible de charger vos annonces.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadAnnonces()

    return () => controller.abort()
  }, [page, reload])

  function startEditing(annonce) {
    if (submitting.current || deleting.current) return

    setEditingId(annonce.id)
    setForm({
      type_transaction: annonce.type_transaction,
      prix: annonce.prix,
      statut_annonce: annonce.statut_annonce,
    })
    setFormError('')
    setFieldErrors({})
    setDeleteError('')
    setSuccess('')
  }

  function changeField(event) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
  }

  function cancelEditing() {
    setEditingId(null)
    setFormError('')
    setFieldErrors({})
  }

  async function handleSave(event) {
    event.preventDefault()

    if (submitting.current || deleting.current) return

    const original = annonces.find(annonce => annonce.id === editingId)
    if (!original) return

    if (
      form.statut_annonce === 'publiee' &&
      original.statut_annonce !== 'publiee' &&
      !window.confirm(
        'Publier cette annonce ? Elle sera visible dans les annonces publiques.'
      )
    ) {
      return
    }

    submitting.current = true
    setSaving(true)
    setFormError('')
    setFieldErrors({})
    setDeleteError('')
    setSuccess('')

    try {
      const updated = await updateAnnonce(editingId, form)

      setAnnonces(current =>
        current.map(annonce =>
          annonce.id === updated.id ? updated : annonce
        )
      )

      cancelEditing()
      setSuccess('Votre annonce a été mise à jour.')
    } catch (error) {
      setFormError(error.message || 'Impossible de modifier l’annonce.')
      setFieldErrors(error.errors || {})
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  async function handleDelete(annonce) {
    if (deleting.current || submitting.current) return

    const confirmed = window.confirm(
      `Supprimer définitivement l’annonce « ${annonce.bien?.titre || annonce.id} » ? Le bien et ses photos seront conservés.`
    )

    if (!confirmed) return

    deleting.current = true
    setDeletingId(annonce.id)
    setDeleteError('')
    setSuccess('')

    try {
      await deleteAnnonce(annonce.id)

      setAnnonces(current =>
        current.filter(item => item.id !== annonce.id)
      )

      cancelEditing()
      setSuccess('L’annonce a été supprimée. Votre bien est conservé.')

      if (annonces.length === 1 && page > 1) {
        setPage(current => current - 1)
      } else {
        setReload(current => current + 1)
      }
    } catch (error) {
      setDeleteError(
        error.message || 'Impossible de supprimer l’annonce.'
      )
    } finally {
      deleting.current = false
      setDeletingId(null)
    }
  }

  function changePage(nextPage) {
    if (submitting.current || deleting.current) return

    cancelEditing()
    setDeleteError('')
    setSuccess('')
    setPage(nextPage)
  }

  return (
    <main className="min-h-[65vh] bg-[#f7f4ef] px-5 py-10 lg:px-9">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/espace-proprietaire"
          className="text-sm text-atba-clay"
        >
          ← Espace propriétaire
        </Link>

        <div className="mb-8 mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl tracking-tight sm:text-4xl">
              Mes annonces
            </h1>

            <p className="mt-3 text-sm text-atba-muted">
              Gérez vos prix, vos brouillons et vos publications.
            </p>
          </div>

          <Link
            to="/mes-biens"
            className="rounded-full bg-atba-clay px-5 py-3 text-sm font-medium text-white"
          >
            Créer une annonce depuis un bien →
          </Link>
        </div>

        {success && (
          <p
            role="status"
            className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-800"
          >
            {success}
          </p>
        )}

        {deleteError && (
          <p
            role="alert"
            className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {deleteError}
          </p>
        )}

        {loading ? (
          <p role="status" className="text-atba-muted">
            Chargement de vos annonces…
          </p>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-5">
            <p role="alert" className="text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setReload(current => current + 1)}
              className="mt-3 text-sm text-red-700 underline"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-atba-muted">
              {total} annonce{total > 1 ? 's' : ''}
            </p>

            {annonces.length > 0 ? (
              <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {annonces.map(annonce => {
                  const bien = annonce.bien
                  const image = bien?.photos?.[0]?.url_photo
                  const published = annonce.statut_annonce === 'publiee'
                  const rental = annonce.type_transaction === 'location'
                  const editing = editingId === annonce.id

                  return (
                    <article
                      key={annonce.id}
                      className="overflow-hidden rounded-2xl border border-[#e8e3dc] bg-white shadow-sm"
                    >
                      <div className="relative">
                        {image ? (
                          <img
                            src={image}
                            alt={bien?.titre || 'Photographie du bien'}
                            className="h-48 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-48 items-center justify-center bg-atba-cream text-sm text-atba-muted">
                            Aucune photo disponible
                          </div>
                        )}

                        <span
                          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-medium ${
                            published
                              ? 'bg-green-50 text-green-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {statusLabels[annonce.statut_annonce] ||
                            annonce.statut_annonce}
                        </span>
                      </div>

                      <div className="p-5">
                        <p className="text-xs uppercase tracking-widest text-atba-clay">
                          {rental ? 'Location' : 'Vente'}
                        </p>

                        <h2 className="mt-2 text-lg font-semibold">
                          {bien?.titre || 'Bien indisponible'}
                        </h2>

                        <p className="mt-2 text-sm text-atba-muted">
                          {bien?.ville?.nom_ville}
                          {bien?.quartier && ` · ${bien.quartier}`}
                        </p>

                        <p className="mt-4 text-2xl font-semibold">
                          {priceFormatter.format(Number(annonce.prix))} MAD

                          {rental && (
                            <span className="text-sm font-normal text-atba-muted">
                              {' '}/ mois
                            </span>
                          )}
                        </p>

                        {editing ? (
                          <form
                            onSubmit={handleSave}
                            className="mt-5 border-t border-[#eee9e2] pt-5"
                          >
                            <fieldset
                              disabled={busy}
                              className="space-y-4"
                            >
                              <legend className="mb-4 text-sm font-semibold">
                                Modifier l’annonce
                              </legend>

                              <label className="block text-sm">
                                Transaction

                                <select
                                  name="type_transaction"
                                  value={form.type_transaction}
                                  onChange={changeField}
                                  className={fieldClass}
                                  aria-invalid={Boolean(
                                    fieldErrors.type_transaction
                                  )}
                                >
                                  <option value="vente">Vente</option>
                                  <option value="location">Location</option>
                                </select>

                                {fieldErrors.type_transaction && (
                                  <span className="mt-2 block text-xs text-red-700">
                                    {fieldErrors.type_transaction[0]}
                                  </span>
                                )}
                              </label>

                              <label className="block text-sm">
                                {form.type_transaction === 'location'
                                  ? 'Loyer mensuel (MAD)'
                                  : 'Prix de vente (MAD)'}

                                <input
                                  name="prix"
                                  type="number"
                                  min="0.01"
                                  max="9999999999.99"
                                  step="0.01"
                                  required
                                  value={form.prix}
                                  onChange={changeField}
                                  className={fieldClass}
                                  aria-invalid={Boolean(fieldErrors.prix)}
                                />

                                {fieldErrors.prix && (
                                  <span className="mt-2 block text-xs text-red-700">
                                    {fieldErrors.prix[0]}
                                  </span>
                                )}
                              </label>

                              <label className="block text-sm">
                                Visibilité

                                <select
                                  name="statut_annonce"
                                  value={form.statut_annonce}
                                  onChange={changeField}
                                  className={fieldClass}
                                  aria-invalid={Boolean(
                                    fieldErrors.statut_annonce
                                  )}
                                >
                                  <option value="brouillon">
                                    Brouillon — privée
                                  </option>
                                  <option value="publiee">
                                    Publiée — visible
                                  </option>
                                </select>

                                {fieldErrors.statut_annonce && (
                                  <span className="mt-2 block text-xs text-red-700">
                                    {fieldErrors.statut_annonce[0]}
                                  </span>
                                )}
                              </label>

                              {formError && (
                                <p
                                  role="alert"
                                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                                >
                                  {formError}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-3">
                                <button
                                  type="submit"
                                  className="rounded-full bg-atba-clay px-4 py-2 text-sm text-white disabled:opacity-50"
                                >
                                  {saving
                                    ? 'Enregistrement…'
                                    : 'Enregistrer'}
                                </button>

                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="rounded-full border border-[#e8e3dc] px-4 py-2 text-sm"
                                >
                                  Annuler
                                </button>
                              </div>
                            </fieldset>
                          </form>
                        ) : (
                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => startEditing(annonce)}
                              className="rounded-full border border-atba-clay px-4 py-2 text-sm text-atba-clay disabled:opacity-50"
                            >
                              Modifier
                            </button>

                            {editingId === null && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleDelete(annonce)}
                                className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                {deletingId === annonce.id
                                  ? 'Suppression…'
                                  : 'Supprimer'}
                              </button>
                            )}
                          </div>
                        )}

                        <div className="mt-5 flex flex-wrap gap-4 border-t border-[#eee9e2] pt-4 text-sm">
                          <Link
                            to={`/mes-biens/${annonce.bien_id}`}
                            className="text-atba-clay hover:underline"
                          >
                            Voir mon bien →
                          </Link>

                          {published && (
                            <Link
                              to={`/bien/${annonce.id}`}
                              className="text-atba-clay hover:underline"
                            >
                              Voir l’annonce →
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d8cfc4] bg-white p-8">
                <h2 className="text-xl">Aucune annonce sur cette page</h2>

                <p className="mt-3 text-sm text-atba-muted">
                  Ouvrez un de vos biens pour créer une annonce.
                </p>

                <Link
                  to="/mes-biens"
                  className="mt-5 inline-block text-sm text-atba-clay"
                >
                  Accéder à mes biens →
                </Link>
              </div>
            )}

            {lastPage > 1 && (
              <nav
                aria-label="Pagination de mes annonces"
                className="mt-8 flex items-center justify-center gap-4"
              >
                <button
                  type="button"
                  disabled={page <= 1 || busy}
                  onClick={() => changePage(page - 1)}
                  className="rounded-lg border border-[#e8e3dc] bg-white px-4 py-2 text-sm disabled:opacity-40"
                >
                  ← Précédent
                </button>

                <span className="text-sm text-atba-muted">
                  Page {page} sur {lastPage}
                </span>

                <button
                  type="button"
                  disabled={page >= lastPage || busy}
                  onClick={() => changePage(page + 1)}
                  className="rounded-lg border border-[#e8e3dc] bg-white px-4 py-2 text-sm disabled:opacity-40"
                >
                  Suivant →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  )
}