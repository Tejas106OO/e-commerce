import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, Star } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice, getDiscountPercent } from '../../utils/helpers'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, index = 0, viewMode = 'grid' }) {
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { addToast } = useToast()

  const discount = getDiscountPercent(product.price, product.originalPrice)
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, product.sizes?.[0], product.colors?.[0])
    addToast(`${product.name} added to cart`, 'success')
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
    addToast(
      wishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      wishlisted ? 'info' : 'success'
    )
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
        strokeWidth={i < Math.floor(rating) ? 0 : 1.5}
      />
    ))
  }

  return (
    <motion.div
      className={`${styles.card} ${viewMode === 'list' ? styles.listCard : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      {/* Image */}
      <div className={styles.imageWrapper}>
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} className={styles.image} loading="lazy" />
        </Link>

        {/* Badges */}
        <div className={styles.badges}>
          {discount > 0 && <span className={styles.dealBadge}>{discount}% OFF</span>}
          {product.featured && <span className={styles.newBadge}>Featured</span>}
        </div>

        {/* Hover Actions */}
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${wishlisted ? styles.wishlisted : ''}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <Link to={`/product/${product.id}`} className={styles.actionBtn} aria-label="Quick view">
            <Eye size={16} />
          </Link>
        </div>

        {/* Quick Add */}
        <button className={styles.quickAdd} onClick={handleAddToCart} disabled={!product.inStock} style={!product.inStock ? { opacity: 0.6, cursor: 'not-allowed', transform: 'translateY(0)' } : {}}>
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <span className={styles.brand}>{product.brand}</span>
        <div className={styles.name}>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </div>
        <div className={styles.ratingRow}>
          <div className={styles.stars}>{renderStars(product.rating)}</div>
          <span className={styles.reviewCount}>({product.reviews})</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {discount > 0 && (
            <>
              <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
              <span className={styles.discountPct}>{discount}% off</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
