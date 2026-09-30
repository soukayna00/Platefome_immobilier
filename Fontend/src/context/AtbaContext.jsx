import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useAuth } from './AuthContext'
import { getFavoris, updateFavori } from '../services/favoris.js'

const AtbaContext = createContext(null)

export function AtbaProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id

  const [space, setSpace] = useState('recherche')
  const [favoriteProperties, setFavoriteProperties] = useState([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [favoritesError, setFavoritesError] = useState('')
  const [updatingFavorite, setUpdatingFavorite] = useState(false)

  const busy = useRef(false)
  const generation = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    const currentGeneration = ++generation.current

    setFavoriteProperties([])
    setFavoritesError('')
    setUpdatingFavorite(false)
    busy.current = false

    if (authLoading || !userId) {
      setFavoritesLoading(false)
      return () => controller.abort()
    }

    setFavoritesLoading(true)

    async function loadFavorites() {
      try {
        const properties = await getFavoris(controller.signal)

        if (!controller.signal.aborted) {
          setFavoriteProperties(properties)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setFavoritesError(error.message)
        }
      } finally {
        if (
          !controller.signal.aborted &&
          generation.current === currentGeneration
        ) {
          setFavoritesLoading(false)
        }
      }
    }

    loadFavorites()

    return () => controller.abort()
  }, [userId, authLoading])

  const favorites = userId
    ? favoriteProperties.map(property => property.id)
    : []

  async function toggleFavorite(id) {
    if (!userId || favoritesLoading || busy.current) return

    const currentGeneration = generation.current
    const add = !favorites.includes(id)

    busy.current = true
    setUpdatingFavorite(true)
    setFavoritesError('')

    try {
      await updateFavori(id, add)

      // Recharge la liste officielle après la modification.
      const properties = await getFavoris()

      if (generation.current === currentGeneration) {
        setFavoriteProperties(properties)
      }
    } catch (error) {
      if (generation.current === currentGeneration) {
        setFavoritesError(error.message)
      }
    } finally {
      if (generation.current === currentGeneration) {
        busy.current = false
        setUpdatingFavorite(false)
      }
    }
  }

  return (
    <AtbaContext.Provider
      value={{
        favorites,
        favoriteProperties: userId ? favoriteProperties : [],
        favoritesLoading,
        favoritesError,
        updatingFavorite,
        toggleFavorite,
        space,
        setSpace,
      }}
    >
      {children}

      {favoritesError && (
        <div
          role="alert"
          className="fixed bottom-5 left-5 right-5 z-50 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-lg sm:left-auto sm:max-w-md"
        >
          {favoritesError}
        </div>
      )}
    </AtbaContext.Provider>
  )
}

export function useAtba() {
  const context = useContext(AtbaContext)

  if (!context) {
    throw new Error('AtbaProvider requis')
  }

  return context
}