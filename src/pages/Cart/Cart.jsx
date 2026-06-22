import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Minus, Plus, Trash2, Tag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'
import { coupons } from '../../data/products'
import styles from './Cart.module.css'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, coupon, setCoupon, removeCoupon, subtotal, discount, shipping, tax, total, cartCount } = useCart()
  const { addToast } = useToast()
  const [couponCode, setCouponCode] = useState('')

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    const code = couponCode.toUpperCase()
    const found = coupons[code]
    if (found) {
      if (subtotal >= found.minOrder) {
        setCoupon({ ...found, code })
        addToast(`Coupon applied! ${found.description}`, 'success')
        setCouponCode('')
      } else {
        addToast(`Minimum order of ${formatPrice(found.minOrder)} required`, 'error')
      }
    } else {
      addToast('Invalid coupon code', 'error')
    }
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <motion.div className={styles.empty} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2 className={styles.emptyTitle}>Your cart is empty</h2>
            <p className={styles.emptyText}>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="btn btn-accent">Start Shopping</Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Shopping Cart ({cartCount})</h1>
        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.itemsList}>
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  className={styles.cartItem}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, padding: 0, margin: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to={`/product/${item.id}`} className={styles.itemImage}>
                    <img src={item.image} alt={item.name} />
                  </Link>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemBrand}>{item.brand}</span>
                    <Link to={`/product/${item.id}`} className={styles.itemName}>{item.name}</Link>
                    <span className={styles.itemVariant}>
                      {item.selectedSize && item.selectedSize !== 'One Size' && `Size: ${item.selectedSize}`}
                      {item.selectedSize && item.selectedColor && ' | '}
                      {item.selectedColor && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          Color: <span style={{ width: 12, height: 12, borderRadius: '50%', background: item.selectedColor, display: 'inline-block', border: '1px solid var(--color-border)' }} />
                        </span>
                      )}
                    </span>
                    <div className={styles.itemBottom}>
                      <div className={styles.qtyControl}>
                        <button className={styles.qtyBtn} onClick={() => updateQuantity(index, item.quantity - 1)}><Minus size={14} /></button>
                        <span className={styles.qtyNum}>{item.quantity}</span>
                        <button className={styles.qtyBtn} onClick={() => updateQuantity(index, item.quantity + 1)}><Plus size={14} /></button>
                      </div>
                      <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    <button className={styles.removeBtn} onClick={() => { removeFromCart(index); addToast('Item removed from cart', 'info') }}>
                      <Trash2 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal ({cartCount} items)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className={styles.freeShipping}>FREE</span> : formatPrice(shipping)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>GST (18%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Coupon */}
            <div className={styles.couponSection}>
              {coupon ? (
                <div className={styles.couponApplied}>
                  <div>
                    <Tag size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    <span className={styles.couponName}>{coupon.code}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{coupon.description}</div>
                  </div>
                  <button className={styles.couponRemove} onClick={() => { removeCoupon(); addToast('Coupon removed', 'info') }}>Remove</button>
                </div>
              ) : (
                <form className={styles.couponForm} onSubmit={handleApplyCoupon}>
                  <input
                    className={styles.couponInput}
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    id="coupon-input"
                  />
                  <button type="submit" className="btn btn-outline btn-sm">Apply</button>
                </form>
              )}
            </div>

            <Link to="/checkout" className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: 'var(--space-lg)' }} id="checkout-btn">
              Proceed to Checkout
            </Link>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
              <Link to="/products" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                ← Continue Shopping
              </Link>
            </div>

            {/* Coupon hints */}
            <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>💡 Try these codes:</div>
              <div>WELCOME10 • LUXE20 • FLAT500</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
