import { useEffect, useRef, useState } from 'react'
import {
  getAdminUsers,
  updateAdminUserStatus,
} from '../../services/admin/users.js'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [reload, setReload] = useState(0)

  const actionLock = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      setLoading(true)
      setError('')

      try {
        const result = await getAdminUsers(
          status,
          page,
          controller.signal
        )

        if (controller.signal.aborted) return

        const finalPage = Math.max(1, result.last_page)

        if (page > finalPage) {
          setPage(finalPage)
          return
        }

        setUsers(result.data)
        setTotal(result.total)
        setLastPage(finalPage)
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error.message || 'Impossible de charger les utilisateurs.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadUsers()

    return () => controller.abort()
  }, [status, page, reload])

  function changeFilter(event) {
    setStatus(event.target.value)
    setPage(1)
    setSuccess('')
    setActionError('')
  }

  async function handleStatusChange(user) {
    if (actionLock.current) return

    const nextStatus =
      user.statut_compte === 'actif'
        ? 'suspendu'
        : user.statut_compte === 'suspendu'
          ? 'actif'
          : null

    if (!nextStatus) return

    const name = [user.prenom, user.nom].filter(Boolean).join(' ')

    const confirmed = window.confirm(
      nextStatus === 'suspendu'
        ? `Suspendre le compte de ${name || user.email} ? Son accès aux fonctionnalités protégées sera bloqué.`
        : `Réactiver le compte de ${name || user.email} ?`
    )

    if (!confirmed) return

    actionLock.current = true
    setBusyId(user.id)
    setActionError('')
    setSuccess('')

    try {
      await updateAdminUserStatus(user.id, nextStatus)

      setSuccess(
        nextStatus === 'suspendu'
          ? 'Le compte a été suspendu.'
          : 'Le compte a été réactivé.'
      )

      setReload(current => current + 1)
    } catch (error) {
      setActionError(
        error.message || 'Impossible de modifier ce compte.'
      )
    } finally {
      actionLock.current = false
      setBusyId(null)
    }
  }

  const controlsDisabled = loading || busyId !== null

  return (
    <main className="p-5 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-atba-clay">
            Administration
          </span>

          <h1 className="mt-3 text-3xl tracking-tight">
            Gestion des utilisateurs
          </h1>

          <p className="mt-3 text-sm leading-6 text-atba-muted">
            Consultez les comptes utilisateurs et gérez leur accès.
            Les comptes administrateurs sont exclus de cette liste.
          </p>
        </div>

        <button
          type="button"
          disabled={controlsDisabled}
          onClick={() => setReload(current => current + 1)}
          className="rounded-full border border-[#e8e3dc] bg-white px-5 py-2.5 text-sm disabled:opacity-50"
        >
          Actualiser
        </button>
      </div>

      <label className="mb-6 block max-w-xs text-sm">
        Statut du compte

        <select
          value={status}
          onChange={changeFilter}
          disabled={controlsDisabled}
          className="mt-2 w-full rounded-xl border border-[#e8e3dc] bg-white px-4 py-3 outline-none focus:border-atba-clay disabled:opacity-50"
        >
          <option value="">Tous les comptes</option>
          <option value="actif">Actifs</option>
          <option value="suspendu">Suspendus</option>
        </select>
      </label>

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

      {loading ? (
        <p role="status" className="text-atba-muted">
          Chargement des utilisateurs…
        </p>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-5 text-red-700"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setReload(current => current + 1)}
            className="mt-3 text-sm underline"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          <p className="mb-5 text-sm text-atba-muted">
            {total} utilisateur{total > 1 ? 's' : ''}
          </p>

          {users.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-[#ded5ca] bg-white p-8">
              <h2 className="text-xl">Aucun utilisateur</h2>

              <p className="mt-3 text-sm text-atba-muted">
                Aucun compte ne correspond à ce filtre.
              </p>
            </section>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {users.map(user => {
                const name = [user.prenom, user.nom]
                  .filter(Boolean)
                  .join(' ')

                const canChangeStatus = [
                  'actif',
                  'suspendu',
                ].includes(user.statut_compte)

                return (
                  <article
                    key={user.id}
                    className="rounded-2xl border border-[#e8e3dc] bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-atba-muted">
                        Utilisateur #{user.id}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs ${
                          user.statut_compte === 'actif'
                            ? 'bg-green-50 text-green-800'
                            : user.statut_compte === 'suspendu'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.statut_compte === 'actif'
                          ? 'Actif'
                          : user.statut_compte === 'suspendu'
                            ? 'Suspendu'
                            : user.statut_compte}
                      </span>
                    </div>

                    <h2 className="mt-5 text-lg font-medium">
                      {name || 'Utilisateur'}
                    </h2>

                    <p className="mt-2 break-all text-sm text-atba-muted">
                      {user.email}
                    </p>

                    <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[#eee9e2] pt-5 text-sm">
                      <div>
                        <dt className="text-atba-muted">Biens</dt>
                        <dd className="mt-1 text-xl font-medium">
                          {user.biens_count ?? 0}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-atba-muted">Annonces</dt>
                        <dd className="mt-1 text-xl font-medium">
                          {user.annonces_count ?? 0}
                        </dd>
                      </div>
                    </dl>

                    {canChangeStatus && (
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => handleStatusChange(user)}
                        className={`mt-6 rounded-full px-5 py-2.5 text-sm disabled:opacity-50 ${
                          user.statut_compte === 'actif'
                            ? 'border border-red-200 text-red-700'
                            : 'bg-atba-clay text-white'
                        }`}
                      >
                        {busyId === user.id
                          ? 'Enregistrement…'
                          : user.statut_compte === 'actif'
                            ? 'Suspendre le compte'
                            : 'Réactiver le compte'}
                      </button>
                    )}
                  </article>
                )
              })}
            </div>
          )}

          {lastPage > 1 && (
            <nav
              aria-label="Pagination des utilisateurs"
              className="mt-8 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                disabled={page <= 1 || busyId !== null}
                onClick={() => setPage(current => current - 1)}
                className="rounded-lg border border-[#e8e3dc] bg-white px-4 py-2 text-sm disabled:opacity-40"
              >
                ← Précédent
              </button>

              <span className="text-sm text-atba-muted">
                Page {page} sur {lastPage}
              </span>

              <button
                type="button"
                disabled={page >= lastPage || busyId !== null}
                onClick={() => setPage(current => current + 1)}
                className="rounded-lg border border-[#e8e3dc] bg-white px-4 py-2 text-sm disabled:opacity-40"
              >
                Suivant →
              </button>
            </nav>
          )}

          <p className="mt-6 text-xs leading-6 text-atba-muted">
            La suspension du compte ne retire pas ses annonces publiques.
            Leur visibilité se gère dans la rubrique Annonces.
          </p>
        </>
      )}
    </main>
  )
}