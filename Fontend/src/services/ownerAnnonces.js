function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

export async function createAnnonce(bienId, data) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer l’enregistrement.')
  }

  const response = await fetch(`/api/mes-biens/${bienId}/annonces`, {
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
      404: 'Ce bien est introuvable ou inaccessible.',
      419: 'Rechargez la page puis réessayez.',
      422: 'Vérifiez les champs du formulaire.',
    }

    const error = new Error(
      messages[response.status] || 'Impossible de créer l’annonce.'
    )

    error.errors = result.errors || {}
    throw error
  }

  return result
}


export async function getMyAnnonces(page = 1, signal) {
  const response = await fetch(`/api/mes-annonces?page=${page}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Votre session a expiré. Reconnectez-vous.'
        : 'Impossible de charger vos annonces.'
    )
  }

  return response.json()
}

export async function deleteAnnonce(id) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer la suppression.')
  }

  const response = await fetch(`/api/mes-annonces/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
    },
  })

  if (!response.ok) {
    const result = await response.json().catch(() => ({}))

    const messages = {
      401: 'Votre session a expiré. Reconnectez-vous.',
      404: 'Cette annonce est introuvable ou inaccessible.',
      419: 'Rechargez la page puis réessayez.',
      409: result.message || 'Cette annonce possède des données liées.',
    }

    throw new Error(
      messages[response.status] || 'Impossible de supprimer l’annonce.'
    )
  }
}


export async function updateAnnonce(id, data) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer la modification.')
  }

  const response = await fetch(`/api/mes-annonces/${id}`, {
    method: 'PUT',
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
      404: 'Cette annonce est introuvable ou inaccessible.',
      419: 'Rechargez la page puis réessayez.',
      422: 'Vérifiez les champs du formulaire.',
    }

    const error = new Error(
      messages[response.status] || 'Impossible de modifier l’annonce.'
    )

    error.errors = result.errors || {}
    throw error
  }

  return result
}