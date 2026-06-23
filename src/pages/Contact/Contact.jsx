import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { sanitizeInput } from '../../utils/sanitize'
import styles from './Contact.module.css'


export default function Contact() {
  const { addToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const sanitizedForm = {
      name: sanitizeInput(form.name),
      email: sanitizeInput(form.email),
      subject: sanitizeInput(form.subject),
      message: sanitizeInput(form.message)
    }
    
    setSending(true)
    setTimeout(() => {
      setSending(false)
      addToast('Message sent successfully! We\'ll get back to you soon.', 'success')
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 1200)
  }

  return (
    <div className={styles.page}>
      <section style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)', padding: 'var(--space-3xl) 0', marginTop: 'calc(-1 * var(--space-2xl))', borderBottom: '1px solid var(--color-border-light)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: 'var(--space-sm)', color: 'var(--color-text)' }}>Get in Touch</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>We'd love to hear from you. Send us a message and we'll respond promptly.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.layout}>
            {/* Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 'var(--space-xl)' }}>Contact Info</h2>
              {[
                { icon: <MapPin size={18} />, title: 'Address', desc: '42, MG Road, Indiranagar\nBangalore, Karnataka 560038' },
                { icon: <Phone size={18} />, title: 'Phone', desc: '+91 98765 43210' },
                { icon: <Mail size={18} />, title: 'Email', desc: 'hello@luxestore.in' },
                { icon: <Clock size={18} />, title: 'Hours', desc: 'Mon - Sat: 10 AM - 8 PM\nSunday: 11 AM - 6 PM' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <form onSubmit={handleSubmit} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: 'var(--space-sm)' }}>Send a Message</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div>
                    <label className="input-label">Name</label>
                    <input className="input-field" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required id="contact-name" />
                  </div>
                  <div>
                    <label className="input-label">Email</label>
                    <input className="input-field" type="email" placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required id="contact-email" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Subject</label>
                  <input className="input-field" placeholder="How can we help?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required id="contact-subject" />
                </div>
                <div>
                  <label className="input-label">Message</label>
                  <textarea className="input-field" rows={5} placeholder="Your message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required style={{ resize: 'vertical' }} id="contact-message" />
                </div>
                <button type="submit" className="btn btn-accent btn-lg" id="contact-submit" disabled={sending}>
                  {sending ? '⏳ Sending Message...' : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
