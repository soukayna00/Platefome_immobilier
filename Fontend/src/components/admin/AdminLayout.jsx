import { useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'

const links = [
  {
    to: '/admin',
    label: 'Dashboard',
    end: true,
  },
  {
    to: '/admin/utilisateurs',
    label: 'Utilisateurs',
    end: false,
  },
  {
    to: '/admin/annonces',
    label: 'Annonces',
    end: false,
  },
  {
    to: '/admin/signalements',
    label: 'Signalements',
    end: false,
  },
  {
    to: '/admin/catalogue',
    label: 'Catalogue',
    end: false,
},
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const logoutLock = useRef(false)

  const name = [user?.prenom, user?.nom]
    .filter(Boolean)
    .join(' ')

  async function handleLogout() {
    if (logoutLock.current) return

    logoutLock.current = true
    setLoggingOut(true)
    setLogoutError('')

    try {
      await logout()
      navigate('/admin/connexion', { replace: true })
    } catch (error) {
      setLogoutError(error.message || 'Déconnexion impossible.')
    } finally {
      logoutLock.current = false
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[250px_1fr]">
        <aside className="flex flex-col border-b border-[#e8e3dc] bg-white p-6 lg:border-b-0 lg:border-r">
          <Link to="/admin" aria-label="Tableau de bord ATBA">
            <img
              src="/logo.png"
              alt="ATBA"
              className="h-16 w-36 object-contain object-left"
            />
          </Link>

          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-atba-clay">
            Administration
          </p>

          <nav
            aria-label="Navigation administrateur"
            className="mt-7 flex flex-wrap gap-2 lg:flex-col"
          >
            {links.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-atba-clay text-white'
                      : 'text-atba-ink hover:bg-atba-cream'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 border-t border-[#eee9e2] pt-5 lg:mt-auto">
            <p className="text-sm font-medium">
              {name || 'Administrateur'}
            </p>

            <Link
              to="/"
              className="mt-3 block text-sm text-atba-muted hover:text-atba-clay"
            >
              Voir le site →
            </Link>

            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="mt-4 w-full rounded-xl border border-[#e8e3dc] px-4 py-3 text-left text-sm transition hover:bg-atba-cream disabled:opacity-50"
            >
              {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
            </button>

            {logoutError && (
              <p role="alert" className="mt-3 text-xs text-red-700">
                {logoutError}
              </p>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}