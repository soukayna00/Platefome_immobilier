export function mapAnnonce(annonce) {
  const bien = annonce.bien

  if (!bien) {
    throw new Error('Les informations du bien sont indisponibles.')
  }

  const photos = [...(bien.photos || [])]
    .sort((a, b) => a.ordre - b.ordre)
    .map(photo => photo.url_photo)
    .filter(Boolean)

  return {
    id: annonce.id,
    bienId: bien.id,
    title: bien.titre,
    description: bien.description || '',
    transaction: annonce.type_transaction,
    price: Number(annonce.prix),
    city: bien.ville?.nom_ville || '',
    neighborhood: bien.quartier || '',
    propertyType: bien.type_bien?.libelle || '',
    area: Number(bien.surface),
    bedrooms: bien.nbr_chambres,
    bathrooms: bien.nbr_salle_bain,
    image: photos[0] || null,
    photos,
  }
}

export async function getAnnonces(
  transaction,
  signal,
  filters = {},
  page = 1
) {
  const params = new URLSearchParams()

  if (transaction) {
    params.set('transaction', transaction)
  }

  for (const key of ['city', 'type', 'quarter', 'max']) {
    const value = filters[key]

    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }

  params.set('page', String(page))

  const response = await fetch(`/api/annonces?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error('Impossible de charger les annonces.')
  }

  const result = await response.json()

  return {
    properties: result.data.map(mapAnnonce),
    total: result.total,
    currentPage: result.current_page,
    lastPage: result.last_page,
  }
}

export async function getAnnonce(id, signal) {
  const response = await fetch(
    `/api/annonces/${encodeURIComponent(id)}`,
    {
      headers: {
        Accept: 'application/json',
      },
      signal,
    }
  )

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'Cette annonce est introuvable ou indisponible.'
        : 'Impossible de charger l’annonce.'
    )
  }

  const annonce = await response.json()

  return mapAnnonce(annonce)
}