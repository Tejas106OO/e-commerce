import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Heart, ShoppingBag, ChevronRight, Minus, Plus, Truck, RotateCcw, Shield, Send, ThumbsUp, CheckCircle } from 'lucide-react'
import { products } from '../../data/products'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, getDiscountPercent } from '../../utils/helpers'
import ProductCard from '../../components/ProductCard/ProductCard'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find(p => p.id === Number(id))
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { addToast } = useToast()

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null)
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  // Scroll to top whenever the product changes
  const prevIdRef = useRef(null)
  useEffect(() => {
    if (prevIdRef.current !== id) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      prevIdRef.current = id
    }
    if (product) {
      setSelectedImage(0)
      setSelectedColor(product.colors?.[0] || null)
      setSelectedSize(product.sizes?.[0] || null)
      setQuantity(1)
      setActiveTab('description')
    }
  }, [id, product])

  if (!product) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)' }}>Product not found</h2>
          <Link to="/products" className="btn btn-outline" style={{ marginTop: '1rem' }}>Back to Shop</Link>
        </div>
      </div>
    )
  }

  const discount = getDiscountPercent(product.price, product.originalPrice)
  const wishlisted = isWishlisted(product.id)
  const allImages = product.images || [product.image]
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity)
    addToast(`${product.name} added to cart!`, 'success')
  }

  const handleWishlist = () => {
    toggleWishlist(product)
    addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', wishlisted ? 'info' : 'success')
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products">Shop</Link>
          <ChevronRight size={14} />
          <Link to={`/products/${product.category}`}>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</Link>
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </div>

        <div className={styles.productLayout}>
          {/* Gallery */}
          <motion.div
            className={styles.gallery}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.mainImage}>
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='%23eaeaea'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' fill='%23a3a3a3' letter-spacing='4'>LUXE</text></svg>" }}
              />
            </div>
            {allImages.length > 1 && (
              <div className={styles.thumbnails}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${selectedImage === i ? styles.active : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img
                      src={img}
                      alt={`View ${i + 1}`}
                      onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='%23eaeaea'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' fill='%23a3a3a3' letter-spacing='4'>LUXE</text></svg>" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            className={styles.info}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className={styles.brand}>{product.brand}</span>
            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} strokeWidth={i < Math.floor(product.rating) ? 0 : 1.5} />
                ))}
              </div>
              <span className={styles.ratingNum}>{product.rating}</span>
              <span className={styles.reviewCount}>({product.reviews} reviews)</span>
            </div>

            <div className={styles.priceSection}>
              <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
              {discount > 0 && (
                <>
                  <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
                  <span className={styles.saveBadge}>Save {discount}%</span>
                </>
              )}
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Color Variants */}
            {product.colors?.length > 0 && (
              <div className={styles.variantSection}>
                <span className={styles.variantLabel}>Color</span>
                <div className={styles.colorOptions}>
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`${styles.colorSwatch} ${selectedColor === color ? styles.active : ''}`}
                      style={{ background: color }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Variants */}
            {product.sizes?.length > 0 && product.sizes[0] !== 'One Size' && (
              <div className={styles.variantSection}>
                <span className={styles.variantLabel}>Size</span>
                <div className={styles.sizeOptions}>
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`${styles.sizeBtn} ${selectedSize === size ? styles.active : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.quantityRow}>
              <div className={styles.variantSection}>
                <span className={styles.variantLabel}>Quantity</span>
                <div className={styles.quantityControl}>
                  <button 
                    className={styles.qtyBtn} 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !product.inStock}
                    style={quantity <= 1 || !product.inStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className={styles.qtyNum}>{quantity}</span>
                  <button 
                    className={styles.qtyBtn} 
                    onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    disabled={quantity >= 10 || !product.inStock}
                    style={quantity >= 10 || !product.inStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionBtns}>
              <button className="btn btn-accent btn-lg" onClick={handleAddToCart} id="add-to-cart-btn" disabled={!product.inStock} style={!product.inStock ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                {product.inStock ? <><ShoppingBag size={18} /> Add to Cart</> : 'Out of Stock'}
              </button>
              <button
                className={`btn btn-outline btn-lg`}
                onClick={handleWishlist}
                id="wishlist-btn"
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} style={wishlisted ? { color: '#ef4444' } : {}} />
                {wishlisted ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>

            {/* Trust */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-lg)', padding: 'var(--space-lg) 0', borderTop: '1px solid var(--color-border-light)', marginTop: 'var(--space-sm)' }}>
              {[
                { icon: <Truck size={18} />, text: 'Free Delivery' },
                { icon: <RotateCcw size={18} />, text: '30-Day Returns' },
                { icon: <Shield size={18} />, text: 'Secure Payment' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--color-accent)' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              {['description', 'specifications', 'reviews'].map(tab => (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className={styles.tabContent}>
              {activeTab === 'description' && <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>{product.description}</p>}
              {activeTab === 'specifications' && (
                <table className={styles.specTable}>
                  <tbody>
                    {Object.entries(product.specs || {}).map(([key, val]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'reviews' && (
                <div>
                  <ReviewsSection product={product} />
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className={styles.related}>
            <h2 className="section-title">You May Also Like</h2>
            <p className="section-subtitle">More from {product.category}</p>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// ── ReviewsSection Component ───────────────────────────────────────────────────
const INITIAL_REVIEWS = [
  { id: 1, user: 'Priya S.', rating: 5, title: 'Absolutely stunning!', body: 'The quality is exceptional. Worth every rupee.', date: '2025-06-10', helpful: 12, verified: true },
  { id: 2, user: 'Arjun M.', rating: 4, title: 'Great product',        body: 'Exactly as described. Fast delivery too.', date: '2025-05-28', helpful: 7, verified: false },
]

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          style={{ color: n <= (hovered || value) ? '#f59e0b' : 'var(--color-border)', fontSize: '1.5rem', transition: 'color 0.15s' }}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ReviewsSection({ product }) {
  const { isAuthenticated, user } = useAuth()
  const { addToast } = useToast()
  const [reviews, setReviews] = useState(INITIAL_REVIEWS)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { addToast('Please select a star rating', 'error'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 900))
    const newReview = {
      id: Date.now(), user: user?.name || 'You',
      rating, title, body,
      date: new Date().toISOString().split('T')[0],
      helpful: 0, verified: false
    }
    setReviews(prev => [newReview, ...prev])
    setSubmitted(true)
    setSubmitting(false)
    addToast('Review submitted — thank you!', 'success')
  }

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)', padding: 'var(--space-xl)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
        <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{avgRating}</span>
        <div>
          <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
            {[1,2,3,4,5].map(n => (
              <Star key={n} size={18} fill={n <= Math.round(avgRating) ? '#f59e0b' : 'none'} style={{ color: '#f59e0b' }} strokeWidth={1.5} />
            ))}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{reviews.length} reviews</div>
        </div>
      </div>

      {/* Write a review */}
      {!submitted ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: 'var(--space-lg)' }}>Write a Review</h3>
          {!isAuthenticated ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              <Link to="/account" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Sign in</Link> to leave a review.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <label className="input-label">Your Rating *</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div>
                <label className="input-label">Review Title</label>
                <input className="input-field" placeholder="Summarise your experience..." value={title} onChange={e => setTitle(e.target.value)} maxLength={150} id="review-title" />
              </div>
              <div>
                <label className="input-label">Your Review</label>
                <textarea className="input-field" rows={4} placeholder="Share your experience with this product..." value={body} onChange={e => setBody(e.target.value)} maxLength={1000} style={{ resize: 'vertical' }} id="review-body" />
              </div>
              <button type="submit" className="btn btn-accent" disabled={submitting} style={{ alignSelf: 'flex-start' }} id="submit-review">
                {submitting ? '⏳ Submitting...' : <><Send size={15} /> Submit Review</>}
              </button>
            </form>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg)', background: '#10b98115', border: '1px solid #10b98130', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-xl)', color: '#10b981', fontWeight: 600 }}>
          <CheckCircle size={18} /> Review submitted! Thank you.
        </motion.div>
      )}

      {/* Reviews list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <AnimatePresence>
          {reviews.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-accent)', fontSize: '0.9rem', flexShrink: 0 }}>
                      {r.user.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.user}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.date}</div>
                    </div>
                    {r.verified && (
                      <span style={{ fontSize: '0.7rem', background: '#10b98115', color: '#10b981', padding: '2px 8px', borderRadius: 9999, fontWeight: 700 }}>✓ Verified</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= r.rating ? '#f59e0b' : 'var(--color-border)', fontSize: '0.9rem' }}>★</span>)}
                </div>
              </div>
              {r.title && <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.95rem' }}>{r.title}</div>}
              {r.body && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 'var(--space-sm)' }}>{r.body}</p>}
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}
                onClick={() => addToast('Marked as helpful', 'info')}
              >
                <ThumbsUp size={13} /> Helpful ({r.helpful})
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
