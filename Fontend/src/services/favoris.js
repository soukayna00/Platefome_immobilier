import { mapAnnonce } from './annonces.js'

function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

export async function getFavoris(signal) {
  const response = await fetch('/api/favoris', {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error('Impossible de charger vos favoris.')
  }

  const annonces = await response.json()

  return annonces.map(mapAnnonce)
}

export async function updateFavori(id, add) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer la modification des favoris.')
  }

  const response = await fetch(
    `/api/favoris/${encodeURIComponent(id)}`,
    {
      method: add ? 'POST' : 'DELETE',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-XSRF-TOKEN': csrfToken(),
      },
    }
  )

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Connectez-vous pour modifier vos favoris.'
        : 'Impossible de modifier ce favori.'
    )
  }
}