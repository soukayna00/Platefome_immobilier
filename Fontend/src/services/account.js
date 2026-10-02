function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

async function updateAccount(path, method, data) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer la modification.')
  }

  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
    },
    body: JSON.stringify(data),
  })

  const result = response.status === 204
    ? null
    : await response.json().catch(() => ({}))

  if (!response.ok) {
    const messages = {
      401: 'Votre session a expiré. Reconnectez-vous.',
      403: 'Votre compte ne permet pas cette action.',
      419: 'Rechargez la page puis réessayez.',
      422: 'Vérifiez les champs du formulaire.',
      429: 'Trop de tentatives. Patientez une minute puis réessayez.',
    }

    const error = new Error(
      messages[response.status] || 'Impossible d’enregistrer la modification.'
    )

    error.errors = result?.errors || {}
    error.status = response.status
    throw error
  }

  return result
}

export function updateProfile(data) {
  return updateAccount('/api/profile', 'PATCH', data)
}

export function updatePassword(data) {
  return updateAccount('/api/password', 'PUT', data)
}