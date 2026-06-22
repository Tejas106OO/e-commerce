import { motion } from 'framer-motion'
import { Award, Users, Globe, Heart } from 'lucide-react'

const values = [
  { icon: <Award size={28} />, title: 'Quality First', desc: 'Every product is meticulously vetted for craftsmanship, materials, and durability before joining our collection.' },
  { icon: <Users size={28} />, title: 'Community Driven', desc: 'Built by enthusiasts, for enthusiasts. Our community of 50,000+ discerning shoppers guides our curation.' },
  { icon: <Globe size={28} />, title: 'Global Sourcing', desc: 'We partner with artisans and brands across 25+ countries to bring you the finest from around the world.' },
  { icon: <Heart size={28} />, title: 'Sustainable', desc: 'Committed to ethical sourcing and eco-friendly packaging. Every purchase supports a greener future.' },
]

export default function About() {
  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-2xl))', paddingBottom: 'var(--space-4xl)' }}>
      {/* Hero */}
      <section style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)', padding: 'var(--space-4xl) 0', marginTop: 'calc(-1 * var(--space-2xl))', borderBottom: '1px solid var(--color-border-light)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 700 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 'var(--space-lg)', color: 'var(--color-text)' }}>
              The Art of <span style={{ color: 'var(--color-accent)' }}>Curated Living</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              Founded in 2020, LUXE began with a simple belief: everyone deserves access to exceptional products
              that elevate everyday life. We're not just a store — we're curators of a premium lifestyle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="section-title">Our Story</h2>
            <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.9, fontSize: '1rem' }}>
              <p style={{ marginBottom: 'var(--space-lg)' }}>
                What started as a passion project in a small Bangalore apartment has grown into one of India's most trusted
                premium lifestyle destinations. Our founder, tired of the choice paradox in online shopping,
                envisioned a platform where every product tells a story of exceptional craftsmanship.
              </p>
              <p style={{ marginBottom: 'var(--space-lg)' }}>
                Today, LUXE features over 200 hand-selected products across six carefully curated categories.
                Each item passes through our rigorous 12-point quality assessment before earning a place in our collection.
              </p>
              <p>
                From Italian velvet blazers to Japanese ceramic tea sets, from cutting-edge tech to artisanal beauty —
                we believe in fewer, better things.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <p className="section-subtitle">The principles that guide everything we do</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-xl)' }}>
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', border: '1px solid var(--color-border-light)', textAlign: 'center' }}
              >
                <div style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'center' }}>{v.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: 'var(--space-sm)' }}>{v.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4xl)', flexWrap: 'wrap', textAlign: 'center' }}>
            {[
              { num: '200+', label: 'Curated Products' },
              { num: '50K+', label: 'Happy Customers' },
              { num: '25+', label: 'Partner Countries' },
              { num: '4.9', label: 'Average Rating' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>{s.num}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
