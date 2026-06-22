import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CartProvider, useCart } from '../CartContext'
import { ToastProvider } from '../ToastContext'

// Helper component to consume context and render values for testing
function TestComponent() {
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    subtotal,
    total
  } = useCart()

  return (
    <div>
      <span data-testid="cart-count">{cartCount}</span>
      <span data-testid="subtotal">{subtotal}</span>
      <span data-testid="total">{total}</span>
      <div data-testid="cart-items">
        {items.map((item, idx) => (
          <div key={idx} data-testid={`item-${item.id}`}>
            <span>{item.name}</span>
            <span data-testid={`item-qty-${item.id}`}>{item.quantity}</span>
            <button
              data-testid={`btn-qty-inc-${item.id}`}
              onClick={() => updateQuantity(idx, item.quantity + 1)}
            >
              Increment
            </button>
            <button
              data-testid={`btn-remove-${item.id}`}
              onClick={() => removeFromCart(idx)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        data-testid="btn-add"
        onClick={() => addToCart({ id: 1, name: 'Premium Leather Bag', price: 1500 }, 'M', 'Black')}
      >
        Add Item
      </button>
    </div>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides empty default cart state', () => {
    render(
      <ToastProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </ToastProvider>
    )

    expect(screen.getByTestId('cart-count').textContent).toBe('0')
    expect(screen.getByTestId('subtotal').textContent).toBe('0')
  })

  it('allows adding items to the cart', async () => {
    render(
      <ToastProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </ToastProvider>
    )

    const addButton = screen.getByTestId('btn-add')
    await act(async () => {
      addButton.click()
    })

    expect(screen.getByTestId('cart-count').textContent).toBe('1')
    expect(screen.getByTestId('subtotal').textContent).toBe('1500')
    expect(screen.getByTestId('item-qty-1').textContent).toBe('1')
  })

  it('handles item quantity updates correctly', async () => {
    render(
      <ToastProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </ToastProvider>
    )

    const addButton = screen.getByTestId('btn-add')
    await act(async () => {
      addButton.click()
    })

    const incButton = screen.getByTestId('btn-qty-inc-1')
    await act(async () => {
      incButton.click()
    })

    expect(screen.getByTestId('cart-count').textContent).toBe('2')
    expect(screen.getByTestId('subtotal').textContent).toBe('3000')
    expect(screen.getByTestId('item-qty-1').textContent).toBe('2')
  })

  it('allows removing items from the cart', async () => {
    render(
      <ToastProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </ToastProvider>
    )

    const addButton = screen.getByTestId('btn-add')
    await act(async () => {
      addButton.click()
    })

    expect(screen.getByTestId('cart-count').textContent).toBe('1')

    const removeBtn = screen.getByTestId('btn-remove-1')
    await act(async () => {
      removeBtn.click()
    })

    expect(screen.getByTestId('cart-count').textContent).toBe('0')
    expect(screen.getByTestId('subtotal').textContent).toBe('0')
  })
})
