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
      403: 'Cet espace est réservé aux administrateurs.',
      404: 'Cette ressource est introuvable.',
      419: 'Rechargez la page puis réessayez.',
      422: 'Vérifiez les données envoyées.',
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

export async function getAdminAnnonces(
  statut = '',
  page = 1,
  signal,
  transaction = ''
) {
  const params = new URLSearchParams({
    page: String(page),
  })

  if (statut) params.set('statut', statut)
  if (transaction) params.set('transaction', transaction)

  const response = await fetch(
    `/api/admin/annonces?${params.toString()}`,
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

export async function getAdminAnnonce(id, signal) {
  const response = await fetch(`/api/admin/annonces/${id}`, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  return readResponse(response)
}

export async function updateAdminAnnonceStatus(id, statut) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer la modification.')
  }

  const response = await fetch(`/api/admin/annonces/${id}/statut`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
    },
    body: JSON.stringify({
      statut_annonce: statut,
    }),
  })

  return readResponse(response)
}