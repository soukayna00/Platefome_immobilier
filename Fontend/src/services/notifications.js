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
      403: 'Votre compte ne peut pas accéder aux notifications.',
      404: 'Cette notification est introuvable.',
      419: 'Rechargez la page puis réessayez.',
    }

    throw new Error(
      messages[response.status] || 'Impossible de charger les notifications.'
    )
  }

  return result
}

export async function getNotifications(page = 1, signal) {
  const response = await fetch(`/api/notifications?page=${page}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    signal,
  })

  return readResponse(response)
}

export async function markNotificationRead(id) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer la mise à jour.')
  }

  const response = await fetch(
    `/api/notifications/${encodeURIComponent(id)}/lecture`,
    {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-XSRF-TOKEN': csrfToken(),
      },
    }
  )

  return readResponse(response)
}