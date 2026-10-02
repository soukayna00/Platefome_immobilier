function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

async function request(url, method, data) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer cette action.')
  }

  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
    },
    body: JSON.stringify(data ?? {}),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    const messages = {
      401: 'Votre session a expiré. Reconnectez-vous.',
      403: 'Cette action ne vous est pas autorisée.',
      404: 'Cette demande est introuvable ou inaccessible.',
      419: 'Rechargez la page puis réessayez.',
    }

    const validationMessage = Object.values(result.errors ?? {})
      .flat()[0]

    throw new Error(
      messages[response.status]
      || validationMessage
      || result.message
      || 'Impossible de terminer cette action.'
    )
  }

  return result
}

export function updateVisitStatus(id, statut) {
  return request(
    `/api/visites-recues/${id}/statut`,
    'PATCH',
    { statut }
  )
}

export function contactVisitRequester(id) {
  return request(
    `/api/visites-recues/${id}/conversation`,
    'POST'
  )
}