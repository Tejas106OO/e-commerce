import { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react'
import { useToast } from './ToastContext'
import { useAuth } from './AuthContext'

const CartContext = createContext()

function getInitialCart() {
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
  
  const key = `luxe_cart_${initialUserId}`
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : { items: [], coupon: null }
  } catch {
    return { items: [], coupon: null }
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD_CART':
      return action.payload
    case 'ADD_ITEM': {
      const existing = state.items.find(
        i => i.id === action.payload.id && i.selectedSize === action.payload.selectedSize && i.selectedColor === action.payload.selectedColor
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i === existing ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) } : i
          )
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((_, idx) => idx !== action.payload) }
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((item, idx) =>
          idx === action.payload.index
            ? { ...item, quantity: Math.max(1, Math.min(10, action.payload.quantity)) }
            : item
        )
      }
    case 'SET_COUPON':
      return { ...state, coupon: action.payload }
    case 'REMOVE_COUPON':
      return { ...state, coupon: null }
    case 'CLEAR_CART':
      return { items: [], coupon: null }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, null, getInitialCart)
  const { addToast } = useToast()
  
  let auth = null
  try {
    auth = useAuth()
  } catch {}
  const user = auth?.user
  
  const userId = user?.id || 'guest'
  const loadedUserIdRef = useRef(userId)

  // Save for Later state
  const [savedForLater, setSavedForLater] = useState(() => {
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
    
    const key = `luxe_saved_for_later_${initialUserId}`
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  })

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Sync Cart
  useEffect(() => {
    const key = `luxe_cart_${userId}`
    let initialCart = { items: [], coupon: null }
    try {
      const data = localStorage.getItem(key)
      if (data) {
        initialCart = JSON.parse(data)
      }
    } catch {}
    dispatch({ type: 'LOAD_CART', payload: initialCart })
    loadedUserIdRef.current = userId
  }, [userId])

  useEffect(() => {
    if (state && loadedUserIdRef.current === userId) {
      const key = `luxe_cart_${userId}`
      localStorage.setItem(key, JSON.stringify(state))
    }
  }, [state, userId])

  // Sync Save for Later
  useEffect(() => {
    const key = `luxe_saved_for_later_${userId}`
    try {
      const data = localStorage.getItem(key)
      setSavedForLater(data ? JSON.parse(data) : [])
    } catch {}
  }, [userId])

  useEffect(() => {
    const key = `luxe_saved_for_later_${userId}`
    try {
      localStorage.setItem(key, JSON.stringify(savedForLater))
    } catch {}
  }, [savedForLater, userId])

  useEffect(() => {
    if (state.coupon && subtotal < state.coupon.minOrder) {
      dispatch({ type: 'REMOVE_COUPON' })
      addToast(`Coupon removed: Minimum order of ₹${state.coupon.minOrder} not met.`, 'info')
    }
  }, [subtotal, state.coupon, addToast])

  const addToCart = (product, selectedSize, selectedColor, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...product, selectedSize, selectedColor, quantity }
    })
  }

  const removeFromCart = (index) => dispatch({ type: 'REMOVE_ITEM', payload: index })
  const updateQuantity = (index, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { index, quantity } })
  const setCoupon = (coupon) => dispatch({ type: 'SET_COUPON', payload: coupon })
  const removeCoupon = () => dispatch({ type: 'REMOVE_COUPON' })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  // Save for Later Handlers
  const saveForLater = (index) => {
    const itemToSave = state.items[index]
    if (!itemToSave) return
    removeFromCart(index)
    setSavedForLater(prev => {
      const exists = prev.some(
        i => i.id === itemToSave.id && i.selectedSize === itemToSave.selectedSize && i.selectedColor === itemToSave.selectedColor
      )
      if (exists) return prev
      return [...prev, itemToSave]
    })
  }

  const moveToCart = (savedItem, index) => {
    setSavedForLater(prev => prev.filter((_, idx) => idx !== index))
    addToCart(savedItem, savedItem.selectedSize, savedItem.selectedColor, 1)
  }

  const removeFromSaved = (index) => {
    setSavedForLater(prev => prev.filter((_, idx) => idx !== index))
  }

  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  let discount = 0
  if (state.coupon) {
    if (state.coupon.type === 'percentage') {
      discount = Math.round(subtotal * state.coupon.discount / 100)
    } else {
      discount = state.coupon.discount
    }
  }

  const shipping = subtotal > 1999 ? 0 : 99
  const tax = Math.round((subtotal - discount) * 0.18)
  const total = subtotal - discount + shipping + tax

  return (
    <CartContext.Provider value={{
      items: state.items, coupon: state.coupon,
      addToCart, removeFromCart, updateQuantity, setCoupon, removeCoupon, clearCart,
      cartCount, subtotal, discount, shipping, tax, total,
      savedForLater, saveForLater, moveToCart, removeFromSaved
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
