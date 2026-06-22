import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, X } from 'lucide-react'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('luxe_cookie_consent')
      if (!consent) {
        // Show after a brief delay
        const timer = setTimeout(() => setVisible(true), 2000)
        return () => clearTimeout(timer)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem('luxe_cookie_consent', 'accepted')
    } catch {}
    setVisible(false)
  }

  const handleDecline = () => {
    try {
      localStorage.setItem('luxe_cookie_consent', 'declined')
    } catch {}
    setVisible(false)
  }

  const bannerStyle = {
    position: 'fixed',
    bottom: 'var(--space-lg)',
    left: 'var(--space-lg)',
    right: 'var(--space-lg)',
    maxWidth: 600,
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-lg)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-lg)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    color: 'var(--color-text)',
    marginLeft: 'auto',
    marginRight: 'auto'
  }

  const buttonRowStyle = {
    display: 'flex',
    gap: 'var(--space-sm)',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={bannerStyle}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
            <ShieldAlert size={24} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Cookie Consent & PII Privacy Notice</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                We use local storage cookies to remember your shopping cart items, wishlist, and session authentication state. We never store personal details on tracking servers without your consent. 
                By clicking "Accept", you agree to our GDPR-compliant local storage policy.
              </p>
            </div>
            <button onClick={handleDecline} style={{ opacity: 0.5, color: 'var(--color-text)', display: 'flex' }} aria-label="Dismiss banner">
              <X size={16} />
            </button>
          </div>
          <div style={buttonRowStyle}>
            <button className="btn btn-outline btn-sm" onClick={handleDecline}>Decline</button>
            <button className="btn btn-accent btn-sm" onClick={handleAccept}>Accept Cookies</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
