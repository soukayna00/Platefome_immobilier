import { Link } from 'react-router'
import PropertyCard from '../components/property/PropertyCard'
import {demoProperties} from '../data/demoProperties'
import {useAtba} from '../context/AtbaContext'
export default function FavoritesPage(){const {favorites}=useAtba();const list=demoProperties.filter(p=>favorites.includes(p.id));return <main className="mx-auto min-h-[65vh] max-w-[1280px] px-5 py-12 lg:px-9"><h1 className="text-4xl tracking-tight">Mes favoris</h1><p className="mb-7 mt-2 text-atba-muted">Retrouvez les annonces enregistrées sur cet appareil.</p>{list.length?<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map(p=><PropertyCard key={p.id} property={p}/>)}</div>:<div className="rounded-xl border border-[#e8e3dc] p-12 text-center"><p className="mb-6 text-atba-muted">Aucun favori pour le moment.</p><Link to="/explorer" className="rounded-lg bg-atba-clay px-6 py-3 text-white">Explorer les biens</Link></div>}</main>}
