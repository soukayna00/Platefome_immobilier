import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAuth } from '../context/AuthContext'
import {
  getConversations,
  getConversation,
  sendMessage,
} from '../services/messages.js'

function fullName(person) {
  return [person?.prenom, person?.nom]
    .filter(Boolean)
    .join(' ') || 'Utilisateur'
}

function formatTime(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('fr-MA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const conversationId = params.get('conversation')

  const [conversations, setConversations] = useState([])
  const [listPage, setListPage] = useState(1)
  const [listLastPage, setListLastPage] = useState(1)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagePage, setMessagePage] = useState(1)
  const [messageLastPage, setMessageLastPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [reload, setReload] = useState(0)

  const sendLock = useRef(false)
  const bottomRef = useRef(null)
  const currentConversationId = useRef(conversationId)
  currentConversationId.current = conversationId

  useEffect(() => {
    const controller = new AbortController()

    async function loadList() {
      setListLoading(true)
      setListError('')

      try {
        const result = await getConversations(
          listPage,
          controller.signal
        )

        if (!controller.signal.aborted) {
          setConversations(result.data)
          setListLastPage(result.last_page)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setListError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setListLoading(false)
        }
      }
    }

    loadList()

    return () => controller.abort()
  }, [listPage, reload, user?.id])

  useEffect(() => {
    setDraft('')
    setSendError('')
  }, [conversationId, user?.id])

  useEffect(() => {
    const controller = new AbortController()

    setConversation(null)
    setMessages([])
    setError('')

    if (!conversationId) {
      setLoading(false)
      return () => controller.abort()
    }

    async function loadMessages() {
      setLoading(true)

      try {
        const result = await getConversation(
          conversationId,
          messagePage,
          controller.signal
        )

        if (!controller.signal.aborted) {
          setConversation(result.conversation)
          setMessages([...result.messages.data].reverse())
          setMessageLastPage(result.messages.last_page)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadMessages()

    return () => controller.abort()
  }, [conversationId, messagePage, reload, user?.id])

  useEffect(() => {
    if (messagePage === 1) {
      bottomRef.current?.scrollIntoView({
        block: 'nearest',
      })
    }
  }, [messages, messagePage])

  function selectConversation(id) {
    if (sendLock.current) return

    setMessagePage(1)
    setParams({ conversation: String(id) })
  }

  async function handleSend(event) {
    event.preventDefault()

    const contenu = draft.trim()

    if (
      !contenu
      || !conversation
      || sendLock.current
      || conversation.statut_conversation !== 'active'
    ) {
      return
    }

    const targetId = conversationId

    sendLock.current = true
    setSending(true)
    setSendError('')

    try {
      await sendMessage(targetId, contenu)

      if (currentConversationId.current === targetId) {
        setDraft('')
        setMessagePage(1)
        setReload(current => current + 1)
      }
    } catch (error) {
      if (currentConversationId.current === targetId) {
        setSendError(error.message || 'Impossible d’envoyer le message.')
      }
    } finally {
      sendLock.current = false
      setSending(false)
    }
  }

  function otherParticipant(item) {
    return Number(item.proprietaire_id) === Number(user?.id)
      ? item.interlocuteur
      : item.proprietaire
  }

  const active = conversation?.statut_conversation === 'active'

  const buttonClass =
    'rounded-lg border border-[#e8e3dc] bg-white px-3 py-2 text-xs disabled:opacity-40'

  return (
    <main className="min-h-[70vh] bg-[#f7f4ef] px-5 py-10 lg:px-9">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl tracking-tight sm:text-4xl">
              Messagerie
            </h1>

            <p className="mt-3 text-sm text-atba-muted">
              Vos échanges sont organisés par annonce.
            </p>
          </div>

          <button
            type="button"
            disabled={loading || listLoading || sending}
            onClick={() => setReload(current => current + 1)}
            className={buttonClass}
          >
            Actualiser
          </button>
        </div>

        <div className="grid overflow-hidden rounded-2xl border border-[#e8e3dc] bg-white shadow-sm md:grid-cols-[300px_1fr]">
          <aside className="border-b border-[#e8e3dc] p-5 md:border-b-0 md:border-r">
            <h2 className="font-medium">Conversations</h2>

            {listLoading ? (
              <p role="status" className="mt-5 text-sm text-atba-muted">
                Chargement…
              </p>
            ) : listError ? (
              <p role="alert" className="mt-5 text-sm text-red-700">
                {listError}
              </p>
            ) : conversations.length === 0 ? (
              <p className="mt-5 text-sm leading-6 text-atba-muted">
                Aucune conversation sur cette page.
              </p>
            ) : (
              <div className="mt-5 space-y-2">
                {conversations.map(item => {
                  const selected =
                    String(item.id) === conversationId

                  const property = item.annonce?.bien
                  const photo = property?.photos?.[0]?.url_photo

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={sending}
                      onClick={() => selectConversation(item.id)}
                      aria-pressed={selected}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition disabled:opacity-50 ${
                        selected
                          ? 'bg-atba-cream'
                          : 'hover:bg-[#fcfaf7]'
                      }`}
                    >
                      {photo && (
                        <img
                          src={photo}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {fullName(otherParticipant(item))}
                        </p>
                        <p className="mt-1 truncate text-xs text-atba-muted">
                          {property?.titre || 'Annonce'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {listLastPage > 1 && (
              <nav
                aria-label="Pagination des conversations"
                className="mt-5 flex items-center justify-between gap-2"
              >
                <button
                  type="button"
                  disabled={listLoading || sending || listPage <= 1}
                  onClick={() => setListPage(current => current - 1)}
                  className={buttonClass}
                >
                  ←
                </button>

                <span className="text-xs text-atba-muted">
                  {listPage} / {listLastPage}
                </span>

                <button
                  type="button"
                  disabled={
                    listLoading || sending || listPage >= listLastPage
                  }
                  onClick={() => setListPage(current => current + 1)}
                  className={buttonClass}
                >
                  →
                </button>
              </nav>
            )}
          </aside>

          <section className="flex min-h-[550px] min-w-0 flex-col">
            {!conversationId ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-atba-muted">
                Sélectionnez une conversation pour lire vos messages.
              </div>
            ) : loading ? (
              <p role="status" className="p-6 text-sm text-atba-muted">
                Chargement des messages…
              </p>
            ) : error ? (
              <p role="alert" className="m-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            ) : conversation && (
              <>
                <header className="border-b border-[#eee9e2] p-5">
                  <h2 className="font-medium">
                    {fullName(otherParticipant(conversation))}
                  </h2>

                  <p className="mt-1 text-sm text-atba-muted">
                    {conversation.annonce?.bien?.titre || 'Annonce'}
                  </p>

                  {conversation.annonce && (
                    <Link
                      to={`/bien/${conversation.annonce_id}`}
                      className="mt-2 inline-block text-xs text-atba-clay"
                    >
                      Voir l’annonce →
                    </Link>
                  )}
                </header>

                {messageLastPage > 1 && (
                  <nav
                    aria-label="Historique des messages"
                    className="flex flex-wrap items-center justify-center gap-3 border-b border-[#eee9e2] p-3"
                  >
                    <button
                      type="button"
                      disabled={
                        sending || messagePage >= messageLastPage
                      }
                      onClick={() =>
                        setMessagePage(current => current + 1)
                      }
                      className={buttonClass}
                    >
                      Messages plus anciens
                    </button>

                    <button
                      type="button"
                      disabled={sending || messagePage <= 1}
                      onClick={() =>
                        setMessagePage(current => current - 1)
                      }
                      className={buttonClass}
                    >
                      Messages plus récents
                    </button>
                  </nav>
                )}

                <div className="max-h-[500px] flex-1 space-y-4 overflow-y-auto p-5">
                  {messages.length === 0 ? (
                    <p className="py-8 text-center text-sm text-atba-muted">
                      Aucun message. Commencez la conversation.
                    </p>
                  ) : messages.map(message => {
                    const mine =
                      Number(message.expediteur_id) === Number(user?.id)

                    return (
                      <div
                        key={message.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                            mine
                              ? 'bg-[#f5e7df]'
                              : 'bg-atba-cream'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {message.contenu}
                          </p>

                          <p className="mt-2 text-right text-[10px] text-atba-muted">
                            {formatTime(message.date_envoi)}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  <div ref={bottomRef} />
                </div>

                <div className="mt-auto border-t border-[#eee9e2] p-5">
                  {sendError && (
                    <p role="alert" className="mb-3 text-sm text-red-700">
                      {sendError}
                    </p>
                  )}

                  {active ? (
                    <form onSubmit={handleSend} className="flex items-end gap-3">
                      <textarea
                        aria-label="Votre message"
                        value={draft}
                        onChange={event => setDraft(event.target.value)}
                        placeholder="Écrire un message…"
                        maxLength={5000}
                        rows={2}
                        required
                        disabled={sending}
                        className="min-w-0 flex-1 resize-y rounded-xl border border-[#e8e3dc] p-3 text-sm outline-none focus:border-atba-clay disabled:opacity-50"
                      />

                      <button
                        type="submit"
                        disabled={sending || !draft.trim()}
                        className="rounded-xl bg-atba-clay px-5 py-3 text-sm text-white disabled:opacity-50"
                      >
                        {sending ? 'Envoi…' : 'Envoyer'}
                      </button>
                    </form>
                  ) : (
                    <p className="text-sm text-atba-muted">
                      Cette conversation est fermée.
                    </p>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}