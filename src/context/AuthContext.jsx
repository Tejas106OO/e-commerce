import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()
const STORAGE_KEY = 'luxe_auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch { return null }
  })

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  /**
   * Login — mock for development.
   * In production, replace with:
   *   const res = await fetch('/api/auth/login', { method:'POST', body: JSON.stringify({email,password}), ... })
   *   const { user, token } = await res.json()
   *   setUser(user)
   */
  const login = (email, password, role = 'customer') => {
    // Demo role switching: type "admin@luxe.com" to get admin, "seller@luxe.com" for seller
    const derivedRole =
      email.includes('admin') ? 'admin' :
      email.includes('seller') ? 'seller' :
      role

    const mockUser = {
      id: 1,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email,
      phone: '+91 98765 43210',
      role: derivedRole,
      addresses: [
        { id: 1, name: 'Home', street: '42, MG Road, Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038', isDefault: true },
      ],
      orders: [
        { id: 'LX-2024-001', date: '2024-12-15', total: 24998, status: 'delivered', items: 3 },
        { id: 'LX-2024-002', date: '2025-01-20', total: 8999, status: 'shipped', items: 1 },
        { id: 'LX-2025-003', date: '2025-06-10', total: 15498, status: 'processing', items: 2 },
      ]
    }
    setUser(mockUser)
    return true
  }

  const register = (name, email, password, role = 'customer') => {
    const newUser = {
      id: Date.now(),
      name,
      email,
      phone: '',
      role,
      addresses: [],
      orders: []
    }
    setUser(newUser)
    return true
  }

  const logout = () => setUser(null)
  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'
  const isSeller = user?.role === 'seller' || user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isAdmin, isSeller }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
