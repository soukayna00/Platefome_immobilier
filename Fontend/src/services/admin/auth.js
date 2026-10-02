function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

export async function loginAdmin(email, password) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer la connexion.')
  }

  const response = await fetch('/admin/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken(),
    },
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  })

  if (!response.ok) {
    const result = await response.json().catch(() => ({}))

    const messages = {
      419: 'Rechargez la page puis réessayez.',
      429: 'Trop de tentatives. Patientez avant de réessayer.',
    }

    throw new Error(
      messages[response.status]
      || result.errors?.email?.[0]
      || result.message
      || 'Connexion impossible.'
    )
  }
}