function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

export async function createSignalement(annonceId, data) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer le signalement.')
  }

  const response = await fetch(
    `/api/annonces/${annonceId}/signalements`,
    {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken(),
      },
      body: JSON.stringify(data),
    }
  )

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    const messages = {
      401: 'Votre session a expiré. Reconnectez-vous.',
      404: 'Cette annonce est introuvable ou indisponible.',
      419: 'Rechargez la page puis réessayez.',
      422: 'Vérifiez les champs du formulaire.',
      429: 'Trop de tentatives. Patientez puis réessayez.',
    }

    const error = new Error(
      messages[response.status]
      || result.message
      || 'Impossible d’envoyer le signalement.'
    )

    error.errors = result.errors || {}
    throw error
  }

  return result
}