import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  getAdminAnnonce,
  updateAdminAnnonceStatus,
} from '../../services/admin/annonces.js'

const statuses = {
  brouillon: 'Brouillon',
  publiee: 'Publiée',
  suspendue: 'Suspendue',
}

const conditions = {
  neuf: 'Neuf',
  bon_etat: 'Bon état',
  a_renover: 'À rénover',
}

const priceFormatter = new Intl.NumberFormat('fr-MA', {
  maximumFractionDigits: 2,
})

export default function AdminAnnonceDetailPage() {
  const { id } = useParams()

  const [annonce, setAnnonce] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')

  const actionLock = useRef(false)
  const currentId = useRef(id)
  currentId.current = id

  useEffect(() => {
    const controller = new AbortController()

    async function loadAnnonce() {
      setLoading(true)
      setError('')
      setActionError('')
      setSuccess('')
      setAnnonce(null)
      setSelectedPhoto(0)

      try {
        const result = await getAdminAnnonce(id, controller.signal)

        if (!controller.signal.aborted) {
          setAnnonce(result)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error.message || 'Impossible de charger cette annonce.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadAnnonce()

    return () => controller.abort()
  }, [id])

  async function handleStatusChange() {
    if (!annonce || actionLock.current) return

    const nextStatus =
      annonce.statut_annonce === 'publiee'
        ? 'suspendue'
        : annonce.statut_annonce === 'suspendue'
          ? 'publiee'
          : null

    if (!nextStatus) return

    const confirmed = window.confirm(
      nextStatus === 'suspendue'
        ? 'Suspendre cette annonce et la retirer du site public ?'
        : 'Rétablir cette annonce sur le site public ?'
    )

    if (!confirmed) return

    const requestId = id
    actionLock.current = true
    setBusy(true)
    setActionError('')
    setSuccess('')

    try {
      const result = await updateAdminAnnonceStatus(
        annonce.id,
        nextStatus
      )

      if (currentId.current !== requestId) return

      setAnnonce(result)
      setSuccess(
        nextStatus === 'suspendue'
          ? 'L’annonce a été suspendue.'
          : 'L’annonce a été rétablie.'
      )
    } catch (error) {
      if (currentId.current === requestId) {
        setActionError(
          error.message || 'Impossible de modifier le statut.'
        )
      }
    } finally {
      actionLock.current = false
      setBusy(false)
    }
  }

  const property = annonce?.bien
  const photos = [...(property?.photos || [])]
    .sort((a, b) => a.ordre - b.ordre)
    .filter(photo => photo.url_photo)

  const authorName = [
    annonce?.auteur?.prenom,
    annonce?.auteur?.nom,
  ].filter(Boolean).join(' ')

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <Link to="/admin/annonces" className="text-sm text-atba-clay">
        ← Gestion des annonces
      </Link>

      {loading ? (
        <p role="status" className="mt-8 text-atba-muted">
          Chargement de l’annonce…
        </p>
      ) : error ? (
        <p
          role="alert"
          className="mt-8 rounded-xl bg-red-50 p-5 text-red-700"
        >
          {error}
        </p>
      ) : annonce && (
        <>
          <div className="mb-7 mt-6">
            <span className="text-xs uppercase tracking-widest text-atba-clay">
              Administration · Annonce #{annonce.id}
            </span>

            <h1 className="mt-3 text-3xl tracking-tight">
              {property?.titre || 'Bien indisponible'}
            </h1>

            <p className="mt-3 text-sm text-atba-muted">
              {property?.ville?.nom_ville}
              {property?.quartier && ` · ${property.quartier}`}
            </p>
          </div>

          {success && (
            <p
              role="status"
              className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-800"
            >
              {success}
            </p>
          )}

          {actionError && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {actionError}
            </p>
          )}

          <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div>
              {photos.length > 0 ? (
                <>
                  <img
                    src={photos[selectedPhoto]?.url_photo}
                    alt={`${property?.titre || 'Bien'} — photo ${selectedPhoto + 1}`}
                    className="h-72 w-full rounded-2xl object-cover sm:h-96"
                  />

                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setSelectedPhoto(index)}
                        aria-label={`Afficher la photo ${index + 1}`}
                        aria-pressed={selectedPhoto === index}
                        className={`overflow-hidden rounded-xl border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atba-clay ${
                          selectedPhoto === index
                            ? 'border-atba-clay'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={photo.url_photo}
                          alt=""
                          className="h-16 w-full object-cover sm:h-20"
                        />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl bg-atba-cream text-atba-muted">
                  Aucune photo disponible
                </div>
              )}

              <section className="mt-6 rounded-2xl border border-[#e8e3dc] bg-white p-6">
                <h2 className="text-xl">Description</h2>

                <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-atba-muted">
                  {property?.description || 'Aucune description renseignée.'}
                </p>
              </section>
            </div>

            <aside className="rounded-2xl border border-[#e8e3dc] bg-white p-6 shadow-sm">
              <span className="rounded-full bg-atba-cream px-3 py-1.5 text-xs">
                {statuses[annonce.statut_annonce] || annonce.statut_annonce}
              </span>

              <p className="mt-5 text-2xl font-bold">
                {priceFormatter.format(Number(annonce.prix))} MAD
                {annonce.type_transaction === 'location' && (
                  <span className="text-sm font-normal text-atba-muted">
                    {' '}/ mois
                  </span>
                )}
              </p>

              <dl className="mt-5 divide-y divide-[#eee9e2] text-sm">
                {[
                  ['Auteur', authorName || 'Utilisateur'],
                  [
                    'Transaction',
                    annonce.type_transaction === 'vente' ? 'Vente' : 'Location',
                  ],
                  ['Type', property?.type_bien?.libelle || 'Non renseigné'],
                  [
                    'Surface',
                    property?.surface != null
                      ? `${Number(property.surface)} m²`
                      : 'Non renseignée',
                  ],
                  ['Chambres', property?.nbr_chambres ?? 'Non renseigné'],
                  ['Salles de bain', property?.nbr_salle_bain ?? 'Non renseigné'],
                  ['Étage', property?.etage ?? 'Non renseigné'],
                  [
                    'État',
                    conditions[property?.etat_bien]
                      || property?.etat_bien
                      || 'Non renseigné',
                  ],
                  [
                    'Parking',
                    property ? (property.parking ? 'Oui' : 'Non') : 'Non renseigné',
                  ],
                  [
                    'Ascenseur',
                    property ? (property.ascenseur ? 'Oui' : 'Non') : 'Non renseigné',
                  ],
                  [
                    'Adresse approximative',
                    property?.adresse_approx || 'Non renseignée',
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-3">
                    <dt className="text-atba-muted">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>

              {['publiee', 'suspendue'].includes(annonce.statut_annonce) && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleStatusChange}
                  className={`mt-6 w-full rounded-xl px-4 py-3 text-sm disabled:opacity-50 ${
                    annonce.statut_annonce === 'publiee'
                      ? 'border border-red-200 text-red-700'
                      : 'bg-atba-clay text-white'
                  }`}
                >
                  {busy
                    ? 'Enregistrement…'
                    : annonce.statut_annonce === 'publiee'
                      ? 'Suspendre l’annonce'
                      : 'Rétablir l’annonce'}
                </button>
              )}
            </aside>
          </div>
        </>
      )}
    </main>
  )
}