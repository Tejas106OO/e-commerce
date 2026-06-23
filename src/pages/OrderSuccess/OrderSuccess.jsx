import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { formatPrice, getDeliveryDate } from '../../utils/helpers'

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('orderId') || 'LX-2025-00001'
  const total = searchParams.get('total') || 0
  const [confetti, setConfetti] = useState(true)

  // SSR-safe state initialization for window dimensions
  const [dimensions] = useState(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight }
    }
    return { width: 800, height: 600 }
  })

  useEffect(() => {
    const timer = setTimeout(() => setConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-3xl))', paddingBottom: 'var(--space-4xl)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: 600 }}>
        {/* Confetti particles */}
        {confetti && (
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * dimensions.width, opacity: 1, rotate: 0 }}
                animate={{ y: dimensions.height + 100, rotate: 360 * (Math.random() > 0.5 ? 1 : -1), opacity: 0 }}
                transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'easeIn' }}
                style={{
                  position: 'absolute',
                  width: 8 + Math.random() * 8,
                  height: 8 + Math.random() * 8,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  background: ['#e8b931', '#ef4444', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 6)],
                }}
              />
            ))}
          </div>
        )}

        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{ marginBottom: 'var(--space-xl)' }}
        >
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto'
          }}>
            <CheckCircle size={50} style={{ color: 'var(--color-success)' }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>
            Order Placed Successfully! 🎉
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginBottom: 'var(--space-2xl)' }}>
            Thank you for shopping with LUXE. Your order is being processed.
          </p>

          {/* Order Details Card */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border-light)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', textAlign: 'left',
            marginBottom: 'var(--space-2xl)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border-light)' }}>
              <Package size={20} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontWeight: 600 }}>Order Details</span>
            </div>
            {[
              ['Order ID', orderId],
              ['Amount Paid', formatPrice(Number(total))],
              ['Payment Status', 'Paid ✅'],
              ['Estimated Delivery', getDeliveryDate(5)],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate(`/account?tab=orders&highlight=${orderId}`)} className="btn btn-outline" aria-label="Track newly placed order">
              Track Order
            </button>
            <Link to="/products" className="btn btn-accent" aria-label="Continue shopping">
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
