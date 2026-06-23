import { motion } from 'framer-motion'

export default function Terms() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using the LUXE platform, you agree to comply with and be bound by these Terms & Conditions. If you do not agree to these terms, please refrain from using our services.'
    },
    {
      title: '2. Use of Service',
      content: 'You agree to use our website only for lawful purposes. You are prohibited from violating or attempting to violate the security of the site, performing unauthorized penetration tests, or using web crawlers/scrapers to collect content without written consent.'
    },
    {
      title: '3. Orders & Payments',
      content: 'All orders placed through our platform are subject to availability and confirmation. Prices are subject to change without notice. Payments are processed securely via external gateway partners. Product delivery is scheduled only after payment verification.'
    },
    {
      title: '4. Returns & Refunds',
      content: 'We take pride in our hand-curated collections. If you are unsatisfied with a purchase, returns are accepted within 14 days of receipt for unused items in original packaging. Refunds will be issued back to your original payment method within 5-7 business days.'
    },
    {
      title: '5. Intellectual Property',
      content: 'All software code, graphics, design layout, brand assets, images, and text contained within the LUXE website are intellectual property of LUXE and protected under trademark and copyright laws. Unauthorized replication is strictly prohibited.'
    },
    {
      title: '6. Limitation of Liability',
      content: 'LUXE shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, or for unauthorized access to or alteration of your transmissions or data.'
    }
  ]

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-2xl))', paddingBottom: 'var(--space-4xl)' }}>
      {/* Hero */}
      <section style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)', padding: 'var(--space-4xl) 0', marginTop: 'calc(-1 * var(--space-2xl))', borderBottom: '1px solid var(--color-border-light)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 700 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 'var(--space-lg)', color: 'var(--color-text)' }}>
              Terms & <span style={{ color: 'var(--color-accent)' }}>Conditions</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              Please read these Terms & Conditions carefully before using our website. 
              By using our service, you agree to these legal conditions.
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
