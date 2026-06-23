import { motion } from 'framer-motion'

export default function Privacy() {
  const sections = [
    {
      title: '1. Data Collection',
      content: 'We collect information you provide directly to us when creating an account, editing your profile, placing an order, or contacting customer support. This information may include your name, email address, phone number, shipping address, and payment information.'
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the information we collect to process and fulfill your orders, manage your account, send transaction updates, respond to customer service requests, and send marketing communications if you have opted in to receive them.'
    },
    {
      title: '3. Cookies and Tracking',
      content: 'LUXE uses cookies and similar tracking technologies to analyze site traffic, personalize content, and enhance your shopping experience. You can adjust your browser settings to reject cookies, though some features of our site may not function properly as a result.'
    },
    {
      title: '4. Third-Party Services',
      content: 'We may share your data with trusted third-party service providers who assist us in operating our website, conducting our business, or servicing you (such as payment processing partners and delivery services). All third parties are obligated to keep your information secure and confidential.'
    },
    {
      title: '5. Security of Data',
      content: 'We implement state-of-the-art security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. We utilize SSL encryption for all transaction details and follow strict internal data governance practices.'
    },
    {
      title: '6. Contact Us',
      content: 'If you have any questions or concerns regarding this Privacy Policy, please reach out to our privacy compliance officer at hello@luxestore.in.'
    }
  ]

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-2xl))', paddingBottom: 'var(--space-4xl)' }}>
      {/* Hero */}
      <section style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)', padding: 'var(--space-4xl) 0', marginTop: 'calc(-1 * var(--space-2xl))', borderBottom: '1px solid var(--color-border-light)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 700 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 'var(--space-lg)', color: 'var(--color-text)' }}>
              Privacy <span style={{ color: 'var(--color-accent)' }}>Policy</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              At LUXE, we value your trust and are committed to protecting your personal information. 
              This policy explains how we collect, use, and protect your data.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.9, fontSize: '1rem' }}>
              <p style={{ marginBottom: 'var(--space-2xl)', fontStyle: 'italic', textAlign: 'center' }}>
                Last updated: June 23, 2026
              </p>
              
              {sections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: 'var(--space-xl)' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text)', fontSize: '1.25rem', marginBottom: 'var(--space-sm)' }}>
                    {section.title}
                  </h2>
                  <p>{section.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
