export function mapAnnonce(annonce) {
  const bien = annonce.bien

  const photos = [...(bien.photos || [])]
    .sort((a, b) => a.ordre - b.ordre)
    .map(photo => photo.url_photo)

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

export async function getAnnonces(transaction, signal) {
  const params = new URLSearchParams()

  if (transaction) {
    params.set('transaction', transaction)
  }

  const query = params.toString()
  const url = `/api/annonces${query ? `?${query}` : ''}`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
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
      headers: { Accept: 'application/json' },
      signal,
    }
  )

  if (response.status === 404) {
    throw new Error('Cette annonce est introuvable.')
  }

  if (!response.ok) {
    throw new Error('Impossible de charger cette annonce.')
  }

  const annonce = await response.json()

  return mapAnnonce(annonce)
}