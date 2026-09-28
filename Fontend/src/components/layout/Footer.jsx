import { Link } from 'react-router'
export default function Footer(){return <footer className="border-t border-[#e8e3dc] bg-white py-12"><div className="mx-auto max-w-[1280px] px-5 lg:px-9">
  <div className="grid gap-9 text-sm md:grid-cols-[2fr_1fr_1fr_1fr]"><div><Link to="/"><img src="/logo.png" alt="ATBA" className="h-16 w-36 object-contain"/></Link><p className="mt-3 max-w-xs text-atba-muted">Achetez ou louez directement auprès des particuliers au Maroc.</p></div>
  <div className="grid content-start gap-2"><strong>Explorer</strong><Link to="/acheter">Acheter</Link><Link to="/louer">Louer</Link><Link to="/explorer">Villes</Link></div>
  <div className="grid content-start gap-2"><strong>À propos</strong><Link to="/">Comment ça marche</Link><Link to="/messages">Contact</Link></div>
  <div className="grid content-start gap-2"><strong>Mon compte</strong><Link to="/espace-recherche">Espace Recherche</Link><Link to="/espace-proprietaire">Espace Propriétaire</Link></div></div>
  <div className="mt-9 border-t border-[#e8e3dc] pt-5 text-xs text-atba-muted">© ATBA — Prototype. Annonces et échanges de démonstration.</div>
</div></footer>}
