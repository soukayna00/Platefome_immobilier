import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAtba } from '../../context/AtbaContext'

export default function Navbar() {
  const [open,setOpen] = useState(false)
  const [mobile,setMobile] = useState(false)
  const {favorites,space,setSpace} = useAtba()
  const navigate = useNavigate()
  const {pathname} = useLocation()
  const home = pathname === '/'
  function chooseSpace(next) {setSpace(next);setOpen(false);navigate(next === 'recherche' ? '/espace-recherche' : '/espace-proprietaire')}
  return <header className={`${home ? 'absolute' : 'relative'} inset-x-0 top-0 z-30 border-b border-white/30 bg-white/85 backdrop-blur-md`}>
    <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-5 px-5 lg:px-9">
      <Link to="/" aria-label="Accueil ATBA" className="shrink-0"><img src="/logo.png" alt="ATBA عتبة" className="h-16 w-[150px] object-contain"/></Link>
      <nav aria-label="Navigation principale" className="hidden items-center gap-8 text-[13px] md:flex">
        <Link to="/acheter" className="hover:text-atba-clay">Acheter ⌄</Link><Link to="/louer" className="hover:text-atba-clay">Louer ⌄</Link><Link to="/explorer" className="hover:text-atba-clay">Explorer ⌄</Link>
      </nav>
      <div className="flex items-center gap-4 text-xs">
        <div className="relative">
          <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-full border border-black/15 bg-white/50 px-4 py-2">Espace {space === 'recherche' ? 'Recherche' : 'Propriétaire'} ⌄</button>
          {open && <div className="absolute right-0 top-11 w-48 rounded-xl border border-black/10 bg-white p-2 shadow-xl">
            <button type="button" onClick={() => chooseSpace('recherche')} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-atba-cream">{space === 'recherche' ? '✓ ' : ''}Espace Recherche</button>
            <button type="button" onClick={() => chooseSpace('proprietaire')} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-atba-cream">{space === 'proprietaire' ? '✓ ' : ''}Espace Propriétaire</button>
          </div>}
        </div>
        <Link to="/favoris" className="hidden hover:text-atba-clay lg:block">♡ Favoris {favorites.length > 0 && `(${favorites.length})`}</Link>
        <Link to="/messages" className="hidden hover:text-atba-clay lg:block">✉ Messages</Link>
        <Link to="/compte" aria-label="Mon compte" className="hidden h-8 w-8 items-center justify-center rounded-full bg-[#d0a084] text-white lg:flex">●</Link>
        <button type="button" aria-label="Ouvrir le menu" aria-expanded={mobile} onClick={() => setMobile(!mobile)} className="text-2xl md:hidden">☰</button>
      </div>
    </div>
    {mobile && <nav aria-label="Navigation mobile" className="flex flex-col gap-4 border-t border-black/10 bg-white px-6 py-5 text-sm md:hidden" onClick={() => setMobile(false)}>
      <Link to="/acheter">Acheter</Link><Link to="/louer">Louer</Link><Link to="/explorer">Explorer</Link><Link to="/favoris">Favoris</Link><Link to="/messages">Messages</Link><Link to="/compte">Mon compte</Link>
    </nav>}
  </header>
}
