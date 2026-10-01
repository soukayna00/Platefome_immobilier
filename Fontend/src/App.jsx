import { Routes, Route, Link, Outlet } from 'react-router'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'

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
import MyPropertiesPage from './pages/MyPropertiesPage'
import CreatePropertyPage from './pages/CreatePropertyPage'
import MyPropertyDetailPage from './pages/MyPropertyDetailPage'
import EditPropertyPage from './pages/EditPropertyPage'
import CreateAnnoncePage from './pages/CreateAnnoncePage'
import MyAnnoncesPage from './pages/MyAnnoncesPage'
import ReceivedVisitsPage from './pages/ReceivedVisitsPage'
import MyVisitsPage from './pages/MyVisitsPage'
import MySearchesPage from './pages/MySearchesPage'

import AdminRoute from './components/admin/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminLoginPage from './pages/admin/LoginPage'
import AdminDashboardPage from './pages/admin/DashboardPage'
import AdminReportsPage from './pages/admin/ReportsPage'
import AdminAnnoncesPage from './pages/admin/AnnoncesPage'
import AdminAnnonceDetailPage from './pages/admin/AnnonceDetailPage'
import AdminUsersPage from './pages/admin/UsersPage'
import AdminCataloguePage from './pages/admin/CataloguePage'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  )
}

function NotFoundPage({ admin = false }) {
  return (
    <main className="mx-auto min-h-[65vh] max-w-5xl px-5 py-20">
      <h1 className="text-4xl">Page introuvable</h1>

      <Link
        to={admin ? '/admin' : '/'}
        className="mt-5 block text-atba-clay"
      >
        {admin ? 'Retour au dashboard →' : 'Retour à l’accueil →'}
      </Link>
    </main>
  )
}

export default function App() {
  return (
    <Routes>

      <Route
        path="/admin/connexion"
        element={<AdminLoginPage />}
      />


      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />

        <Route
          path="signalements"
          element={<AdminReportsPage />}
        />

        <Route
          path="annonces"
          element={<AdminAnnoncesPage />}
        />

        <Route
          path="annonces/:id"
          element={<AdminAnnonceDetailPage />}
        />

        <Route
          path="utilisateurs"
          element={<AdminUsersPage />}
        />
        <Route
          path="catalogue"
          element={<AdminCataloguePage />}
        />

        <Route
          path="*"
          element={<NotFoundPage admin />}
        />
      </Route>


      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/acheter"
          element={<ListingsPage transaction="vente" />}
        />

        <Route
          path="/louer"
          element={<ListingsPage transaction="location" />}
        />

        <Route path="/annonces" element={<ListingsPage />} />
        <Route path="/explorer" element={<ExplorePage />} />
        <Route path="/bien/:id" element={<PropertyPage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />

        <Route
          path="/espace-recherche"
          element={<SearchSpacePage />}
        />

        <Route path="/compte" element={<AccountPage />} />


        <Route element={<AuthenticatedLayout />}>
        <Route path="/mes-recherches" element={<MySearchesPage />}/>
          <Route path="/favoris" element={<FavoritesPage />} />
          <Route path="/messages" element={<MessagesPage />} />

          <Route
            path="/espace-proprietaire"
            element={<OwnerSpacePage />}
          />

          <Route
            path="/mes-biens"
            element={<MyPropertiesPage />}
          />

          <Route
            path="/mes-biens/nouveau"
            element={<CreatePropertyPage />}
          />

          <Route
            path="/mes-biens/:id"
            element={<MyPropertyDetailPage />}
          />

          <Route
            path="/mes-biens/:id/modifier"
            element={<EditPropertyPage />}
          />

          <Route
            path="/mes-biens/:id/annonces/nouvelle"
            element={<CreateAnnoncePage />}
          />

          <Route
            path="/mes-annonces"
            element={<MyAnnoncesPage />}
          />

          <Route
            path="/visites-recues"
            element={<ReceivedVisitsPage />}
          />

          <Route
            path="/mes-visites"
            element={<MyVisitsPage />}
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
