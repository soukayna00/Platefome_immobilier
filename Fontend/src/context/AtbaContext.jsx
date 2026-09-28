import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AtbaContext = createContext(null)
const STORAGE_KEY = 'atba-favorites'

export function AtbaProvider({children}) {
  const [favorites,setFavorites] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(saved) ? saved : [] }
    catch { return [] }
  })
  const [space,setSpace] = useState('recherche')
  useEffect(() => { localStorage.setItem(STORAGE_KEY,JSON.stringify(favorites)) },[favorites])
  const value = useMemo(() => ({
    favorites,space,setSpace,
    toggleFavorite(id) { setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current,id]) },
  }),[favorites,space])
  return <AtbaContext.Provider value={value}>{children}</AtbaContext.Provider>
}
export function useAtba() { const value = useContext(AtbaContext); if (!value) throw new Error('AtbaProvider requis'); return value }
