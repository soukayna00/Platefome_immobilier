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
      403: 'Vous n’êtes pas autorisé à effectuer cette action.',
      404: 'La ressource demandée est introuvable.',
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

async function getCatalogue(resource, signal) {
  const response = await fetch(`/api/admin/${resource}`, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  return readResponse(response)
}

async function saveCatalogue(resource, method, data) {
  const csrfResponse = await fetch('/sanctum/csrf-cookie', {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!csrfResponse.ok) {
    throw new Error('Impossible de préparer l’enregistrement.')
  }

  const response = await fetch(`/api/admin/${resource}`, {
    method,
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

// Villes
export function getAdminVilles(signal) {
  return getCatalogue('villes', signal)
}

export function createAdminVille(nomVille) {
  return saveCatalogue('villes', 'POST', {
    nom_ville: nomVille.trim(),
  })
}

export function updateAdminVille(id, nomVille) {
  return saveCatalogue(
    `villes/${encodeURIComponent(id)}`,
    'PUT',
    {
      nom_ville: nomVille.trim(),
    }
  )
}

// Types de biens
export function getAdminTypesBien(signal) {
  return getCatalogue('types-bien', signal)
}

export function createAdminTypeBien(libelle) {
  return saveCatalogue('types-bien', 'POST', {
    libelle: libelle.trim(),
  })
}

export function updateAdminTypeBien(id, libelle) {
  return saveCatalogue(
    `types-bien/${encodeURIComponent(id)}`,
    'PUT',
    {
      libelle: libelle.trim(),
    }
  )
}