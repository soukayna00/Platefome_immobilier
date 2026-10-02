import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PropertyCard from '../../components/property/PropertyCard'

const toggleFavorite = vi.fn()

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1 },
    loading: false,
  }),
}))

vi.mock('../../context/AtbaContext', () => ({
  useAtba: () => ({
    favorites: [],
    toggleFavorite,
  }),
}))

const property = {
  id: 7,
  title: 'Appartement à Tanger',
  image: '/images/tanger.webp',
  transaction: 'vente',
  city: 'Tanger',
  neighborhood: 'Malabata',
  price: 850000,
  area: 95,
  bedrooms: 2,
}

describe('PropertyCard', () => {
  beforeEach(() => {
    toggleFavorite.mockReset()
  })

  it('affiche les informations du bien', () => {
    render(
      <MemoryRouter>
        <PropertyCard property={property} />
      </MemoryRouter>
    )

    expect(
      screen.getByText('Appartement à Tanger')
    ).toBeInTheDocument()

    expect(screen.getByText('Vente')).toBeInTheDocument()
    expect(screen.getByText(/Malabata/)).toBeInTheDocument()
    expect(screen.getByText(/95 m²/)).toBeInTheDocument()
  })

  it('redirige vers la fiche du bien', () => {
    render(
      <MemoryRouter>
        <PropertyCard property={property} />
      </MemoryRouter>
    )

    expect(
      screen.getAllByRole('link', {
        name: /appartement à tanger/i,
      })[0]
    ).toHaveAttribute('href', '/bien/7')
  })
})