export default function PropertyFilters({filters,onChange}){
 const field='rounded-lg border border-[#e8e3dc] bg-white p-3 text-sm outline-none focus:border-atba-clay'
 return <div className="mb-6 grid gap-3 md:grid-cols-4">
  <select aria-label="Ville" value={filters.city} onChange={e=>onChange({...filters,city:e.target.value})} className={field}>{['','Marrakech','Tanger','Rabat','Casablanca','Fès'].map(x=><option value={x} key={x}>{x||'Toutes les villes'}</option>)}</select>
  <select aria-label="Type de bien" value={filters.type} onChange={e=>onChange({...filters,type:e.target.value})} className={field}>{['','Villa','Appartement','Riad'].map(x=><option value={x} key={x}>{x||'Tous les types'}</option>)}</select>
  <input aria-label="Quartier" value={filters.quarter} onChange={e=>onChange({...filters,quarter:e.target.value})} placeholder="Quartier" className={field}/>
  <input aria-label="Budget maximum" type="number" min="0" value={filters.max} onChange={e=>onChange({...filters,max:e.target.value})} placeholder="Prix max (MAD)" className={field}/>
 </div>
}
