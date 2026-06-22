import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'

export default function Wishlist() {
  const { items, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { addToast } = useToast()

  const handleMoveToCart = (product) => {
    addToCart(product, product.sizes?.[0], product.colors?.[0])
    toggleWishlist(product)
    addToast(`${product.name} moved to cart`, 'success')
  }

  if (items.length === 0) {
    return (
      <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-3xl))', paddingBottom: 'var(--space-4xl)', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)', opacity: 0.3 }}>❤️</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>Save your favorite items to buy them later.</p>
            <Link to="/products" className="btn btn-accent">Explore Products</Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-2xl))', paddingBottom: 'var(--space-4xl)' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, marginBottom: 'var(--space-2xl)' }}>
          <Heart size={24} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--color-error)' }} />
          My Wishlist ({items.length})
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-lg)' }}>
          {items.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
            >
              <Link to={`/product/${product.id}`} style={{ display: 'block', aspectRatio: '3/4', overflow: 'hidden' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'} />
              </Link>
              <div style={{ padding: 'var(--space-md)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{product.brand}</div>
                <Link to={`/product/${product.id}`} style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>{product.name}</Link>
                <div style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>{formatPrice(product.price)}</div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button className="btn btn-accent btn-sm" style={{ flex: 1 }} onClick={() => handleMoveToCart(product)}>
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => { toggleWishlist(product); addToast('Removed from wishlist', 'info') }} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
