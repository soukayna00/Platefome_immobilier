import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

const AuthContext = createContext(null)

function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : ''
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/user', {
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      })

      const authenticatedUser = response.ok
        ? await response.json()
        : null

      setUser(authenticatedUser)

      return authenticatedUser
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  async function logout() {
    const csrfResponse = await fetch('/sanctum/csrf-cookie', {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!csrfResponse.ok) {
      throw new Error('Impossible de préparer la déconnexion.')
    }

    const response = await fetch('/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-XSRF-TOKEN': csrfToken(),
      },
    })

    if (!response.ok && response.status !== 401) {
      throw new Error('La déconnexion a échoué. Réessaie.')
    }

    setUser(null)
  }

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  return (
    <AuthContext.Provider
      value={{ user, loading, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('AuthProvider requis')
  }

  return context
}