import { createContext, useContext, useState } from 'react'

const RecentlyViewedContext = createContext()

export function RecentlyViewedProvider({ children }) {
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const addToRecentlyViewed = (productId) => {
    setRecentlyViewed(prev => {
      // Filter out the product if it already exists to move it to the front
      const filtered = prev.filter(id => id !== productId)
      const updated = [productId, ...filtered].slice(0, 8)
      try {
        localStorage.setItem('recentlyViewed', JSON.stringify(updated))
      } catch (err) {
        console.error('Error saving recentlyViewed to localStorage:', err)
      }
      return updated
    })
  }

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addToRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext)
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider')
  }
  return context
}
