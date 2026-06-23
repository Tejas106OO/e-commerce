import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

function getInitialWishlist() {
  let initialUserId = 'guest'
  try {
    const authData = localStorage.getItem('luxe_auth')
    if (authData) {
      const parsedAuth = JSON.parse(authData)
      if (parsedAuth && parsedAuth.id) {
        initialUserId = parsedAuth.id
      }
    }
  } catch {}
  
  const key = `luxe_wishlist_${initialUserId}`
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }) {
  let auth = null
  try {
    auth = useAuth()
  } catch {}
  const user = auth?.user
  const userId = user?.id || 'guest'
  const [items, setItems] = useState(getInitialWishlist)
  const loadedUserIdRef = useRef(userId)

  useEffect(() => {
    const key = `luxe_wishlist_${userId}`
    let initialItems = []
    try {
      const data = localStorage.getItem(key)
      if (data) {
        initialItems = JSON.parse(data)
      }
    } catch {}
    setItems(initialItems)
    loadedUserIdRef.current = userId
  }, [userId])

  useEffect(() => {
    if (loadedUserIdRef.current === userId) {
      const key = `luxe_wishlist_${userId}`
      localStorage.setItem(key, JSON.stringify(items))
    }
  }, [items, userId])

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
