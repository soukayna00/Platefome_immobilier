function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

export async function createBien(data) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer l’enregistrement.')
  }

  const response = await fetch('/api/mes-biens', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
    },
    body: data,
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    const messages = {
      401: 'Votre session a expiré. Reconnectez-vous.',
      413: 'Les fichiers dépassent la taille autorisée par le serveur.',
      419: 'La session de sécurité a expiré. Rechargez la page.',
      422: 'Vérifiez les champs du formulaire.',
    }

    const error = new Error(
      messages[response.status] || 'Impossible d’enregistrer le bien.'
    )

    error.errors = result.errors || {}
    throw error
  }

  return result
}

async function changeBien(id, method, data) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer cette action.')
  }

  const response = await fetch(`/api/mes-biens/${id}`, {
    method,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
      ...(data ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  })

  const result = response.status === 204
    ? null
    : await response.json().catch(() => ({}))

  if (!response.ok) {
    const messages = {
      401: 'Votre session a expiré. Reconnectez-vous.',
      404: 'Ce bien est introuvable ou inaccessible.',
      419: 'Rechargez la page puis réessayez.',
      422: 'Vérifiez les champs du formulaire.',
    }

    const error = new Error(
      response.status === 409
        ? result?.message || 'Ce bien ne peut pas être supprimé.'
        : messages[response.status] || 'Impossible de terminer cette action.'
    )

    error.errors = result?.errors || {}
    throw error
  }

  return result
}

export function updateBien(id, data) {
  return changeBien(id, 'PUT', data)
}

export function deleteBien(id) {
  return changeBien(id, 'DELETE')
}