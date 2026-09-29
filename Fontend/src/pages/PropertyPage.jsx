import { Link, useParams } from 'react-router'
import {demoProperties,formatPrice} from '../data/demoProperties'
import {useAtba} from '../context/AtbaContext'
export default function PropertyPage(){const {id}=useParams();const p=demoProperties.find(item=>item.id===Number(id));const {favorites,toggleFavorite}=useAtba();if(!p)return <main className="mx-auto max-w-5xl px-5 py-20"><h1>Bien introuvable</h1><Link to="/explorer" className="text-atba-clay">Explorer les biens →</Link></main>
 return 
 <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-9">
    <Link to="/explorer" className="text-sm text-atba-clay">← Retour aux annonces</Link>
    <h1 className="mt-4 text-4xl tracking-tight">{p.title}</h1>
    <p className="mb-7 mt-2 text-atba-muted">⌖ {p.city} · {p.neighborhood}</p>
    <div className="grid gap-7 lg:grid-cols-[1.7fr_1fr]"><div>
        <img src={p.image} alt={p.title} className="h-[350px] w-full rounded-xl object-cover md:h-[460px]"/>
        <div className="mt-3 grid grid-cols-3 gap-3">
            <img src={p.image} alt="Vue extérieure" className="h-24 w-full rounded-lg object-cover"/>
            <img src="/images/interior.webp" alt="Ambiance intérieure illustrative" className="h-24 w-full rounded-lg object-cover"/>
            <img src="/images/owner.webp" alt="Terrasse illustrative" className="h-24 w-full rounded-lg object-cover"/>
        </div>
        <section className="mt-6 rounded-xl border border-[#e8e3dc] p-6">
            <h2 className="text-2xl">À propos du bien</h2>
            <p className="mt-3 text-atba-muted">Annonce fictive pour illustrer la fiche ATBA. Les caractéristiques et photographies secondaires sont des exemples.</p>
            <div className="mt-4 flex gap-6 text-sm">
                <span>{p.area} m²</span><span>{p.bedrooms} chambres</span>
                <span>{p.propertyType}</span></div>
        </section>
        </div>
        <aside>
            <div className="rounded-xl border border-[#e8e3dc] bg-white p-6 shadow-sm">
                <span className="text-xs uppercase tracking-widest text-atba-clay">{p.transaction==='vente'?'Vente':'Location'}</span>
                <p className="my-4 text-3xl font-bold">{formatPrice(p)}</p>
                <div className="flex flex-wrap gap-2 text-xs text-green-800">
                    <span className="rounded-full bg-green-50 px-3 py-2">E-mail vérifié</span>
                    <span className="rounded-full bg-green-50 px-3 py-2">Annonce contrôlée</span>
                    </div>
                    <p className="my-5 text-xs text-atba-muted">Ces indicateurs ne certifient pas la propriété juridique du bien.</p>
                    <div className="grid gap-3"><Link to="/messages" className="rounded-lg bg-atba-clay p-3 text-center text-white">Contacter le propriétaire</Link>
                    <button className="rounded-lg border border-atba-ink p-3" onClick={()=>alert('Demande de visite à connecter à Laravel.')}>Demander une visite</button>
                    <button className="rounded-lg border border-atba-ink p-3" onClick={()=>toggleFavorite(p.id)}>{favorites.includes(p.id)?'♥ Retirer des favoris':'♡ Ajouter aux favoris'}</button>
                    <button className="p-2 text-sm text-atba-clay" onClick={()=>alert('Signalement à connecter à Laravel.')}>⚑ Signaler cette annonce</button>
                    </div>
                    </div>
                    </aside>
                    </div>
                    </main>
}
