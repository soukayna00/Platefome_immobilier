import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import PropertyCard from '../components/property/PropertyCard'
import PropertyFilters from '../components/property/PropertyFilters'
import {demoProperties} from '../data/demoProperties'
export default function ListingsPage({transaction}){
       const [params]=useSearchParams();
       const [filters,setFilters]=useState({city:params.get('city')||'',quarter:params.get('quarter')||'',type:params.get('type')||'',max:params.get('max')||''})
          useEffect(()=>{
            setFilters({city:params.get('city')||'',quarter:params.get('quarter')||'',type:params.get('type')||'',max:params.get('max')||''})},[params])
       const results=useMemo(()=>demoProperties.filter(p=>(!transaction||p.transaction===transaction)&&(!filters.city||p.city===filters.city)&&(!filters.quarter||p.neighborhood.toLowerCase().includes(filters.quarter.toLowerCase()))&&(!filters.type||p.propertyType===filters.type)&&(!filters.max||p.price<=Number(filters.max))),[filters,transaction])
         return (
    <main className="mx-auto min-h-[65vh] max-w-[1280px] px-5 py-12 lg:px-9">
      <h1 className="text-4xl tracking-tight">
        {transaction === 'vente'
          ? 'Acheter un bien'
          : transaction === 'location'
            ? 'Louer un bien'
            : 'Explorer les annonces'}
      </h1>

      <p className="mb-7 mt-2 text-atba-muted">
        Découvrez des biens proposés directement par des particuliers.
      </p>

      <PropertyFilters filters={filters} onChange={setFilters} />

      <p className="mb-4 text-sm text-atba-muted">
        {results.length} annonce{results.length > 1 ? 's' : ''} de démonstration
      </p>

      {results.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[#e8e3dc] p-8 text-atba-muted">
          Aucun bien ne correspond à ces critères.
        </p>
      )}
    </main>
  )
}