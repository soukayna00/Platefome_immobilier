import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/user', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })

      setUser(response.ok ? await response.json() : null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  async function logout() {
    const csrfResponse = await fetch('/sanctum/csrf-cookie', {
      credentials: 'same-origin',
    })

    if (!csrfResponse.ok) {
      throw new Error('Impossible de préparer la déconnexion.')
    }

    const cookie = document.cookie
      .split('; ')
      .find(item => item.startsWith('XSRF-TOKEN='))

    const token = cookie
      ? decodeURIComponent(cookie.split('=').slice(1).join('='))
      : ''

    const response = await fetch('/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-XSRF-TOKEN': token,
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