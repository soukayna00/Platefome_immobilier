function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

async function readResponse(response) {
  if (response.status === 204) return null

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    const messages = {
      401: 'Votre session a expiré. Reconnectez-vous.',
      403: 'Vous n’êtes pas autorisé à effectuer cette action.',
      404: 'Cette recherche est introuvable.',
      419: 'Rechargez la page puis réessayez.',
      422: 'Vérifiez les champs du formulaire.',
      429: 'Trop de tentatives. Patientez puis réessayez.',
    }

    const error = new Error(
      messages[response.status]
        || result.message
        || 'Impossible de traiter votre demande.'
    )

    error.status = response.status
    error.errors = result.errors || {}

    throw error
  }

  return result
}

async function prepareCsrf() {
  const response = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Impossible de préparer l’enregistrement.')
  }
}

export async function getMyRecherches(page = 1, signal) {
  const params = new URLSearchParams({
    page: String(page),
  })

  const response = await fetch(
    `/api/mes-recherches?${params.toString()}`,
    {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
      signal,
    }
  )

  return readResponse(response)
}

export async function createRecherche(data) {
  await prepareCsrf()

  const response = await fetch('/api/mes-recherches', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
    },
    body: JSON.stringify(data),
  })

  return readResponse(response)
}

export async function deleteRecherche(id) {
  await prepareCsrf()

  const response = await fetch(
    `/api/mes-recherches/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-XSRF-TOKEN': csrfToken(),
      },
    }
  )

  return readResponse(response)
}