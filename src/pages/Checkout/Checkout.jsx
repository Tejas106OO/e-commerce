import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, CreditCard, Check, ChevronRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, generateOrderId } from '../../utils/helpers'
import { sanitizeInput } from '../../utils/sanitize'
import { openRazorpayCheckout } from '../../utils/razorpay'


export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, discount, shipping, tax, total, clearCart, cartCount } = useCart()
  const { addToast } = useToast()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' })
  const [errors, setErrors] = useState({})
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  const validateAddress = () => {
    const errs = {}
    
    if (!address.name.trim()) errs.name = 'Name is required'
    
    if (!address.phone.trim()) {
      errs.phone = 'Phone number is required'
    } else {
      const cleanPhone = address.phone.replace(/[\s()-]/g, '') // remove common formatting characters
      const hasCountryCode = cleanPhone.startsWith('+91') || cleanPhone.startsWith('91')
      const digitsOnly = cleanPhone.replace(/^\+/, '')
      const isDigits = /^\d+$/.test(digitsOnly)
      
      if (!isDigits) {
        errs.phone = 'Phone number must contain digits only'
      } else if (hasCountryCode && digitsOnly.length !== 12) {
        errs.phone = 'Phone number with country code must be 12 digits (+91 followed by 10 digits)'
      } else if (!hasCountryCode && digitsOnly.length !== 10) {
        errs.phone = 'Phone number must be exactly 10 digits'
      }
    }

    if (!address.street.trim()) errs.street = 'Address is required'
    if (!address.city.trim()) errs.city = 'City is required'
    if (!address.state.trim()) errs.state = 'State is required'
    
    if (!address.pincode.trim()) {
      errs.pincode = 'Pincode is required'
    } else if (!/^\d{6}$/.test(address.pincode.trim())) {
      errs.pincode = 'Pincode must be exactly 6 digits'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    if (validateAddress()) {
      const sanitizedAddress = {
        name: sanitizeInput(address.name),
        phone: sanitizeInput(address.phone),
        street: sanitizeInput(address.street),
        city: sanitizeInput(address.city),
        state: sanitizeInput(address.state),
        pincode: sanitizeInput(address.pincode)
      }
      setAddress(sanitizedAddress)
      setStep(2)
    }
  }

  const handlePayment = async () => {
    setPaymentProcessing(true)
    try {
      /**
       * PRODUCTION: Uncomment the block below and remove the mock section.
       * This calls your backend to create a Razorpay order, then opens the checkout modal.
       *
       * const res = await fetch('/api/payments/create-order', {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
       *   body: JSON.stringify({ order_id: localOrderId }),
       * })
       * const { razorpay_order_id, amount, key_id } = await res.json()
       * await openRazorpayCheckout({
       *   amount, orderId: razorpay_order_id,
       *   name: user?.name, email: user?.email, contact: user?.phone,
       *   onSuccess: async ({ razorpay_payment_id, razorpay_order_id: rpOrderId, razorpay_signature }) => {
       *     // Verify on backend
       *     await fetch('/api/payments/verify', { method: 'POST', ... })
       *     clearCart()
       *     navigate(`/order-success?orderId=${localOrderId}&total=${total}`)
       *   },
       *   onFailure: (msg) => addToast(msg, 'error')
       * })
       */

      // ── DEMO (no backend) ─────────────────────────────────────────────────
      const orderId = generateOrderId()
      // Simulate Razorpay opening delay
      await new Promise(r => setTimeout(r, 1200))
      addToast('✅ Payment successful! Order confirmed.', 'success')
      clearCart()
      navigate(`/order-success?orderId=${orderId}&total=${total}`)
      // ─────────────────────────────────────────────────────────────────────
    } catch (err) {
      addToast('Payment failed. Please try again.', 'error')
    } finally {
      setPaymentProcessing(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const pageStyle = { paddingTop: 'calc(var(--navbar-height) + var(--space-2xl))', paddingBottom: 'var(--space-4xl)' }
  const stepStyle = (s) => ({
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    color: step >= s ? 'var(--color-accent)' : 'var(--color-text-muted)',
    fontWeight: step >= s ? 600 : 400, fontSize: '0.9rem'
  })
  const stepCircle = (s) => ({
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: step >= s ? 'var(--color-accent)' : 'var(--color-border)',
    color: step >= s ? '#1a1a2e' : 'var(--color-text-muted)',
    fontWeight: 700, fontSize: '0.85rem'
  })

  return (
    <div style={pageStyle}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: 'var(--space-2xl)' }}>
          <div style={stepStyle(1)}>
            <div style={stepCircle(1)}>{step > 1 ? <Check size={16} /> : '1'}</div>
            Address
          </div>
          <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
          <div style={stepStyle(2)}>
            <div style={stepCircle(2)}>2</div>
            Payment
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-2xl)', alignItems: 'start' }}>
          {/* Form */}
          <div>
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} style={{ color: 'var(--color-accent)' }} /> Shipping Address
                </h2>
                <form onSubmit={handleAddressSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    {[
                      { key: 'name', label: 'Full Name', ph: 'John Doe', span: 1 },
                      { key: 'phone', label: 'Phone Number', ph: '+91 98765 43210', span: 1 },
                      { key: 'street', label: 'Street Address', ph: '42, MG Road, Indiranagar', span: 2 },
                      { key: 'city', label: 'City', ph: 'Bangalore', span: 1 },
                      { key: 'state', label: 'State', ph: 'Karnataka', span: 1 },
                      { key: 'pincode', label: 'Pincode', ph: '560038', span: 2 },
                    ].map(f => (
                      <div key={f.key} style={{ gridColumn: f.span === 2 ? '1 / -1' : 'auto' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>{f.label}</label>
                        <input
                          className="input-field"
                          style={errors[f.key] ? { borderColor: 'var(--color-error)' } : {}}
                          placeholder={f.ph}
                          value={address[f.key]}
                          onChange={(e) => setAddress({ ...address, [f.key]: e.target.value })}
                          id={`checkout-${f.key}`}
                        />
                        {errors[f.key] && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{errors[f.key]}</span>}
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: 'var(--space-xl)' }} id="continue-to-payment">
                    Continue to Payment <ChevronRight size={16} />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={20} style={{ color: 'var(--color-accent)' }} /> Payment
                </h2>
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
                  <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>Shipping to:</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      <strong>{address.name}</strong><br />
                      {address.street}<br />
                      {address.city}, {address.state} - {address.pincode}<br />
                      Phone: {address.phone}
                    </div>
                    <button style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '0.5rem', fontWeight: 600 }} onClick={() => setStep(1)}>
                      Change Address
                    </button>
                  </div>
                  <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-lg)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                      Click below to complete your payment. You'll be redirected to a secure payment page.
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)', padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                      💡 <strong>Demo Mode:</strong> This is a demo store. No real payment will be processed. Razorpay integration ready — provide your API key to enable live payments.
                    </p>
                    <button className="btn btn-accent btn-lg" style={{ width: '100%' }} onClick={handlePayment} disabled={paymentProcessing} id="pay-now-btn">
                      {paymentProcessing ? '⏳ Opening Payment Gateway...' : `Pay ${formatPrice(total)} via Razorpay`}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', position: 'sticky', top: 'calc(var(--navbar-height) + var(--space-xl))' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--color-border-light)' }}>Order Summary</h3>
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 'var(--space-md)' }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.85rem' }}>
                  <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 600, flexShrink: 0 }}>{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-sm)' }}>
              {[
                ['Subtotal', formatPrice(subtotal)],
                ...(discount > 0 ? [['Discount', `-${formatPrice(discount)}`]] : []),
                ['Shipping', shipping === 0 ? 'FREE' : formatPrice(shipping)],
                ['GST (18%)', formatPrice(tax)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  <span>{label}</span>
                  <span style={val === 'FREE' || label === 'Discount' ? { color: 'var(--color-success)', fontWeight: 600 } : {}}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', marginTop: '0.5rem', borderTop: '1.5px solid var(--color-border)', fontWeight: 700, fontSize: '1.05rem' }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
