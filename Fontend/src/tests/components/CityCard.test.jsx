import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import CityCard from '../../components/home/CityCard'

function renderCityCard(props = {}) {
  return render(
    <MemoryRouter>
      <CityCard
        name="Tanger"
        image="/images/tanger.webp"
        {...props}
      />
    </MemoryRouter>
  )
}

describe('CityCard', () => {
  it('affiche le nom de la ville', () => {
    renderCityCard()

    expect(screen.getByText('Tanger')).toBeInTheDocument()
  })

  it('affiche l’image avec le bon texte alternatif', () => {
    renderCityCard()

    expect(
      screen.getByRole('img', { name: 'Tanger' })
    ).toHaveAttribute(
      'src',
      '/images/tanger.webp'
    )
  })

  it('génère le lien correspondant à la ville', () => {
    renderCityCard({ name: 'Rabat' })

    expect(
      screen.getByRole('link', { name: /voir les biens/i })
    ).toHaveAttribute(
      'href',
      '/annonces?city=Rabat'
    )
  })

  it('affiche le texte Voir les biens', () => {
    renderCityCard()

    expect(
      screen.getByText('Voir les biens →')
    ).toBeInTheDocument()
  })
})