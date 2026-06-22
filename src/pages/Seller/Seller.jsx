import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Store, Package, ShoppingBag, TrendingUp, Plus, Edit3,
  Eye, ToggleLeft, ToggleRight, Upload, X, ChevronRight,
  Star, Clock, CheckCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'
import { products, categories } from '../../data/products'
import styles from './Seller.module.css'

const ORDER_STATUS = {
  processing: { color: '#f59e0b', label: 'Processing' },
  shipped:    { color: '#3b82f6', label: 'Shipped'    },
  delivered:  { color: '#10b981', label: 'Delivered'  },
}

const SELLER_PRODUCTS = products.slice(0, 6)
const SELLER_ORDERS = [
  { id: 'LX-2025-01198', customer: 'Priya S.', product: SELLER_PRODUCTS[0]?.name, total: 24998, status: 'delivered', date: '2025-06-19' },
  { id: 'LX-2025-01199', customer: 'Arjun M.', product: SELLER_PRODUCTS[1]?.name, total: 5499,  status: 'shipped',   date: '2025-06-20' },
  { id: 'LX-2025-01200', customer: 'Ananya R.', product: SELLER_PRODUCTS[2]?.name, total: 8999,  status: 'processing',date: '2025-06-21' },
]

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: TrendingUp },
  { id: 'products',  label: 'My Products', icon: Package  },
  { id: 'orders',    label: 'Orders',    icon: ShoppingBag },
  { id: 'add',       label: 'Add Product', icon: Plus     },
]

const EMPTY_FORM = {
  name: '', category: '', price: '', originalPrice: '',
  stock: '', description: '', sizes: '', colors: ''
}

