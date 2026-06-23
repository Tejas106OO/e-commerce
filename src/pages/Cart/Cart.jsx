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
  const { 
    items, removeFromCart, updateQuantity, coupon, setCoupon, removeCoupon, 
    subtotal, discount, shipping, tax, total, cartCount,
    savedForLater, saveForLater, moveToCart, removeFromSaved 
  } = useCart()
  const { addToast } = useToast()
  const [couponCode, setCouponCode] = useState('')
  const [isSavedExpanded, setIsSavedExpanded] = useState(true)

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
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='%23eaeaea'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' fill='%23a3a3a3' letter-spacing='4'>LUXE</text></svg>" }}
                    />
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
                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xs)' }}>
                      <button className={styles.removeBtn} onClick={() => { removeFromCart(index); addToast('Item removed from cart', 'info') }} aria-label="Remove item" id={`remove-item-${item.id}`}>
                        <Trash2 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Remove
                      </button>
                      <button className={styles.saveLaterBtn} onClick={() => { saveForLater(index); addToast('Item saved for later', 'info') }} aria-label="Save for later" id={`save-later-${item.id}`}>
                        💾 Save for Later
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Collapsible Saved for Later Section */}
            {savedForLater && savedForLater.length > 0 && (
              <div className={styles.savedSection}>
                <button
                  className={styles.savedHeader}
                  onClick={() => setIsSavedExpanded(!isSavedExpanded)}
                  aria-expanded={isSavedExpanded}
                  aria-label="Toggle Saved for Later items"
                  id="saved-for-later-toggle"
                >
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>Saved for Later ({savedForLater.length})</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{isSavedExpanded ? '▲ Hide' : '▼ Show'}</span>
                </button>
                <AnimatePresence>
                  {isSavedExpanded && (
                    <motion.div
                      className={styles.savedList}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {savedForLater.map((item, idx) => (
                        <motion.div
                          key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                          className={styles.savedItem}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <Link to={`/product/${item.id}`} className={styles.savedItemImage}>
                            <img
                              src={item.image}
                              alt={item.name}
                              onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='%23eaeaea'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' fill='%23a3a3a3' letter-spacing='4'>LUXE</text></svg>" }}
                            />
                          </Link>
                          <div className={styles.savedItemInfo}>
                            <span className={styles.itemBrand}>{item.brand}</span>
                            <Link to={`/product/${item.id}`} className={styles.savedItemName}>{item.name}</Link>
                            <span className={styles.itemVariant}>
                              {item.selectedSize && item.selectedSize !== 'One Size' && `Size: ${item.selectedSize}`}
                              {item.selectedSize && item.selectedColor && ' | '}
                              {item.selectedColor && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  Color: <span style={{ width: 12, height: 12, borderRadius: '50%', background: item.selectedColor, display: 'inline-block', border: '1px solid var(--color-border)' }} />
                                </span>
                              )}
                            </span>
                            <div className={styles.savedItemPrice}>{formatPrice(item.price)}</div>
                            <div className={styles.savedItemActions}>
                              <button 
                                className="btn btn-accent btn-sm" 
                                onClick={() => { moveToCart(item, idx); addToast('Moved item to cart', 'success') }}
                                aria-label="Move to cart"
                                id={`move-to-cart-${item.id}`}
                              >
                                Move to Cart
                              </button>
                              <button 
                                className={styles.savedRemoveBtn} 
                                onClick={() => { removeFromSaved(idx); addToast('Removed saved item', 'info') }}
                                aria-label="Delete saved item"
                                id={`delete-saved-${item.id}`}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
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
