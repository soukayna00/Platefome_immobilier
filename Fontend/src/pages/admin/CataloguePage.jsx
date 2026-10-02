import { useEffect, useRef, useState } from 'react'
import {getAdminVilles,createAdminVille,updateAdminVille,getAdminTypesBien,createAdminTypeBien,updateAdminTypeBien,} from '../../services/admin/catalogue.js'

const fieldClass =
  'w-full rounded-xl border border-[#e8e3dc] bg-white px-4 py-3 text-sm outline-none focus:border-atba-clay disabled:opacity-50'

function CatalogueSection({
  title,
  description,
  field,
  fieldLabel,
  loadItems,
  createItem,
  updateItem,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reload, setReload] = useState(0)

  const [value, setValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [success, setSuccess] = useState('')

  const sending = useRef(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setLoadError('')

      try {
        const result = await loadItems(controller.signal)

        if (!controller.signal.aborted) {
          setItems(result)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            error.message || 'Impossible de charger le catalogue.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => controller.abort()
  }, [loadItems, reload])

  function startEditing(item) {
    if (sending.current) return

    setEditingId(item.id)
    setValue(item[field])
    setError('')
    setFieldError('')
    setSuccess('')

    inputRef.current?.focus()
  }

  function cancelEditing() {
    if (sending.current) return

    setEditingId(null)
    setValue('')
    setError('')
    setFieldError('')
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (sending.current) return

    const trimmedValue = value.trim()

    if (!trimmedValue) {
      setFieldError('Ce champ est obligatoire.')
      return
    }

    sending.current = true
    setSubmitting(true)
    setError('')
    setFieldError('')
    setSuccess('')

    try {
      if (editingId !== null) {
        await updateItem(editingId, trimmedValue)
      } else {
        await createItem(trimmedValue)
      }

      setSuccess(
        editingId !== null
          ? 'La modification a été enregistrée.'
          : 'La nouvelle valeur a été ajoutée.'
      )

      setValue('')
      setEditingId(null)
      setReload(current => current + 1)
    } catch (error) {
      setError(error.message || 'Impossible d’enregistrer cette valeur.')
      setFieldError(error.errors?.[field]?.[0] || '')
    } finally {
      sending.current = false
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-[#e8e3dc] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium">{title}</h2>

          <p className="mt-2 text-sm leading-6 text-atba-muted">
            {description}
          </p>
        </div>

        <button
          type="button"
          disabled={loading || submitting}
          onClick={() => setReload(current => current + 1)}
          className="text-sm text-atba-clay disabled:opacity-50"
        >
          Actualiser
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl bg-[#fcfaf7] p-4"
      >
        <p className="mb-3 text-sm font-medium">
          {editingId !== null ? 'Modifier une valeur' : 'Ajouter une valeur'}
        </p>

        <fieldset disabled={submitting || loading}>
          <label className="block text-sm">
            {fieldLabel}

            <input
              ref={inputRef}
              name={field}
              type="text"
              required
              maxLength={100}
              value={value}
              onChange={event => {
                setValue(event.target.value)
                setFieldError('')
                setSuccess('')
              }}
              aria-invalid={Boolean(fieldError)}
              className={`${fieldClass} mt-2`}
            />
          </label>

          {fieldError && (
            <p role="alert" className="mt-2 text-xs text-red-700">
              {fieldError}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-atba-clay px-4 py-2.5 text-sm text-white disabled:opacity-50"
            >
              {submitting
                ? 'Enregistrement…'
                : editingId !== null
                  ? 'Enregistrer'
                  : 'Ajouter'}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-full border border-[#e8e3dc] px-4 py-2.5 text-sm"
              >
                Annuler
              </button>
            )}
          </div>
        </fieldset>
      </form>

      {success && (
        <p
          role="status"
          className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800"
        >
          {success}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <p role="status" className="text-sm text-atba-muted">
            Chargement…
          </p>
        ) : loadError ? (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{loadError}</p>

            <button
              type="button"
              disabled={submitting}
              onClick={() => setReload(current => current + 1)}
              className="mt-3 underline"
            >
              Réessayer
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#e8e3dc] p-5 text-sm text-atba-muted">
            Aucune valeur enregistrée.
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs text-atba-muted">
              {items.length} valeur{items.length > 1 ? 's' : ''}
            </p>

            <ul className="max-h-[480px] divide-y divide-[#eee9e2] overflow-y-auto">
              {items.map(item => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="min-w-0 break-words text-sm">
                    {item[field]}
                  </span>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => startEditing(item)}
                    className="shrink-0 rounded-full border border-[#e8e3dc] px-3 py-1.5 text-xs text-atba-clay disabled:opacity-50"
                  >
                    Modifier
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}

export default function AdminCataloguePage() {
  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <span className="text-xs uppercase tracking-widest text-atba-clay">
        Administration
      </span>

      <h1 className="mt-3 text-3xl tracking-tight">
        Catalogue
      </h1>

      <p className="mb-8 mt-3 max-w-2xl text-sm leading-6 text-atba-muted">
        Gérez les villes et les types de biens proposés dans les
        formulaires. Renommer une valeur conserve ses associations
        avec les biens existants.
      </p>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <CatalogueSection
          title="Villes"
          description="Les villes disponibles pour localiser les biens."
          field="nom_ville"
          fieldLabel="Nom de la ville"
          loadItems={getAdminVilles}
          createItem={createAdminVille}
          updateItem={updateAdminVille}
        />

        <CatalogueSection
          title="Types de biens"
          description="Les catégories disponibles pour décrire les biens."
          field="libelle"
          fieldLabel="Libellé du type"
          loadItems={getAdminTypesBien}
          createItem={createAdminTypeBien}
          updateItem={updateAdminTypeBien}
        />
      </div>
    </main>
  )
}