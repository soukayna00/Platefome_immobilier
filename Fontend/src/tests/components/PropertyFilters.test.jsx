import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import PropertyFilters from '../../components/property/PropertyFilters'

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}))

vi.mock('../../components/property/SaveSearchForm', () => ({
  default: () => null,
}))

describe('PropertyFilters', () => {
  it('charge les villes et les types de biens', async () => {
    globalThis.fetch = vi.fn(url => {
      if (url === '/api/villes') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, nom_ville: 'Tanger' },
              { id: 2, nom_ville: 'Rabat' },
            ]),
        })
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: 1, libelle: 'Appartement' },
            { id: 2, libelle: 'Villa' },
          ]),
      })
    })

    render(
      <MemoryRouter>
        <PropertyFilters
          filters={{
            city: '',
            type: '',
            quarter: '',
            max: '',
          }}
          onChange={vi.fn()}
        />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Tanger' }))
        .toBeInTheDocument()
    })

    expect(
      screen.getByRole('option', { name: 'Appartement' })
    ).toBeInTheDocument()
  })
})