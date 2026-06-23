import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Package, MapPin, LogOut, Mail, Phone, Eye, EyeOff, Edit2, Plus, Trash2, Check, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice, INDIAN_STATES } from '../../utils/helpers'
import styles from './Account.module.css'
import { sanitizeInput } from '../../utils/sanitize'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'

const statusColors = { processing: '#f59e0b', shipped: '#3b82f6', delivered: '#10b981' }

export default function Account() {
  const { user, login, register, logout, updateProfile, isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const highlightOrderId = searchParams.get('highlight')
  const queryTab = searchParams.get('tab')

  const [isLogin, setIsLogin] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [activeSection, setActiveSection] = useState('profile')

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' })
  const [profileErrors, setProfileErrors] = useState({})

  // Address Edit State
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false })
  const [addressErrors, setAddressErrors] = useState({})

  // Sync profile editing fields when user details change
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  // Sync tab and scrolling highlight
  useEffect(() => {
    if (queryTab) {
      setActiveSection(queryTab)
    }
  }, [queryTab])

  useEffect(() => {
    if (highlightOrderId && activeSection === 'orders') {
      const timer = setTimeout(() => {
        const element = document.getElementById(`order-card-${highlightOrderId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [highlightOrderId, activeSection])

  const validateForm = () => {
    const errs = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!isLogin) {
      if (!form.name || form.name.trim().length < 2) {
        errs.name = 'Name must be at least 2 characters'
      }
      if (form.password !== form.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match'
      }
    }
    if (!form.email || !emailRegex.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address'
    }
    if (!form.password || form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    }
    
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    const sanitizedEmail = sanitizeInput(form.email)
    const sanitizedName = sanitizeInput(form.name)
    
    if (isLogin) {
      const res = login(sanitizedEmail, form.password)
      if (res.success) {
        addToast('Welcome back!', 'success')
        const redirectPath = location.state?.from || '/account'
        navigate(redirectPath, { replace: true })
      } else {
        addToast(res.error, 'error')
      }
    } else {
      const res = register(sanitizedName, sanitizedEmail, form.password)
      if (res.success) {
        addToast('Account created successfully!', 'success')
        const redirectPath = location.state?.from || '/account'
        navigate(redirectPath, { replace: true })
      } else {
        addToast(res.error, 'error')
      }
    }
  }

  const handleForgotSubmit = (e) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!forgotEmail || !emailRegex.test(forgotEmail.trim())) {
      addToast('Please enter a valid email address', 'error')
      return
    }
    addToast("If this email is registered, you'll receive a reset link shortly.", 'success')
    setShowForgotPassword(false)
    setForgotEmail('')
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const errs = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!profileForm.name || profileForm.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters'
    }
    if (!profileForm.email || !emailRegex.test(profileForm.email.trim())) {
      errs.email = 'Please enter a valid email address'
    }
    
    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs)
      return
    }

    updateProfile({
      name: sanitizeInput(profileForm.name),
      email: sanitizeInput(profileForm.email),
      phone: sanitizeInput(profileForm.phone)
    })
    setIsEditingProfile(false)
    setProfileErrors({})
    addToast('Profile updated successfully', 'success')
  }

  const validateAddressForm = () => {
    const errs = {}
    if (!addressForm.name.trim()) errs.name = 'Name is required'
    if (!addressForm.phone.trim()) {
      errs.phone = 'Phone number is required'
    } else {
      const cleanPhone = addressForm.phone.replace(/[\s()-]/g, '')
      const digitsOnly = cleanPhone.replace(/^\+/, '')
      if (!/^\d+$/.test(digitsOnly) || digitsOnly.length < 10) {
        errs.phone = 'Invalid phone number (minimum 10 digits)'
      }
    }
    if (!addressForm.street.trim()) errs.street = 'Street address is required'
    if (!addressForm.city.trim()) errs.city = 'City is required'
    if (!addressForm.state.trim()) errs.state = 'State is required'
    if (!addressForm.pincode.trim() || !/^\d{6}$/.test(addressForm.pincode.trim())) {
      errs.pincode = 'Pincode must be exactly 6 digits'
    }
    setAddressErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSaveAddress = (e) => {
    e.preventDefault()
    if (!validateAddressForm()) return

    let updatedAddresses = [...(user.addresses || [])]
    const newAddress = {
      id: editingAddressId || Date.now(),
      name: sanitizeInput(addressForm.name),
      phone: sanitizeInput(addressForm.phone),
      street: sanitizeInput(addressForm.street),
      city: sanitizeInput(addressForm.city),
      state: sanitizeInput(addressForm.state),
      pincode: sanitizeInput(addressForm.pincode),
      isDefault: addressForm.isDefault
    }

    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }))
    }

    if (editingAddressId) {
      updatedAddresses = updatedAddresses.map(a => a.id === editingAddressId ? newAddress : a)
      addToast('Address updated successfully', 'success')
    } else {
      if (updatedAddresses.length === 0) {
        newAddress.isDefault = true
      }
      updatedAddresses.push(newAddress)
      addToast('Address added successfully', 'success')
    }

    updateProfile({ addresses: updatedAddresses })
    resetAddressForm()
  }

  const handleDeleteAddress = (id) => {
    let updatedAddresses = user.addresses.filter(a => a.id !== id)
    if (user.addresses.find(a => a.id === id)?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true
    }
    updateProfile({ addresses: updatedAddresses })
    addToast('Address deleted successfully', 'info')
  }

  const handleSetDefaultAddress = (id) => {
    const updatedAddresses = user.addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }))
    updateProfile({ addresses: updatedAddresses })
    addToast('Default address updated', 'success')
  }

  const resetAddressForm = () => {
    setAddressForm({ name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false })
    setIsAddingAddress(false)
    setEditingAddressId(null)
    setAddressErrors({})
  }

  const startEditAddress = (addr) => {
    setAddressForm({ ...addr })
    setEditingAddressId(addr.id)
    setIsAddingAddress(true)
  }

  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-3xl))', paddingBottom: 'var(--space-4xl)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: 440 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-2xl)' }}
          >
            {showForgotPassword ? (
              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', textAlign: 'center', marginBottom: 'var(--space-xs)' }}>
                  Reset Password
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-xl)' }}>
                  Enter your email to receive a password reset link.
                </p>
                <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div>
                    <label className="input-label" htmlFor="forgot-email">Email Address</label>
                    <input
                      id="forgot-email"
                      className="input-field"
                      type="email"
                      placeholder="hello@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%' }}>
                    Send Reset Link
                  </button>
                  <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '4px' }} onClick={() => setShowForgotPassword(false)}>
                    Back to Login
                  </button>
                </form>
              </div>
            ) : (
              <div>
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
                      onClick={() => {
                        setIsLogin(tab === 'Login')
                        setErrors({})
                      }}
                      style={{
                        flex: 1, padding: '0.75rem', fontWeight: 600, fontSize: '0.9rem',
                        borderBottom: (tab === 'Login' ? isLogin : !isLogin) ? '2px solid var(--color-accent)' : '2px solid transparent',
                        color: (tab === 'Login' ? isLogin : !isLogin) ? 'var(--color-text)' : 'var(--color-text-muted)',
                        transition: 'all 0.2s',
                        background: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderTop: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {!isLogin && (
                    <div>
                      <label className="input-label" htmlFor="auth-name">Full Name</label>
                      <input
                        className="input-field"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        id="auth-name"
                      />
                      {errors.name && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{errors.name}</span>}
                    </div>
                  )}
                  <div>
                    <label className="input-label" htmlFor="auth-email">Email</label>
                    <input
                      className="input-field"
                      type="email"
                      placeholder="hello@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      id="auth-email"
                    />
                    {errors.email && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{errors.email}</span>}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <label className="input-label" htmlFor="auth-password">Password</label>
                    <input
                      className="input-field"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      style={{ paddingRight: '2.5rem' }}
                      id="auth-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 12, top: 34, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {errors.password && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', display: 'block', marginTop: '2px' }}>{errors.password}</span>}
                  </div>
                  {!isLogin && (
                    <div style={{ position: 'relative' }}>
                      <label className="input-label" htmlFor="auth-confirm-password">Confirm Password</label>
                      <input
                        className="input-field"
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        required
                        style={{ paddingRight: '2.5rem' }}
                        id="auth-confirm-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{ position: 'absolute', right: 12, top: 34, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-label={showConfirmPass ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {errors.confirmPassword && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{errors.confirmPassword}</span>}
                    </div>
                  )}
                  {isLogin && (
                    <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                  <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: 'var(--space-sm)' }} id="auth-submit">
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </button>
                </form>
              </div>
            )}
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
                onClick={() => {
                  setActiveSection(s.id)
                  resetAddressForm()
                  setIsEditingProfile(false)
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', width: '100%',
                  padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 500,
                  background: activeSection === s.id ? 'var(--color-accent-light)' : 'transparent',
                  color: activeSection === s.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s', marginBottom: '0.25rem', border: 'none', cursor: 'pointer', textAlign: 'left'
                }}
              >
                {s.icon} {s.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--color-border-light)', marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)' }}>
              <button onClick={() => { logout(); addToast('Logged out', 'info') }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {activeSection === 'profile' && (
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: 0 }}>Profile</h2>
                  {!isEditingProfile && (
                    <button className="btn btn-outline btn-sm" onClick={() => setIsEditingProfile(true)}>
                      <Edit2 size={14} /> Edit Profile
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                      <div>
                        <label className="input-label" htmlFor="profile-name">Full Name</label>
                        <input
                          id="profile-name"
                          className="input-field"
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          required
                        />
                        {profileErrors.name && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{profileErrors.name}</span>}
                      </div>
                      <div>
                        <label className="input-label" htmlFor="profile-email">Email Address</label>
                        <input
                          id="profile-email"
                          className="input-field"
                          type="email"
                          value={profileForm.email}
                          onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                          required
                        />
                        {profileErrors.email && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{profileErrors.email}</span>}
                      </div>
                    </div>
                    <div>
                      <label className="input-label" htmlFor="profile-phone">Phone Number</label>
                      <input
                        id="profile-phone"
                        className="input-field"
                        placeholder="+91 98765 43210"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-sm)' }}>
                      <button type="button" className="btn btn-outline" onClick={() => { setIsEditingProfile(false); setProfileErrors({}) }}>Cancel</button>
                      <button type="submit" className="btn btn-accent">Save Changes</button>
                    </div>
                  </form>
                ) : (
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
                )}
              </div>
            )}

            {activeSection === 'orders' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 'var(--space-xl)' }}>My Orders</h2>
                {user.orders?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {user.orders.map(order => {
                      const isHighlighted = order.id === highlightOrderId
                      return (
                        <div
                          key={order.id}
                          id={`order-card-${order.id}`}
                          style={{
                            background: 'var(--color-surface)',
                            border: isHighlighted ? '2.5px solid var(--color-accent)' : '1px solid var(--color-border-light)',
                            boxShadow: isHighlighted ? '0 0 16px rgba(232, 185, 49, 0.25)' : 'none',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-lg)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 'var(--space-md)',
                            transition: 'all 0.3s'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {order.id}
                              {isHighlighted && <span className="badge badge-accent">Newly Placed</span>}
                            </div>
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
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)' }}>No orders yet.</p>
                )}
              </div>
            )}

            {activeSection === 'addresses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: 0 }}>Saved Addresses</h2>
                  {!isAddingAddress && (
                    <button className="btn btn-accent btn-sm" onClick={() => setIsAddingAddress(true)}>
                      <Plus size={14} /> Add New Address
                    </button>
                  )}
                </div>

                {isAddingAddress ? (
                  <form onSubmit={handleSaveAddress} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: 'var(--space-sm)' }}>
                      {editingAddressId ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                      <div>
                        <label className="input-label" htmlFor="addr-name">Full Name</label>
                        <input
                          id="addr-name"
                          className="input-field"
                          placeholder="John Doe"
                          value={addressForm.name}
                          onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                          required
                        />
                        {addressErrors.name && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{addressErrors.name}</span>}
                      </div>
                      <div>
                        <label className="input-label" htmlFor="addr-phone">Phone Number</label>
                        <input
                          id="addr-phone"
                          className="input-field"
                          placeholder="+91 98765 43210"
                          value={addressForm.phone}
                          onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                          required
                        />
                        {addressErrors.phone && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{addressErrors.phone}</span>}
                      </div>
                    </div>
                    <div>
                      <label className="input-label" htmlFor="addr-street">Street Address</label>
                      <input
                        id="addr-street"
                        className="input-field"
                        placeholder="42, MG Road, Indiranagar"
                        value={addressForm.street}
                        onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                        required
                      />
                      {addressErrors.street && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{addressErrors.street}</span>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                      <div>
                        <label className="input-label" htmlFor="addr-city">City</label>
                        <input
                          id="addr-city"
                          className="input-field"
                          placeholder="Bangalore"
                          value={addressForm.city}
                          onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                        />
                        {addressErrors.city && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{addressErrors.city}</span>}
                      </div>
                      <div>
                        <label className="input-label" htmlFor="addr-state">State / UT</label>
                        <select
                          id="addr-state"
                          className="input-field"
                          value={addressForm.state}
                          onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                          required
                        >
                          <option value="">Select State / UT</option>
                          {INDIAN_STATES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {addressErrors.state && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{addressErrors.state}</span>}
                      </div>
                    </div>
                    <div>
                      <label className="input-label" htmlFor="addr-pincode">Pincode</label>
                      <input
                        id="addr-pincode"
                        className="input-field"
                        placeholder="560038"
                        value={addressForm.pincode}
                        onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        required
                      />
                      {addressErrors.pincode && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{addressErrors.pincode}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                      <input
                        type="checkbox"
                        id="addr-default"
                        checked={addressForm.isDefault}
                        onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        disabled={user.addresses?.length === 0 || (editingAddressId && user.addresses?.find(a => a.id === editingAddressId)?.isDefault)}
                      />
                      <label htmlFor="addr-default" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>Set as default shipping address</label>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-sm)' }}>
                      <button type="button" className="btn btn-outline" onClick={resetAddressForm}>Cancel</button>
                      <button type="submit" className="btn btn-accent">Save Address</button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {user.addresses?.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                        {user.addresses.map(addr => (
                          <div key={addr.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600 }}>{addr.name}</span>
                                {addr.isDefault ? (
                                  <span className="badge badge-accent">Default</span>
                                ) : (
                                  <button
                                    onClick={() => handleSetDefaultAddress(addr.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                                  >
                                    Set Default
                                  </button>
                                )}
                              </div>
                              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 var(--space-md)' }}>
                                {addr.street}<br />{addr.city}, {addr.state} - {addr.pincode}<br />
                                Phone: {addr.phone}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-sm)', marginTop: 'auto' }}>
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ flex: 1, padding: '4px' }}
                                onClick={() => startEditAddress(addr)}
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ flex: 1, padding: '4px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                                onClick={() => handleDeleteAddress(addr.id)}
                                disabled={addr.isDefault && user.addresses.length > 1}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--color-text-secondary)' }}>No saved addresses.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
