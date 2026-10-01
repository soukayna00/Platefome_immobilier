function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

export async function createVisite(annonceId, data) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer la demande.')
  }

  const response = await fetch(`/api/annonces/${annonceId}/visites`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
    },
    body: JSON.stringify(data),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    const messages = {
      401: 'Votre session a expiré. Reconnectez-vous.',
      403: 'Vous ne pouvez pas demander une visite de votre propre annonce.',
      404: 'Cette annonce est introuvable ou n’est plus publiée.',
      409: result.message || 'Une demande est déjà en attente.',
      419: 'Rechargez la page puis réessayez.',
      422: 'Vérifiez la date, l’heure et le message.',
    }

    const error = new Error(
      messages[response.status] || 'Impossible d’envoyer la demande.'
    )

    error.errors = result.errors || {}
    throw error
  }

  return result
}