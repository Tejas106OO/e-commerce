import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Package, MapPin, LogOut, Mail, Phone, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'
import styles from './Account.module.css'
import { sanitizeInput } from '../../utils/sanitize'

const statusColors = { processing: '#f59e0b', shipped: '#3b82f6', delivered: '#10b981' }

export default function Account() {
  const { user, login, register, logout, isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [activeSection, setActiveSection] = useState('profile')

  const handleSubmit = (e) => {
    e.preventDefault()
    const sanitizedEmail = sanitizeInput(form.email)
    const sanitizedName = sanitizeInput(form.name)
    
    if (isLogin) {
      login(sanitizedEmail, form.password)
      addToast('Welcome back!', 'success')
    } else {
      register(sanitizedName, sanitizedEmail, form.password)
      addToast('Account created successfully!', 'success')
    }
  }

  // Login / Register form
  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-3xl))', paddingBottom: 'var(--space-4xl)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: 440 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-2xl)' }}
          >
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', textAlign: 'center', marginBottom: 'var(--space-xs)' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-xl)' }}>
              {isLogin ? 'Sign in to your LUXE account' : 'Join the LUXE community'}
            </p>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-light)', marginBottom: 'var(--space-xl)' }}>
              {['Login', 'Register'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setIsLogin(tab === 'Login')}
                  style={{
                    flex: 1, padding: '0.75rem', fontWeight: 600, fontSize: '0.9rem',
                    borderBottom: (tab === 'Login' ? isLogin : !isLogin) ? '2px solid var(--color-accent)' : '2px solid transparent',
                    color: (tab === 'Login' ? isLogin : !isLogin) ? 'var(--color-text)' : 'var(--color-text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {!isLogin && (
                <div>
                  <label className="input-label">Full Name</label>
                  <input className="input-field" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required id="auth-name" />
                </div>
              )}
              <div>
                <label className="input-label">Email</label>
                <input className="input-field" type="email" placeholder="hello@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required id="auth-email" />
              </div>
              <div style={{ position: 'relative' }}>
                <label className="input-label">Password</label>
                <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: '2.5rem' }} id="auth-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: 34, color: 'var(--color-text-muted)' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: 'var(--space-sm)' }} id="auth-submit">
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-lg)' }}>
              💡 Demo: Enter any email & password to sign in
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // Authenticated Dashboard
  const sections = [
    { id: 'profile', icon: <User size={18} />, label: 'Profile' },
    { id: 'orders', icon: <Package size={18} />, label: 'My Orders' },
    { id: 'addresses', icon: <MapPin size={18} />, label: 'Addresses' },
  ]

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', position: 'sticky', top: 'calc(var(--navbar-height) + var(--space-xl))' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-lg)', borderBottom: '1px solid var(--color-border-light)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-sm)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
            </div>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', width: '100%',
                  padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 500,
                  background: activeSection === s.id ? 'var(--color-accent-light)' : 'transparent',
                  color: activeSection === s.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s', marginBottom: '0.25rem'
                }}
              >
                {s.icon} {s.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--color-border-light)', marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)' }}>
              <button onClick={() => { logout(); addToast('Logged out', 'info') }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--color-error)' }}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {activeSection === 'profile' && (
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 'var(--space-xl)' }}>Profile</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                  {[
                    { icon: <User size={16} />, label: 'Name', value: user.name },
                    { icon: <Mail size={16} />, label: 'Email', value: user.email },
                    { icon: <Phone size={16} />, label: 'Phone', value: user.phone || 'Not set' },
                  ].map(item => (
                    <div key={item.label} style={{ padding: 'var(--space-md)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                        {item.icon} {item.label}
                      </div>
                      <div style={{ fontWeight: 500 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'orders' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 'var(--space-xl)' }}>My Orders</h2>
                {user.orders?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {user.orders.map(order => (
                      <div key={order.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{order.id}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{order.date} • {order.items} items</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700 }}>{formatPrice(order.total)}</div>
                          <span style={{
                            padding: '4px 12px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            background: `${statusColors[order.status]}15`,
                            color: statusColors[order.status]
                          }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)' }}>No orders yet.</p>
                )}
              </div>
            )}

            {activeSection === 'addresses' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 'var(--space-xl)' }}>Saved Addresses</h2>
                {user.addresses?.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    {user.addresses.map(addr => (
                      <div key={addr.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                          <span style={{ fontWeight: 600 }}>{addr.name}</span>
                          {addr.isDefault && <span className="badge badge-accent">Default</span>}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          {addr.street}<br />{addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)' }}>No saved addresses.</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
