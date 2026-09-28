import CityCard from '../components/home/CityCard'
import PropertyCard from '../components/property/PropertyCard'
import {demoProperties} from '../data/demoProperties'
const cities=[['Tanger','/images/tanger.webp'],['Rabat','/images/rabat.webp'],['Marrakech','/images/marrakech.webp'],['Casablanca','/images/casablanca.webp']]
export default function ExplorePage(){
    return
     <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-9">
        <h1 className="text-4xl tracking-tight">Explorer le Maroc</h1>
        <p className="mt-2 text-atba-muted">Choisissez votre ville et découvrez des annonces de vente et de location.</p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {cities.map(([name,image])=><CityCard key={name} name={name} image={image}/>)}</div>
            <h2 className="mb-5 mt-14 text-3xl">Quelques biens à découvrir</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{demoProperties.map(p=><PropertyCard key={p.id} property={p}/>)}</div></main>}