export default function Seller() {
  const { user, isSeller } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab]   = useState('overview')
  const [form, setForm] = useState(EMPTY_FORM)
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [activeProducts, setActiveProducts] = useState(
    Object.fromEntries(SELLER_PRODUCTS.map(p => [p.id, true]))
  )

  if (!isSeller) {
    navigate('/account', { replace: true })
    return null
  }

  const handleImageDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer?.files || e.target.files || [])
      .filter(f => f.type.startsWith('image/')).slice(0, 6)
    const previews = files.map(f => ({ url: URL.createObjectURL(f), name: f.name }))
    setImages(prev => [...prev, ...previews].slice(0, 6))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitting(false)
    addToast('Product listed successfully! (Connect backend to persist)', 'success')
    setForm(EMPTY_FORM)
    setImages([])
    setTab('products')
  }

  const toggleActive = (id) => {
    setActiveProducts(prev => ({ ...prev, [id]: !prev[id] }))
    addToast(`Product ${activeProducts[id] ? 'deactivated' : 'activated'}`, 'info')
  }

  const StatCard = ({ label, value, icon: Icon, note }) => (
    <motion.div className={styles.statCard} whileHover={{ y: -3 }}>
      <div className={styles.statIcon}><Icon size={22} /></div>
      <div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
        {note && <div className={styles.statNote}>{note}</div>}
      </div>
    </motion.div>
  )

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}><Store size={20} /> Seller Hub</div>
        <nav className={styles.nav}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`${styles.navBtn} ${tab === id ? styles.active : ''}`} onClick={() => setTab(id)}>
              <Icon size={16} /> {label}
              {tab === id && <ChevronRight size={14} className={styles.arrow} />}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.sellerAvatar}>{user.name.charAt(0)}</div>
          <div>
            <div className={styles.sellerName}>{user.name}</div>
            <div className={styles.sellerBadge}>Verified Seller</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

            {/* ── Overview ─────────────────────────────────── */}
            {tab === 'overview' && (
              <div>
                <h1 className={styles.title}>Welcome back, {user.name} 👋</h1>
                <p className={styles.subtitle}>Here's how your store is performing this month.</p>
                <div className={styles.statsGrid}>
                  <StatCard label="Active Listings" value={SELLER_PRODUCTS.length} icon={Package} note="+2 this month" />
                  <StatCard label="Total Orders"    value="23"                     icon={ShoppingBag} note="3 pending" />
                  <StatCard label="Monthly Revenue" value={formatPrice(284_500)}   icon={TrendingUp} note="+12.4%" />
                  <StatCard label="Avg. Rating"     value="4.7 ⭐"                 icon={Star} note="Based on 142 reviews" />
                </div>

                <div className={styles.twoCol}>
                  {/* Recent orders */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.cardTitle}>Recent Orders</h2>
                      <button className={styles.link} onClick={() => setTab('orders')}>View all</button>
                    </div>
                    {SELLER_ORDERS.map(o => (
                      <div key={o.id} className={styles.orderRow}>
                        <div>
                          <div className={styles.orderId}>{o.id}</div>
                          <div className={styles.orderMeta}>{o.customer} · {o.date}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, textAlign: 'right', fontSize: '0.9rem' }}>{formatPrice(o.total)}</div>
                          <span className={styles.statusBadge} style={{ color: ORDER_STATUS[o.status]?.color }}>
                            {ORDER_STATUS[o.status]?.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Top products */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.cardTitle}>Top Products</h2>
                    </div>
                    {SELLER_PRODUCTS.slice(0, 4).map((p, i) => (
                      <div key={p.id} className={styles.productPreview}>
                        <span className={styles.rank}>#{i + 1}</span>
                        <img src={p.image} alt={p.name} className={styles.thumb} />
                        <div className={styles.pInfo}>
                          <div className={styles.pName}>{p.name}</div>
                          <div className={styles.pMeta}>⭐ {p.rating} · {formatPrice(p.price)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── My Products ──────────────────────────────── */}
            {tab === 'products' && (
              <div>
                <div className={styles.pageHeader}>
                  <h1 className={styles.title}>My Products</h1>
                  <button className="btn btn-accent" onClick={() => setTab('add')}>
                    <Plus size={16} /> Add Product
                  </button>
                </div>
                <div className={styles.productGrid}>
                  {SELLER_PRODUCTS.map(p => (
                    <motion.div key={p.id} className={styles.productCard} whileHover={{ y: -4 }}>
                      <div className={styles.productImageWrap}>
                        <img src={p.image} alt={p.name} className={styles.productImage} />
                        <div className={`${styles.activePill} ${activeProducts[p.id] ? styles.on : styles.off}`}>
                          {activeProducts[p.id] ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className={styles.productBody}>
                        <div className={styles.productName}>{p.name}</div>
                        <div className={styles.productMeta}>{p.brand} · ⭐ {p.rating} ({p.reviews})</div>
                        <div className={styles.productPrice}>{formatPrice(p.price)}</div>
                        <div className={styles.productActions}>
                          <button className={styles.actionBtn}><Eye size={14} /> View</button>
                          <button className={styles.actionBtn}><Edit3 size={14} /> Edit</button>
                          <button className={styles.toggleBtn} onClick={() => toggleActive(p.id)}>
                            {activeProducts[p.id] ? <ToggleRight size={18} style={{ color: '#10b981' }} /> : <ToggleLeft size={18} style={{ color: '#6b7280' }} />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Orders ──────────────────────────────────── */}
            {tab === 'orders' && (
              <div>
                <h1 className={styles.title}>Orders</h1>
                <div className={styles.tableCard}>
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Date</th><th>Total</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {SELLER_ORDERS.map(o => (
                        <tr key={o.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>{o.id}</td>
                          <td>{o.customer}</td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{o.product}</td>
                          <td>{o.date}</td>
                          <td style={{ fontWeight: 700 }}>{formatPrice(o.total)}</td>
                          <td>
                            <span style={{ color: ORDER_STATUS[o.status]?.color, fontWeight: 600, fontSize: '0.85rem' }}>
                              {ORDER_STATUS[o.status]?.label}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Add Product ──────────────────────────────── */}
            {tab === 'add' && (
              <div>
                <h1 className={styles.title}>List a New Product</h1>
                <form className={styles.addForm} onSubmit={handleSubmit}>
                  {/* Image upload */}
                  <div className={styles.uploadSection}>
                    <div
                      className={styles.dropZone}
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleImageDrop}
                      onClick={() => document.getElementById('imgInput').click()}
                    >
                      <Upload size={32} style={{ color: 'var(--color-accent)', marginBottom: 8 }} />
                      <div style={{ fontWeight: 600 }}>Drag & drop images here</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>or click to browse — max 6 images, 5MB each</div>
                      <input id="imgInput" type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageDrop} />
                    </div>
                    {images.length > 0 && (
                      <div className={styles.imagePreviewGrid}>
                        {images.map((img, i) => (
                          <div key={i} className={styles.previewWrap}>
                            <img src={img.url} alt={img.name} className={styles.previewImg} />
                            <button type="button" className={styles.removeImg} onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}>
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form fields */}
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label className="input-label">Product Name *</label>
                      <input className="input-field" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Midnight Velvet Blazer" />
                    </div>
                    <div className={styles.formField}>
                      <label className="input-label">Category *</label>
                      <select className="input-field" required value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className={styles.formField}>
                      <label className="input-label">Selling Price (₹) *</label>
                      <input className="input-field" type="number" required min="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="e.g. 8999" />
                    </div>
                    <div className={styles.formField}>
                      <label className="input-label">Original / MRP (₹)</label>
                      <input className="input-field" type="number" min="1" value={form.originalPrice} onChange={e => setForm({...form, originalPrice: e.target.value})} placeholder="e.g. 12999" />
                    </div>
                    <div className={styles.formField}>
                      <label className="input-label">Stock Quantity *</label>
                      <input className="input-field" type="number" required min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="e.g. 50" />
                    </div>
                    <div className={styles.formField}>
                      <label className="input-label">Sizes (comma-separated)</label>
                      <input className="input-field" value={form.sizes} onChange={e => setForm({...form, sizes: e.target.value})} placeholder="S, M, L, XL" />
                    </div>
                    <div className={`${styles.formField} ${styles.fullWidth}`}>
                      <label className="input-label">Description *</label>
                      <textarea className="input-field" required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe your product in detail..." style={{ resize: 'vertical' }} />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" className="btn btn-outline" onClick={() => setTab('products')}>Cancel</button>
                    <button type="submit" className="btn btn-accent" disabled={submitting} id="submit-product">
                      {submitting ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}>⏳</motion.span>
                          Uploading...
                        </span>
                      ) : (
                        <><CheckCircle size={16} /> List Product</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
