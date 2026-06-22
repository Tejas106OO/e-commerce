import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{ paddingTop: 'var(--navbar-height)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(6rem, 15vw, 10rem)', fontWeight: 700, color: 'var(--color-accent)', lineHeight: 1, marginBottom: 'var(--space-md)', opacity: 0.2 }}>
            404
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: 'var(--space-sm)' }}>
            Page Not Found
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2xl)', maxWidth: 400, margin: '0 auto var(--space-2xl)' }}>
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-accent">
              <Home size={16} /> Go Home
            </Link>
            <Link to="/products" className="btn btn-outline">
              Browse Products
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
