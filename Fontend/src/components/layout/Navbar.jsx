import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { useAtba } from '../../context/AtbaContext'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const { favorites, space, setSpace } = useAtba()

  const [open, setOpen] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const navigate = useNavigate()
  const { pathname } = useLocation()
  const home = pathname === '/'
  const initial = user?.nom?.charAt(0).toUpperCase() || 'A'

  const navigation = [
    { to: '/acheter', label: 'Acheter' },
    { to: '/louer', label: 'Louer' },
    { to: '/explorer', label: 'Explorer' },
  ]

 const spaces = [
  { value: 'recherche', label: 'Recherche' },
  ...(!loading && user
    ? [{ value: 'proprietaire', label: 'Propriétaire' }]
    : []),
]

  useEffect(() => {
    setOpen(false)
    setMobile(false)
  }, [pathname])

  function chooseSpace(next) {
    setSpace(next)
    setOpen(false)
    setMobile(false)

    navigate(
      next === 'recherche'
        ? '/espace-recherche'
        : '/espace-proprietaire'
    )
  }

  async function handleLogout() {
    setLoggingOut(true)
    setLogoutError('')

    try {
      await logout()
      setMobile(false)
      setOpen(false)
      navigate('/', { replace: true })
    } catch (error) {
      setLogoutError(error.message || 'Déconnexion impossible.')
    } finally {
      setLoggingOut(false)
    }
  }

  function navClass({ isActive }) {
    return [
      'rounded-lg px-3 py-2 text-sm transition',
      isActive
        ? 'bg-atba-clay/10 text-atba-clay'
        : 'text-[#51483f] hover:bg-[#f5f0e9] hover:text-atba-clay',
    ].join(' ')
  }

  return (
    <header
      className={`${
        home ? 'absolute' : 'relative'
      } inset-x-0 top-0 z-30 border-b border-[#e8e0d6] bg-[#fffdf9]/95 backdrop-blur-xl`}
    >
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between gap-3 px-5 lg:px-9">
        <Link to="/" aria-label="Accueil ATBA" className="shrink-0">
          <img
            src="/logo.png"
            alt="ATBA عتبة"
            className="h-16 w-32 object-contain"
          />
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-1 xl:flex"
        >
          {navigation.map(item => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Choix de l’espace sur ordinateur */}
          <div className="relative hidden xl:block">
            <button
              type="button"
              aria-expanded={open}
              aria-controls="space-options"
              onClick={() => setOpen(current => !current)}
              className="flex items-center gap-2 rounded-full border border-[#e5d9ca] bg-[#f8f4ee] px-3 py-2.5 text-xs text-[#51483f] hover:border-atba-clay"
            >
           Espace {user && space === 'proprietaire' ? 'Propriétaire' : 'Recherche'}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                className={`h-4 w-4 transition ${
                  open ? 'rotate-180' : ''
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {open && (
              <div
                id="space-options"
                className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-2 shadow-xl shadow-black/10"
              >
                <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-[#948574]">
                  Choisir mon espace
                </p>

                {spaces.map(item => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => chooseSpace(item.value)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-[#51483f] hover:bg-[#f5f0e9]"
                  >
                    Espace {item.label}
                    {space === item.value && (
                      <span className="text-atba-clay">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-1 border-l border-[#e8e0d6] pl-2 xl:flex">
            <NavLink to="/favoris" className={navClass}>
              Favoris
              {user && favorites.length > 0 && (
                <span className="ml-2 rounded-full bg-atba-clay/10 px-2 py-0.5 text-xs text-atba-clay">
                  {favorites.length}
                </span>
              )}
            </NavLink>

            {!loading && user && (
              <NavLink to="/messages" className={navClass}>
                Messages
              </NavLink>
            )}
          </div>

          {/* Compte et déconnexion sur ordinateur */}
          <div className="hidden items-center gap-2 xl:flex">
            {loading ? (
              <span
                role="status"
                aria-label="Chargement du compte"
                className="h-10 w-10 animate-pulse rounded-full bg-[#eee6db]"
              />
            ) : user ? (
              <>
                <Link
                  to="/compte"
                  aria-label="Mon compte"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-atba-clay text-sm font-medium text-white ring-4 ring-atba-clay/10"
                >
                  {initial}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-full border border-[#e5d9ca] px-3 py-2 text-xs text-[#51483f] hover:bg-[#f5f0e9] disabled:opacity-50"
                >
                  {loggingOut ? 'Déconnexion…' : 'Déconnexion'}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/connexion"
                  className="px-2 py-2 text-sm text-[#51483f] hover:text-atba-clay"
                >
                  Connexion
                </Link>

                <Link
                  to="/inscription"
                  className="rounded-full bg-atba-clay px-5 py-2.5 text-sm text-white hover:brightness-95"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label={mobile ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobile}
            aria-controls="mobile-navigation"
            onClick={() => setMobile(current => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e5d9ca] text-[#51483f] hover:bg-[#f5f0e9] xl:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
              className="h-5 w-5"
            >
              {mobile ? (
                <path d="m6 6 12 12M18 6 6 18" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation téléphone et tablette */}
      {mobile && (
        <nav
          id="mobile-navigation"
          aria-label="Navigation mobile"
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-[#e8e0d6] bg-[#fffdf9] px-5 py-5 xl:hidden"
        >
          <div className="flex flex-col gap-1">
            {navigation.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navClass}
                onClick={() => setMobile(false)}
              >
                {item.label}
              </NavLink>
            ))}

            <NavLink
              to="/favoris"
              className={navClass}
              onClick={() => setMobile(false)}
            >
              Favoris
              {user && favorites.length > 0 && ` (${favorites.length})`}
            </NavLink>

            {!loading && user && (
              <NavLink
                to="/messages"
                className={navClass}
                onClick={() => setMobile(false)}
              >
                Messages
              </NavLink>
            )}
          </div>

          <div className="mt-4 border-t border-[#e8e0d6] pt-4">
            <p className="mb-3 text-xs text-[#948574]">Mon espace</p>

            <div className="grid grid-cols-2 gap-2">
              {spaces.map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => chooseSpace(item.value)}
                  className={`rounded-xl border px-3 py-3 text-sm ${
                    space === item.value
                      ? 'border-atba-clay bg-atba-clay/10 text-atba-clay'
                      : 'border-[#e5d9ca] text-[#51483f]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {!loading && (
            <div className="mt-5 border-t border-[#e8e0d6] pt-5">
              {user ? (
                <>
                  <Link
                    to="/compte"
                    onClick={() => setMobile(false)}
                    className="flex items-center gap-3 text-sm text-[#51483f]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-atba-clay text-white">
                      {initial}
                    </span>
                    Mon compte
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="mt-4 w-full rounded-xl border border-[#e5d9ca] px-4 py-3 text-sm text-[#51483f] disabled:opacity-50"
                  >
                    {loggingOut ? 'Déconnexion…' : 'Déconnexion'}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/connexion"
                    onClick={() => setMobile(false)}
                    className="rounded-xl border border-[#e5d9ca] px-4 py-3 text-center text-sm text-[#51483f]"
                  >
                    Connexion
                  </Link>

                  <Link
                    to="/inscription"
                    onClick={() => setMobile(false)}
                    className="rounded-xl bg-atba-clay px-4 py-3 text-center text-sm text-white"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      )}

      {logoutError && (
        <p
          role="alert"
          className="bg-red-50 px-5 py-3 text-sm text-red-700"
        >
          {logoutError}
        </p>
      )}
    </header>
  )
}