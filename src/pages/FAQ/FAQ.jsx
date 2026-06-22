import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  { q: 'How long does delivery take?', a: 'Standard delivery takes 5-7 business days. Express delivery (available at checkout) takes 2-3 business days. Free shipping is available on all orders above ₹1,999.' },
  { q: 'What is your return policy?', a: 'We offer a 30-day hassle-free return policy. Items must be unused, in original packaging, and with tags attached. Refunds are processed within 5-7 business days after we receive the returned item.' },
  { q: 'Are the products authentic?', a: 'Absolutely. Every product on LUXE is sourced directly from authorized distributors or the brands themselves. We guarantee 100% authenticity on all items.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you\'ll receive a tracking link via email and SMS. You can also track your order anytime from the "My Orders" section in your account.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards (Visa, Mastercard, Amex), UPI (Google Pay, PhonePe, Paytm), net banking, and wallet payments. All transactions are secured by Razorpay.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled within 24 hours of placement, provided they haven\'t been shipped yet. Go to "My Orders" and click "Cancel Order" or contact our support team.' },
  { q: 'Do you ship internationally?', a: 'Currently, we ship within India only. International shipping is coming soon! Sign up for our newsletter to be notified when we launch global shipping.' },
  { q: 'How do I apply a coupon code?', a: 'Enter your coupon code in the "Coupon Code" field on the cart page and click "Apply". The discount will be reflected in your order summary. Try WELCOME10 for 10% off your first order!' },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-2xl))', paddingBottom: 'var(--space-4xl)' }}>
      <section style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', color: '#fff', padding: 'var(--space-3xl) 0', marginTop: 'calc(-1 * var(--space-2xl))' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <HelpCircle size={40} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-md)' }} />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>Frequently Asked Questions</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Everything you need to know about shopping at LUXE</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  style={{
                    width: '100%', padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontWeight: 600, fontSize: '0.95rem', textAlign: 'left', gap: 'var(--space-md)', color: 'var(--color-text)'
                  }}
                >
                  {faq.q}
                  <ChevronDown size={18} style={{ transition: 'transform 0.3s', transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0, color: 'var(--color-text-muted)' }} />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
