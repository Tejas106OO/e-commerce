import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()

const STORAGE_KEY = 'luxe_wishlist'

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const toggleWishlist = (product) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.filter(i => i.id !== product.id)
      return [...prev, product]
    })
  }

  const isWishlisted = (productId) => items.some(i => i.id === productId)
  const wishlistCount = items.length

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isWishlisted, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
