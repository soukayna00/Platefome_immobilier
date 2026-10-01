import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import {
  getNotifications,
  markNotificationRead,
} from '../services/notifications.js'

const dateFormatter = new Intl.DateTimeFormat('fr-MA', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Casablanca',
})

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [reload, setReload] = useState(0)

  const actionLock = useRef(false)
  const currentUserId = useRef(user?.id)
  currentUserId.current = user?.id

  useEffect(() => {
    const controller = new AbortController()

    async function loadNotifications() {
      setLoading(true)
      setError('')
      setActionError('')
      setNotifications([])
      setUnreadCount(0)

      if (!user) {
        setLoading(false)
        return
      }

      try {
        const result = await getNotifications(page, controller.signal)

        if (controller.signal.aborted) return

        const pagination = result.notifications

        if (page > pagination.last_page && page > 1) {
          setPage(pagination.last_page)
          return
        }

        setNotifications(pagination.data)
        setLastPage(pagination.last_page)
        setUnreadCount(result.unread_count)
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message || 'Impossible de charger les notifications.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadNotifications()

    return () => controller.abort()
  }, [user?.id, page, reload])

  async function handleRead(notification) {
    if (notification.date_lecture || actionLock.current) return

    const userId = user?.id
    actionLock.current = true
    setBusyId(notification.id)
    setActionError('')

    try {
      await markNotificationRead(notification.id)

      if (currentUserId.current === userId) {
        setReload(current => current + 1)
      }
    } catch (error) {
      if (currentUserId.current === userId) {
        setActionError(
          error.message || 'Impossible de marquer cette notification comme lue.'
        )
      }
    } finally {
      actionLock.current = false
      setBusyId(null)
    }
  }

  return (
    <main className="min-h-[65vh] bg-[#f7f4ef] px-5 py-10 lg:px-9">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl tracking-tight sm:text-4xl">
              Notifications
            </h1>
            <p className="mt-3 text-sm text-atba-muted">
              Retrouvez les réponses à vos demandes de visite.
            </p>
          </div>

          <button
            type="button"
            disabled={loading || busyId !== null}
            onClick={() => setReload(current => current + 1)}
            className="rounded-full border border-[#e8e3dc] bg-white px-5 py-2.5 text-sm disabled:opacity-50"
          >
            Actualiser
          </button>
        </div>

        {actionError && (
          <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">
            {actionError}
          </p>
        )}

        {loading ? (
          <p role="status" className="text-atba-muted">
            Chargement des notifications…
          </p>
        ) : error ? (
          <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setReload(current => current + 1)}
              className="mt-3 underline"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-atba-muted">
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue
              {unreadCount > 1 ? 's' : ''}
            </p>

            {notifications.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#ded5ca] bg-white p-8 text-atba-muted">
                Aucune notification pour le moment.
              </p>
            ) : (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <article
                    key={notification.id}
                    className={`rounded-2xl border bg-white p-5 sm:p-6 ${
                      notification.date_lecture
                        ? 'border-[#e8e3dc]'
                        : 'border-atba-clay'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-lg font-medium">
                        {notification.titre}
                      </h2>

                      {!notification.date_lecture && (
                        <span className="rounded-full bg-atba-clay/10 px-3 py-1 text-xs text-atba-clay">
                          Non lue
                        </span>
                      )}
                    </div>

                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-atba-muted">
                      {notification.contenu}
                    </p>

                    <time
                      dateTime={notification.date_creation}
                      className="mt-3 block text-xs text-atba-muted"
                    >
                      {formatDate(notification.date_creation)}
                    </time>

                    <div className="mt-5 flex flex-wrap items-center gap-4">
                      {notification.type_notification?.startsWith('visite_') && (
                        <Link
                          to="/mes-visites"
                          className="text-sm font-medium text-atba-clay"
                        >
                          Voir mes visites →
                        </Link>
                      )}

                      {!notification.date_lecture && (
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() => handleRead(notification)}
                          className="rounded-full border border-[#e8e3dc] px-4 py-2 text-sm disabled:opacity-50"
                        >
                          {busyId === notification.id
                            ? 'Enregistrement…'
                            : 'Marquer comme lue'}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {lastPage > 1 && (
              <nav
                aria-label="Pagination des notifications"
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
          </>
        )}
      </div>
    </main>
  )
}