import { Link } from 'react-router'

const items = [
  {
    title: 'Mes biens',
    description: 'Enregistrez les caractéristiques et les photos de vos biens.',
    path: '/mes-biens',
    action: 'Gérer',
  },
  {
    title: 'Mes annonces',
    description: 'Retrouvez vos brouillons et vos annonces publiées.',
    path: '/mes-annonces',
    action: 'Gérer',
  },
  {
    title: 'Demandes de visite reçues',
    description: 'Consultez les demandes liées à vos annonces.',
    path: null,
  },
  {
    title: 'Messages',
    description: 'Échangez avec les personnes intéressées.',
    path: '/messages',
    action: 'Ouvrir',
  },
]

export default function OwnerSpacePage() {
  return (
    <main className="min-h-[65vh] bg-[#f7f4ef] px-5 py-12 lg:px-9">
      <div className="mx-auto max-w-[1280px]">
        <span className="text-xs uppercase tracking-[0.2em] text-atba-clay">
          Mon espace
        </span>

        <h1 className="mt-3 text-3xl tracking-tight sm:text-4xl">
          Espace Propriétaire
        </h1>

        <p className="mb-8 mt-3 max-w-2xl text-sm leading-7 text-atba-muted">
          Gérez vos biens et vos annonces avec le même compte
          que votre espace Recherche.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          {items.map(item => (
            <section
              key={item.title}
              className="flex flex-col rounded-2xl border border-[#e8e3dc] bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-xl font-medium">
                {item.title}
              </h2>

              <p className="mb-6 mt-3 text-sm leading-6 text-atba-muted">
                {item.description}
              </p>

              <div className="mt-auto">
                {item.path ? (
                  <Link
                    to={item.path}
                    className="inline-flex items-center gap-2 rounded-full bg-atba-clay px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-atba-clay"
                  >
                    {item.action}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <span className="inline-block rounded-full bg-atba-cream px-4 py-2 text-xs text-atba-muted">
                    Bientôt disponible
                  </span>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}