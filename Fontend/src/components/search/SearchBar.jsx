import { useState } from 'react'
import { useNavigate } from 'react-router'
export default function SearchBar(){
 const navigate=useNavigate();const [transaction,setTransaction]=useState('vente');const [city,setCity]=useState('Marrakech');const [quarter,setQuarter]=useState('');const [type,setType]=useState('');const [max,setMax]=useState('')
 const field='min-w-0 rounded-lg border border-[#e8e3dc] bg-white px-3 py-2';const label='mb-1 block text-[11px] text-atba-muted'
 function submit(e){e.preventDefault();navigate(`/${transaction === 'vente' ? 'acheter' : 'louer'}?${new URLSearchParams({city,quarter,type,max})}`)}
 return <form onSubmit={submit} className="w-full max-w-[1130px] rounded-xl bg-white p-3 text-atba-ink shadow-xl">
  <div className="mb-3 flex gap-1">{[['vente','Acheter'],['location','Louer']].map(([value,text])=><button key={value} type="button" onClick={()=>setTransaction(value)} className={`rounded-lg px-7 py-2 text-xs ${transaction===value?'bg-atba-clay text-white':'bg-atba-cream'}`}>{text}</button>)}</div>
  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
    <div className={field}><label htmlFor="search-city" className={label}>Ville</label><select id="search-city" value={city} onChange={e=>setCity(e.target.value)} className="w-full bg-transparent text-sm outline-none">{['','Marrakech','Tanger','Rabat','Casablanca','Fès'].map(x=><option value={x} key={x}>{x||'Toutes les villes'}</option>)}</select></div>
    <div className={field}><label htmlFor="search-quarter" className={label}>Quartier</label><input id="search-quarter" value={quarter} onChange={e=>setQuarter(e.target.value)} placeholder="Tous les quartiers" className="w-full bg-transparent text-sm outline-none"/></div>
    <div className={field}><label htmlFor="search-type" className={label}>Type de bien</label><select id="search-type" value={type} onChange={e=>setType(e.target.value)} className="w-full bg-transparent text-sm outline-none">{['','Villa','Appartement','Riad'].map(x=><option value={x} key={x}>{x||'Tous les biens'}</option>)}</select></div>
    <div className={field}><label htmlFor="search-max" className={label}>Budget max (MAD)</label><input id="search-max" type="number" min="0" value={max} onChange={e=>setMax(e.target.value)} placeholder="Sans limite" className="w-full bg-transparent text-sm outline-none"/></div>
    <button type="submit" className="rounded-lg bg-atba-clay px-6 py-3 text-sm font-bold text-white hover:bg-[#9e4128] sm:col-span-2 lg:col-span-1">⌕ Rechercher</button>
  </div>
 </form>
}
