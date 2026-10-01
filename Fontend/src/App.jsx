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
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import MyPropertiesPage from './pages/MyPropertiesPage'
import CreatePropertyPage from './pages/CreatePropertyPage'
import MyPropertyDetailPage from './pages/MyPropertyDetailPage'
import EditPropertyPage from './pages/EditPropertyPage'
import CreateAnnoncePage from './pages/CreateAnnoncePage'
import MyAnnoncesPage from './pages/MyAnnoncesPage'
import ReceivedVisitsPage from './pages/ReceivedVisitsPage'
import MyVisitsPage from './pages/MyVisitsPage'

export default function App(){return <><Navbar/><Routes>
 <Route path="/" element={<HomePage/>}/>
 <Route path="/acheter" element={<ListingsPage transaction="vente"/>}/>
 <Route path="/louer" element={<ListingsPage transaction="location"/>}/>
 <Route path="/explorer" element={<ExplorePage/>}/>
 <Route path="/bien/:id" element={<PropertyPage/>}/>
 {/* <Route path="/favoris" element={<FavoritesPage/>}/> */}
 {/* <Route path="/messages" element={<MessagesPage/>}/> */}
 <Route path="/espace-recherche" element={<SearchSpacePage/>}/>
 {/* <Route path="/espace-proprietaire" element={<OwnerSpacePage/>}/> */}
 <Route path="/annonces" element={<ListingsPage />} />
 <Route path="/compte" element={<AccountPage/>}/>
 <Route path="/connexion" element={<LoginPage/>}/>
 <Route path="/inscription" element={<RegisterPage />} />
 <Route path="/mes-biens" element={ <ProtectedRoute> <MyPropertiesPage /></ProtectedRoute>}/>
 <Route path="/favoris" element={
    <ProtectedRoute>
      <FavoritesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/messages"
  element={
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/mes-biens/:id"
  element={
    <ProtectedRoute>
      <MyPropertyDetailPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/espace-proprietaire"
  element={
    <ProtectedRoute>
      <OwnerSpacePage />
    </ProtectedRoute>
  }
/>
<Route
  path="/mes-biens/nouveau"
  element={
    <ProtectedRoute>
      <CreatePropertyPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/mes-biens/:id/modifier"
  element={
    <ProtectedRoute>
      <EditPropertyPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/mes-biens/:id/annonces/nouvelle"
  element={
    <ProtectedRoute>
      <CreateAnnoncePage />
    </ProtectedRoute>
  }
/>
<Route
  path="/mes-annonces"
  element={
    <ProtectedRoute>
      <MyAnnoncesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/visites-recues"
  element={
    <ProtectedRoute>
      <ReceivedVisitsPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/mes-visites"
  element={
    <ProtectedRoute>
      <MyVisitsPage />
    </ProtectedRoute>
  }
/>
 <Route path="*" element={<main className="mx-auto min-h-[65vh] max-w-5xl px-5 py-20">
    <h1 className="text-4xl">Page introuvable</h1>
    <Link to="/" className="mt-5 block text-atba-clay">Retour à l’accueil →</Link>
    </main>}/>
 </Routes><Footer/></>}
