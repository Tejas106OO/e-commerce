import { createContext, useContext, useReducer, useEffect } from 'react'
import { useToast } from './ToastContext'

const CartContext = createContext()

const STORAGE_KEY = 'luxe_cart'

function loadCart() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : { items: [], coupon: null }
  } catch { return { items: [], coupon: null } }
}

function cartReducer(state, action) {
  switch (action.type) {
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
  const [state, dispatch] = useReducer(cartReducer, null, loadCart)
  const { addToast } = useToast()

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

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
      cartCount, subtotal, discount, shipping, tax, total
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
