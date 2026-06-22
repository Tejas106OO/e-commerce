import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Star, Truck, Shield, RotateCcw } from 'lucide-react'
import { products, categories, testimonials } from '../../data/products'
import ProductCard from '../../components/ProductCard/ProductCard'
import { useToast } from '../../context/ToastContext'
import styles from './Home.module.css'

export default function Home() {
  const { addToast } = useToast()
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 45, seconds: 30 })
  const [email, setEmail] = useState('')

  const featuredProducts = products.filter(p => p.featured).slice(0, 8)
  const dealProducts = products.filter(p => p.deal).slice(0, 4)

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) { seconds = 59; minutes-- }
        if (minutes < 0) { minutes = 59; hours-- }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59 }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (email) {
      addToast('Welcome! You\'ve subscribed to our newsletter.', 'success')
      setEmail('')
    }
  }

  const trustBadges = [
    { icon: <Truck size={22} />, title: 'Free Shipping', desc: 'On orders above ₹1,999' },
    { icon: <Shield size={22} />, title: 'Secure Payment', desc: '100% protected checkout' },
    { icon: <RotateCcw size={22} />, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: <Sparkles size={22} />, title: 'Premium Quality', desc: 'Curated with care' },
  ]

  return (
    <div>
      {/* ========== HERO ========== */}
      <section className={styles.hero} id="hero-section">
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className={styles.heroTag}>
              <Sparkles size={14} />
              New Summer Collection 2025
            </div>
            <h1 className={styles.heroTitle}>
              Discover<br />
              <span>Premium</span><br />
              Lifestyle
            </h1>
            <p className={styles.heroSubtitle}>
              Curated collections of the world's finest products. From fashion to tech, 
              each piece is selected for its exceptional quality and design.
            </p>
            <div className={styles.heroCtas}>
              <Link to="/products" className="btn btn-accent btn-lg">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg">
                Our Story
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <h3>200+</h3>
                <p>Premium Products</p>
              </div>
              <div className={styles.stat}>
                <h3>50K+</h3>
                <p>Happy Customers</p>
              </div>
              <div className={styles.stat}>
                <h3>4.9</h3>
                <p>Average Rating</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          >
            <div className={styles.heroImageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80"
                alt="Premium lifestyle collection"
              />
            </div>
            <motion.div
              className={`${styles.floatingCard} ${styles.floatingCard1}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className={styles.dot} />
              <span>Free Shipping</span>
            </motion.div>
            <motion.div
              className={`${styles.floatingCard} ${styles.floatingCard2}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <div className={styles.price}>30% OFF</div>
              <div className={styles.label}>New Arrivals</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== TRUST BADGES ========== */}
      <section className={styles.trustBadges}>
        <div className="container">
          <div className={styles.trustGrid}>
            {trustBadges.map((item, i) => (
              <motion.div
                key={i}
                className={styles.trustItem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.trustIcon}>{item.icon}</div>
                <div>
                  <div className={styles.trustTitle}>{item.title}</div>
                  <div className={styles.trustDesc}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES ========== */}
      <section className={styles.categories} id="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Explore our curated collections across lifestyle categories</p>
          <div className={styles.catGrid}>
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={`/products/${cat.id}`} className={styles.catCard}>
                  <div className={styles.catCardBg}>
                    <span className={styles.catEmoji}>{cat.icon}</span>
                    <span className={styles.catName}>{cat.name}</span>
                    <span className={styles.catDesc}>{cat.description}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED PRODUCTS ========== */}
      <section className={styles.featured} id="featured-section">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Hand-picked selections from our latest collections</p>
          <div className={styles.productGrid}>
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link to="/products" className="btn btn-outline">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== DEALS BANNER ========== */}
      <section className={styles.dealsBanner} id="deals-section">
        <div className="container">
          <motion.div
            className={styles.dealsInner}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.dealsGlow} />
            <div className={styles.dealsContent}>
              <div className={styles.dealsTag}>⚡ Limited Time Offer</div>
              <h2 className={styles.dealsTitle}>Flash Sale<br />Up to 40% Off</h2>
              <p className={styles.dealsSubtitle}>
                Don't miss out on our biggest sale of the season. Premium products at unbeatable prices.
              </p>
              <div className={styles.countdown}>
                <div className={styles.countUnit}>
                  <div className={styles.countNum}>{String(countdown.hours).padStart(2, '0')}</div>
                  <div className={styles.countLabel}>Hours</div>
                </div>
                <div className={styles.countUnit}>
                  <div className={styles.countNum}>{String(countdown.minutes).padStart(2, '0')}</div>
                  <div className={styles.countLabel}>Minutes</div>
                </div>
                <div className={styles.countUnit}>
                  <div className={styles.countNum}>{String(countdown.seconds).padStart(2, '0')}</div>
                  <div className={styles.countLabel}>Seconds</div>
                </div>
              </div>
              <Link to="/products" className="btn btn-accent">
                Shop Deals <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.dealsProducts}>
              {dealProducts.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className={styles.testimonials} id="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real stories from our community of discerning shoppers</p>
          <div className={styles.testimonialGrid}>
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                className={styles.testimonialCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.testimonialStars}>
                  {Array.from({ length: t.rating }, (_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.avatar}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== NEWSLETTER ========== */}
      <section className={styles.newsletter} id="newsletter-section">
        <div className="container">
          <div className={styles.newsletterInner}>
            <h2 className="section-title">Stay in the Loop</h2>
            <p className="section-subtitle">
              Subscribe for exclusive offers, new arrivals, and style inspiration delivered to your inbox.
            </p>
            <form className={styles.newsletterForm} onSubmit={handleNewsletter}>
              <input
                type="email"
                className={styles.newsletterInput}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="newsletter-email"
              />
              <button type="submit" className="btn btn-accent">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
