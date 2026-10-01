function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

async function readResponse(response) {
  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    const messages = {
      401: 'Votre session a expiré. Reconnectez-vous.',
      403: 'Vous ne pouvez pas accéder à cette conversation.',
      404: 'Cette conversation est introuvable ou inaccessible.',
      419: 'Rechargez la page puis réessayez.',
      429: 'Trop de messages envoyés. Patientez puis réessayez.',
    }

    const validationMessage = Object.values(result.errors ?? {})
      .flat()[0]

    throw new Error(
      messages[response.status]
      || validationMessage
      || result.message
      || 'Impossible de charger la messagerie.'
    )
  }

  return result
}

export async function getConversations(page = 1, signal) {
  const response = await fetch(`/api/conversations?page=${page}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    signal,
  })

  return readResponse(response)
}

export async function getConversation(id, page = 1, signal) {
  const response = await fetch(
    `/api/conversations/${id}?page=${page}`,
    {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      signal,
    }
  )

  return readResponse(response)
}

export async function sendMessage(id, contenu) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer l’envoi.')
  }

  const response = await fetch(`/api/conversations/${id}/messages`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
    },
    body: JSON.stringify({ contenu }),
  })

  return readResponse(response)
}
export async function startConversation(annonceId) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer la conversation.')
  }

  const response = await fetch(
    `/api/annonces/${annonceId}/conversation`,
    {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-XSRF-TOKEN': csrfToken(),
      },
    }
  )

  return readResponse(response)
}