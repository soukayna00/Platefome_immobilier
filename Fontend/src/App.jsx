import {Routes,Route,Link} from 'react-router'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import ExplorePage from './pages/ExplorePage'
import PropertyPage from './pages/PropertyPage'
import FavoritesPage from './pages/FavoritesPage'
import MessagesPage from './pages/MessagesPage'
import SearchSpacePage from './pages/SearchSpacePage'
import OwnerSpacePage from './pages/OwnerSpacePage'
import AccountPage from './pages/AccountPage'
export default function App(){return <><Navbar/><Routes>
 <Route path="/" element={<HomePage/>}/><Route path="/acheter" element={<ListingsPage transaction="vente"/>}/><Route path="/louer" element={<ListingsPage transaction="location"/>}/><Route path="/explorer" element={<ExplorePage/>}/><Route path="/bien/:id" element={<PropertyPage/>}/><Route path="/favoris" element={<FavoritesPage/>}/><Route path="/messages" element={<MessagesPage/>}/><Route path="/espace-recherche" element={<SearchSpacePage/>}/><Route path="/espace-proprietaire" element={<OwnerSpacePage/>}/><Route path="/compte" element={<AccountPage/>}/>
 <Route path="*" element={<main className="mx-auto min-h-[65vh] max-w-5xl px-5 py-20"><h1 className="text-4xl">Page introuvable</h1><Link to="/" className="mt-5 block text-atba-clay">Retour à l’accueil →</Link></main>}/>
 </Routes><Footer/></>}
