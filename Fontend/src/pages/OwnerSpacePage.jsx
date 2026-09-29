import { Link } from 'react-router'

export default function OwnerSpacePage() {
  const items = [
    [
      'Mes biens',
      'Enregistrez les caractéristiques et photos du bien.',
    ],
    [
      'Mes annonces',
      'Publiez une annonce de vente ou de location.',
    ],
    [
      'Demandes de visite reçues',
      'Consultez les demandes liées à vos annonces.',
    ],
    [
      'Messages',
      'Échangez avec les personnes intéressées.',
    ],
  ]

  return (
    <main className="mx-auto min-h-[65vh] max-w-[1280px] px-5 py-12 lg:px-9">
      <h1 className="text-4xl tracking-tight">
        Espace Propriétaire
      </h1>

      <p className="mb-7 mt-2 text-atba-muted">
        Gérez vos biens et vos annonces avec le même compte
        que votre espace Recherche.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {items.map(([title, description]) => (
          <section
            key={title}
            className="rounded-xl border border-[#e8e3dc] bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl">{title}</h2>

            <p className="my-4 text-sm text-atba-muted">
              {description}
            </p>

            {title === 'Messages' ? (
              <Link to="/messages" className="text-sm text-atba-clay">
                Ouvrir →
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  alert('Fonction à connecter à l’API Laravel.')
                }
                className="text-sm text-atba-clay"
              >
                Gérer →
              </button>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}