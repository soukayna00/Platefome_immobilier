import {Link} from 'react-router'
export default function AccountPage(){
    return <main className="mx-auto min-h-[65vh] max-w-[1280px] px-5 py-12 lg:px-9">
            <h1 className="text-4xl tracking-tight">Mon compte</h1>
            <p className="mb-7 mt-2 text-atba-muted">Un seul compte pour rechercher, acheter, louer ou publier un bien.</p>
            <div className="max-w-xl rounded-xl border border-[#e8e3dc] bg-white p-6"><h2 className="text-xl">Profil de démonstration</h2>
            <p className="my-4 text-sm text-atba-muted">L’authentification sera reliée à Laravel Sanctum. Aucun profil réel n’est créé ici.</p>
            <div className="flex flex-wrap gap-3"><Link to="/espace-recherche" className="rounded-lg bg-atba-clay px-5 py-3 text-sm text-white">Espace Recherche</Link>
            <Link to="/espace-proprietaire" className="rounded-lg border border-atba-ink px-5 py-3 text-sm">Espace Propriétaire</Link>
            </div>
            </div>
        </main>
        }
