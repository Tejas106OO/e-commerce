import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Heart, ShoppingBag, ChevronRight, Minus, Plus, Truck, RotateCcw, Shield, Send, ThumbsUp, CheckCircle, MapPin, HelpCircle, Check, ArrowRight } from 'lucide-react'
import { products } from '../../data/products'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { useRecentlyViewed } from '../../context/RecentlyViewedContext'
import { formatPrice, getDiscountPercent } from '../../utils/helpers'
import ProductCard from '../../components/ProductCard/ProductCard'
import ImageZoom from '../../components/ImageZoom/ImageZoom'
import ImageLightbox from '../../components/ImageLightbox/ImageLightbox'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find(p => p.id === Number(id))
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { addToast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed()

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null)
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  // Feature states
  const [showNotifyForm, setShowNotifyForm] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(user?.email || '')
  const [notifySuccess, setNotifySuccess] = useState(false)

  const [pincode, setPincode] = useState('')
  const [estimatedDelivery, setEstimatedDelivery] = useState(null)
  const [pincodeError, setPincodeError] = useState('')

  const [qaList, setQaList] = useState([])
  const [newQuestion, setNewQuestion] = useState('')

  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [frequentlyBought, setFrequentlyBought] = useState([])
  const [showStickyBar, setShowStickyBar] = useState(false)

  const actionBtnsRef = useRef(null)

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
      setShowNotifyForm(false)
      setNotifySuccess(false)
    }
  }, [id, product])

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product.id)
    }
  }, [product?.id, addToRecentlyViewed])

  // Pre-fill email when user is logged in
  useEffect(() => {
    if (user?.email) {
      setNotifyEmail(user.email)
    }
  }, [user])

  // Load last used pincode and calculate on mount if valid
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lastPincode')
      if (stored) {
        setPincode(stored)
        if (/^\d{6}$/.test(stored)) {
          const today = new Date()
          let added = 0
          let date = new Date(today.getTime())
          while (added < 4) {
            date.setDate(date.getDate() + 1)
            if (date.getDay() !== 0 && date.getDay() !== 6) {
              added++
            }
          }
          const options = { weekday: 'long', day: 'numeric', month: 'long' }
          setEstimatedDelivery(date.toLocaleDateString('en-IN', options))
        }
      }
    } catch {}
  }, [])

  // Load Q&A questions for this product
  useEffect(() => {
    if (product) {
      try {
        const stored = localStorage.getItem(`luxe_qa_${product.id}`)
        if (stored) {
          setQaList(JSON.parse(stored))
        } else {
          setQaList([
            { id: 1, question: "Is this product genuine?", answer: "Yes, all LUXE products are 100% authentic and sourced directly from brands.", date: "2025-06-01", author: "System" },
            { id: 2, question: "What is the return policy?", answer: "We offer hassle-free 30-day returns. See our Returns page for details.", date: "2025-06-02", author: "System" }
          ])
        }
      } catch {
        setQaList([
          { id: 1, question: "Is this product genuine?", answer: "Yes, all LUXE products are 100% authentic and sourced directly from brands.", date: "2025-06-01", author: "System" },
          { id: 2, question: "What is the return policy?", answer: "We offer hassle-free 30-day returns. See our Returns page for details.", date: "2025-06-02", author: "System" }
        ])
      }
    }
  }, [product?.id])

  // Load Frequently Bought Together
  useEffect(() => {
    if (product) {
      const sameCategory = products.filter(p => p.category === product.category && p.id !== product.id)
      const shuffled = [...sameCategory].sort(() => 0.5 - Math.random()).slice(0, 2)
      setFrequentlyBought(shuffled)
    }
  }, [product?.id])

  // Set up IntersectionObserver for Mobile Sticky Action Bar
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    }, { threshold: 0 })

    if (actionBtnsRef.current) {
      observer.observe(actionBtnsRef.current)
    }
    return () => observer.disconnect()
  }, [])

  const calculateEstimatedDelivery = () => {
    const today = new Date()
    let added = 0
    let date = new Date(today.getTime())
    while (added < 4) {
      date.setDate(date.getDate() + 1)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        added++
      }
    }
    const options = { weekday: 'long', day: 'numeric', month: 'long' }
    setEstimatedDelivery(date.toLocaleDateString('en-IN', options))
    setPincodeError('')
  }

  const handlePincodeSubmit = (e) => {
    if (e) e.preventDefault()
    if (/^\d{6}$/.test(pincode)) {
      calculateEstimatedDelivery()
      try {
        localStorage.setItem('lastPincode', pincode)
      } catch {}
    } else {
      setPincodeError('Please enter a valid 6-digit PIN code')
      setEstimatedDelivery(null)
    }
  }

  const handleAskQuestion = (e) => {
    e.preventDefault()
    if (!newQuestion.trim()) return
    const newItem = {
      id: Date.now(),
      question: newQuestion,
      answer: "Answer pending...",
      date: new Date().toISOString().split('T')[0],
      author: user?.name || 'Anonymous'
    }
    const updated = [newItem, ...qaList]
    setQaList(updated)
    setNewQuestion('')
    try {
      localStorage.setItem(`luxe_qa_${product.id}`, JSON.stringify(updated))
    } catch {}
    addToast("Your question has been posted!", "success")
  }

  const handleNotifySubmit = (e) => {
    e.preventDefault()
    if (!notifyEmail.trim()) return
    const newRequest = {
      productId: product.id,
      email: notifyEmail,
      date: new Date().toISOString().split('T')[0]
    }
    try {
      const stored = localStorage.getItem('notifyRequests')
      const current = stored ? JSON.parse(stored) : []
      localStorage.setItem('notifyRequests', JSON.stringify([...current, newRequest]))
    } catch {}
    setNotifySuccess(true)
    addToast("We will notify you when this item is back in stock!", "success")
  }

  const handleAddAllToCart = () => {
    addToCart(product, selectedSize, selectedColor, 1)
    frequentlyBought.forEach(p => {
      addToCart(p, p.sizes?.[0] || null, p.colors?.[0] || null, 1)
    })
    addToast("Added all 3 items to cart!", "success")
  }

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
            <ImageZoom
              src={allImages[selectedImage]}
              alt={product.name}
              onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='%23eaeaea'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' fill='%23a3a3a3' letter-spacing='4'>LUXE</text></svg>" }}
              onClick={() => setIsLightboxOpen(true)}
            />
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

            {product.originalPrice && (
              <div className={styles.priceDetails}>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={styles.bestPriceBadge} id="best-price-badge">
                    🏷️ Lowest price in 30 days
                  </span>
                  <span className={styles.priceDropText}>
                    Price dropped {discount}% from {formatPrice(product.originalPrice)}
                  </span>
                </div>
                <div className={styles.savingsLine}>
                  Price: <span style={{ fontWeight: 600 }}>{formatPrice(product.price)}</span>{' '}
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    ({formatPrice(product.originalPrice - product.price)} you save)
                  </span>
                </div>
              </div>
            )}

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
            <div className={styles.actionBtns} ref={actionBtnsRef}>
              {product.inStock ? (
                <button className="btn btn-accent btn-lg" onClick={handleAddToCart} id="add-to-cart-btn">
                  <ShoppingBag size={18} /> Add to Cart
                </button>
              ) : (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {!notifySuccess ? (
                    <>
                      <button 
                        className="btn btn-accent btn-lg" 
                        onClick={() => setShowNotifyForm(prev => !prev)} 
                        id="notify-me-btn"
                        aria-label="Notify me when available"
                      >
                        🔔 Notify Me When Available
                      </button>
                      <AnimatePresence>
                        {showNotifyForm && (
                          <motion.form 
                            onSubmit={handleNotifySubmit}
                            className={styles.notifyForm}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <input 
                              type="email" 
                              required 
                              placeholder="Enter your email address" 
                              value={notifyEmail}
                              onChange={e => setNotifyEmail(e.target.value)}
                              className="input-field"
                              id="notify-email"
                              aria-label="Email address for notifications"
                            />
                            <button type="submit" className="btn btn-accent btn-sm" id="notify-submit">
                              Submit
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <motion.div 
                      className={styles.notifySuccessMsg}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                      <span>We will email you when this is back in stock!</span>
                    </motion.div>
                  )}
                </div>
              )}
              
              <button
                className={`btn btn-outline btn-lg`}
                onClick={handleWishlist}
                id="wishlist-btn"
                aria-label="Add to wishlist"
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} style={wishlisted ? { color: '#ef4444' } : {}} />
                {wishlisted ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>

            {/* Delivery Date Estimator */}
            <div className={styles.deliveryEstimator}>
              <h3 className={styles.estimatorTitle}>
                <MapPin size={16} /> Delivery Estimate
              </h3>
              <form onSubmit={handlePincodeSubmit} className={styles.estimatorForm}>
                <input
                  type="text"
                  placeholder="Enter 6-digit PIN code"
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field"
                  maxLength={6}
                  id="delivery-pincode"
                  aria-label="PIN Code"
                />
                <button type="submit" className="btn btn-outline btn-sm" id="delivery-submit">
                  Check
                </button>
              </form>
              {pincodeError && <div className={styles.estimatorError}>{pincodeError}</div>}
              {estimatedDelivery && (
                <motion.div 
                  className={styles.estimatorResult}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Estimated delivery: <span style={{ fontWeight: 600 }}>{estimatedDelivery}</span>
                </motion.div>
              )}
              <div className={styles.freeShippingText}>
                Free delivery on orders above ₹1,999
              </div>
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
              {['description', 'specifications', 'reviews', 'Q&A'].map(tab => (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === (tab === 'Q&A' ? 'qa' : tab) ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab === 'Q&A' ? 'qa' : tab)}
                >
                  {tab}
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
              {activeTab === 'qa' && (
                <div className={styles.qaSection}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: 'var(--space-md)' }}>Questions & Answers</h3>
                  
                  {/* Ask Question Form */}
                  <div className={styles.askQuestionBox}>
                    {isAuthenticated ? (
                      <form onSubmit={handleAskQuestion} className={styles.askQuestionForm}>
                        <textarea
                          placeholder="Have a question? Ask the community..."
                          value={newQuestion}
                          onChange={e => setNewQuestion(e.target.value)}
                          className="input-field"
                          rows={3}
                          required
                          id="qa-question-text"
                          aria-label="Ask a question"
                        />
                        <button type="submit" className="btn btn-accent btn-sm" id="qa-submit-btn">
                          Ask Question
                        </button>
                      </form>
                    ) : (
                      <div className={styles.loginToAsk}>
                        Please <Link to="/account" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Sign in</Link> to ask a question.
                      </div>
                    )}
                  </div>

                  {/* Q&A List */}
                  <div className={styles.qaList}>
                    <AnimatePresence>
                      {qaList && qaList.map((qa) => (
                        <motion.div
                          key={qa.id}
                          className={styles.qaItem}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className={styles.qaQuestion}>
                            <span className={styles.qaLabel}>Q:</span>
                            <span className={styles.qaText}>{qa.question}</span>
                          </div>
                          <div className={styles.qaAnswer}>
                            <span className={styles.qaLabel}>A:</span>
                            <span className={`${styles.qaText} ${qa.answer === 'Answer pending...' ? styles.pendingAnswer : ''}`}>
                              {qa.answer}
                            </span>
                          </div>
                          <div className={styles.qaMeta}>
                            Asked by {qa.author} on {qa.date}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recently Viewed Carousel */}
        {recentlyViewedProducts && recentlyViewedProducts.length > 0 && (
          <section className={styles.recentlyViewedSection}>
            <h2 className="section-title">Recently Viewed</h2>
            <p className="section-subtitle">Items you viewed recently</p>
            <div className={styles.recentlyViewedCarousel}>
              <div className={styles.carouselGrid}>
                {recentlyViewedProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

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

        {/* Frequently Bought Together */}
        {frequentlyBought && frequentlyBought.length > 0 && (
          <motion.section 
            className={styles.frequentlyBought}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="section-title">Frequently Bought Together</h2>
            <p className="section-subtitle">Buy them together and save shipping</p>
            <div className={styles.fbtContainer}>
              <div className={styles.fbtRow}>
                {/* Current Product */}
                <div className={styles.fbtItem}>
                  <img 
                    src={allImages[0]} 
                    alt={product.name} 
                    className={styles.fbtImg} 
                    onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='%23eaeaea'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' fill='%23a3a3a3' letter-spacing='4'>LUXE</text></svg>" }}
                  />
                  <span className={styles.fbtName}>{product.name}</span>
                  <span className={styles.fbtPrice}>{formatPrice(product.price)}</span>
                </div>
                
                {frequentlyBought.map((p) => (
                  <div key={p.id} className={styles.fbtItemWrapper}>
                    <div className={styles.fbtPlus}>+</div>
                    <div className={styles.fbtItem}>
                      <img 
                        src={p.images?.[0] || p.image} 
                        alt={p.name} 
                        className={styles.fbtImg} 
                        onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='%23eaeaea'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' fill='%23a3a3a3' letter-spacing='4'>LUXE</text></svg>" }}
                      />
                      <Link to={`/product/${p.id}`} className={styles.fbtName}>{p.name}</Link>
                      <span className={styles.fbtPrice}>{formatPrice(p.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.fbtActionCard}>
                <div className={styles.fbtTotalText}>
                  Total Price: <span className={styles.fbtTotalPrice}>{formatPrice(product.price + frequentlyBought.reduce((sum, p) => sum + p.price, 0))}</span>
                </div>
                <button 
                  className="btn btn-accent btn-lg" 
                  onClick={handleAddAllToCart}
                  aria-label="Add all three items to cart"
                  id="add-all-fbt-btn"
                >
                  Add All 3 to Cart
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <div className={`${styles.stickyBottomBar} ${showStickyBar ? styles.stickyVisible : ''}`}>
        <div className={styles.stickyBarContent}>
          <div className={styles.stickyProductInfo}>
            <span className={styles.stickyName}>{product.name}</span>
            <span className={styles.stickyPrice}>{formatPrice(product.price)}</span>
          </div>
          <div className={styles.stickyActions}>
            <button 
              className="btn btn-outline" 
              onClick={handleWishlist}
              aria-label="Wishlist product"
              id="sticky-wishlist-btn"
              style={{ padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} style={wishlisted ? { color: '#ef4444' } : {}} />
            </button>
            <button 
              className="btn btn-accent" 
              onClick={handleAddToCart}
              aria-label="Add to cart"
              id="sticky-add-to-cart-btn"
              disabled={!product.inStock}
              style={{ flex: 1 }}
            >
              {product.inStock ? 'Add to Cart' : 'Notify Me'}
            </button>
          </div>
        </div>
      </div>

      {/* Image Lightbox Overlay Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <ImageLightbox
            images={allImages}
            currentIndex={selectedImage}
            onClose={() => setIsLightboxOpen(false)}
            onPrev={() => setSelectedImage(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
            onNext={() => setSelectedImage(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
            onDotClick={(index) => setSelectedImage(index)}
          />
        )}
      </AnimatePresence>
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

  const getStarCounts = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      counts[r.rating] = (counts[r.rating] || 0) + 1
    })
    const seedTotal = Math.max(0, (product.reviews || 0) - INITIAL_REVIEWS.length)
    const R = product.rating || 4.5
    let distribution = { 5: 0.6, 4: 0.3, 3: 0.07, 2: 0.02, 1: 0.01 }
    if (R >= 4.7) {
      distribution = { 5: 0.75, 4: 0.18, 3: 0.05, 2: 0.01, 1: 0.01 }
    } else if (R >= 4.3) {
      distribution = { 5: 0.55, 4: 0.30, 3: 0.10, 2: 0.03, 1: 0.02 }
    } else if (R >= 3.8) {
      distribution = { 5: 0.35, 4: 0.40, 3: 0.15, 2: 0.06, 1: 0.04 }
    } else {
      distribution = { 5: 0.20, 4: 0.25, 3: 0.35, 2: 0.12, 1: 0.08 }
    }
    
    let sum = 0
    Object.keys(distribution).forEach(star => {
      const s = Number(star)
      const count = Math.round(seedTotal * distribution[s])
      counts[s] += count
      sum += count
    })
    const diff = seedTotal - sum
    counts[5] += diff
    return counts
  }

  const starCounts = getStarCounts()
  const totalReviewsCount = Object.values(starCounts).reduce((a, b) => a + b, 0) || 1

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
      {/* Summary with Star Histogram */}
      <div className={styles.reviewsSummaryBox}>
        <div className={styles.summaryLeft}>
          <span className={styles.bigRatingText}>{avgRating}</span>
          <div style={{ display: 'flex', gap: 3, marginBottom: 6, color: '#f59e0b' }}>
            {[1,2,3,4,5].map(n => (
              <Star key={n} size={20} fill={n <= Math.round(avgRating) ? '#f59e0b' : 'none'} strokeWidth={1.5} />
            ))}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {totalReviewsCount} global ratings
          </div>
        </div>
        
        <div className={styles.summaryRight}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star] || 0
            const percentage = Math.round((count / totalReviewsCount) * 100)
            return (
              <div key={star} className={styles.histogramRow}>
                <span className={styles.histogramStarLabel}>{star} ★</span>
                <div className={styles.progressBarBg}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className={styles.histogramPercentLabel}>{percentage}%</span>
                <span className={styles.histogramCountLabel}>({count})</span>
              </div>
            )
          })}
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
