import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Package, ShoppingBag,
  TrendingUp, ChevronRight, CheckCircle, Clock,
  Truck, Star, AlertTriangle, Search, Filter,
  Edit3, Trash2, Eye, RefreshCw, ArrowUp, ArrowDown
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice } from '../../utils/helpers'
import { products, testimonials } from '../../data/products'
import styles from './Admin.module.css'

// ── Mock data for demo ────────────────────────────────────────────────────────
const mockStats = {
  revenue:   { value: 18_64_520, change: +12.4 },
  orders:    { value: 1847,      change: +8.2  },
  customers: { value: 5432,      change: +21.3 },
  products:  { value: products.length, change: +3 }
}

const mockOrders = [
  { id: 'LX-2025-01201', customer: 'Priya Sharma',   total: 24998, status: 'delivered',   date: '2025-06-20' },
  { id: 'LX-2025-01202', customer: 'Arjun Mehta',    total: 8999,  status: 'shipped',     date: '2025-06-20' },
  { id: 'LX-2025-01203', customer: 'Ananya Reddy',   total: 54999, status: 'processing',  date: '2025-06-19' },
  { id: 'LX-2025-01204', customer: 'Vikram Singh',   total: 14999, status: 'pending',     date: '2025-06-19' },
  { id: 'LX-2025-01205', customer: 'Kavya Nair',     total: 3499,  status: 'delivered',   date: '2025-06-18' },
  { id: 'LX-2025-01206', customer: 'Rohan Kapoor',   total: 89999, status: 'shipped',     date: '2025-06-18' },
  { id: 'LX-2025-01207', customer: 'Divya Pillai',   total: 6999,  status: 'cancelled',   date: '2025-06-17' },
]

const mockUsers = [
  { id: 1, name: 'Priya Sharma',  email: 'priya@example.com',  role: 'customer', joined: '2025-01-12', orders: 8,  spent: 124500 },
  { id: 2, name: 'Arjun Mehta',   email: 'arjun@example.com',  role: 'seller',   joined: '2025-02-05', orders: 23, spent: 0 },
  { id: 3, name: 'Ananya Reddy',  email: 'ananya@example.com', role: 'customer', joined: '2025-03-18', orders: 5,  spent: 87600 },
  { id: 4, name: 'Vikram Singh',  email: 'vikram@example.com', role: 'customer', joined: '2025-04-01', orders: 12, spent: 245000 },
  { id: 5, name: 'Admin User',    email: 'admin@luxe.com',     role: 'admin',    joined: '2024-12-01', orders: 0,  spent: 0 },
]

const STATUS_CONFIG = {
  delivered:  { color: '#10b981', bg: '#10b98115', label: 'Delivered' },
  shipped:    { color: '#3b82f6', bg: '#3b82f615', label: 'Shipped'   },
  processing: { color: '#f59e0b', bg: '#f59e0b15', label: 'Processing'},
  pending:    { color: '#6b7280', bg: '#6b728015', label: 'Pending'   },
  cancelled:  { color: '#ef4444', bg: '#ef444415', label: 'Cancelled' },
}

const SECTIONS = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'orders',    label: 'Orders',    icon: ShoppingBag     },
  { id: 'products',  label: 'Products',  icon: Package         },
  { id: 'customers', label: 'Customers', icon: Users           },
  { id: 'reviews',   label: 'Reviews',   icon: Star            },
]

export default function Admin() {
  const { user, isAdmin } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [section, setSection] = useState('overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [productSearch, setProductSearch] = useState('')
  const [orderStatuses, setOrderStatuses] = useState(
    Object.fromEntries(mockOrders.map(o => [o.id, o.status]))
  )

  useEffect(() => {
    if (!isAdmin) navigate('/account', { replace: true })
  }, [isAdmin, navigate])

  if (!isAdmin) return null

  const filteredOrders = mockOrders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
                        o.customer.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase())
  )

  const handleStatusChange = (orderId, newStatus) => {
    setOrderStatuses(prev => ({ ...prev, [orderId]: newStatus }))
    addToast(`Order ${orderId} marked as ${newStatus}`, 'success')
  }

  const StatCard = ({ label, value, change, icon: Icon, prefix = '' }) => (
    <motion.div
      className={styles.statCard}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.statIcon}><Icon size={22} /></div>
      <div>
        <div className={styles.statValue}>{prefix}{typeof value === 'number' && value > 10000 ? formatPrice(value) : value.toLocaleString('en-IN')}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
      <div className={`${styles.statChange} ${change >= 0 ? styles.positive : styles.negative}`}>
        {change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        {Math.abs(change)}%
      </div>
    </motion.div>
  )

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          LUX<span>E</span> Admin
        </div>
        <nav className={styles.sidebarNav}>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${styles.navItem} ${section === id ? styles.active : ''}`}
              onClick={() => setSection(id)}
            >
              <Icon size={18} />
              {label}
              {section === id && <ChevronRight size={16} className={styles.navArrow} />}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>{user.name.charAt(0)}</div>
          <div>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userRole}>Administrator</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ── Overview ─────────────────────────────────────── */}
          {section === 'overview' && (
            <div>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Dashboard Overview</h1>
                <span className={styles.badge}>Live Demo</span>
              </div>

              <div className={styles.statsGrid}>
                <StatCard label="Total Revenue"   value={mockStats.revenue.value}   change={mockStats.revenue.change}   icon={TrendingUp} />
                <StatCard label="Total Orders"    value={mockStats.orders.value}    change={mockStats.orders.change}    icon={ShoppingBag} />
                <StatCard label="Total Customers" value={mockStats.customers.value} change={mockStats.customers.change} icon={Users} />
                <StatCard label="Active Products" value={mockStats.products.value}  change={mockStats.products.change}  icon={Package} />
              </div>

              <div className={styles.twoCol}>
                {/* Recent Orders */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Recent Orders</h2>
                    <button className={styles.viewAll} onClick={() => setSection('orders')}>View all</button>
                  </div>
                  {mockOrders.slice(0, 5).map(order => (
                    <div key={order.id} className={styles.orderRow}>
                      <div>
                        <div className={styles.orderNum}>{order.id}</div>
                        <div className={styles.orderMeta}>{order.customer} · {order.date}</div>
                      </div>
                      <div className={styles.orderRight}>
                        <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                        <span className={styles.statusBadge} style={{ background: STATUS_CONFIG[order.status]?.bg, color: STATUS_CONFIG[order.status]?.color }}>
                          {STATUS_CONFIG[order.status]?.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top Products */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Top Products</h2>
                    <button className={styles.viewAll} onClick={() => setSection('products')}>View all</button>
                  </div>
                  {products.filter(p => p.featured).slice(0, 5).map((p, i) => (
                    <div key={p.id} className={styles.productRow}>
                      <div className={styles.productRank}>#{i + 1}</div>
                      <img src={p.image} alt={p.name} className={styles.productThumb} />
                      <div className={styles.productInfo}>
                        <div className={styles.productName}>{p.name}</div>
                        <div className={styles.productMeta}>{p.category} · ⭐ {p.rating}</div>
                      </div>
                      <div className={styles.productPrice}>{formatPrice(p.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Orders ────────────────────────────────────────── */}
          {section === 'orders' && (
            <div>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Order Management</h1>
              </div>
              <div className={styles.filterRow}>
                <div className={styles.searchWrap}>
                  <Search size={16} className={styles.searchIcon} />
                  <input className={styles.filterInput} placeholder="Search by order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td className={styles.orderId}>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.date}</td>
                        <td>{formatPrice(order.total)}</td>
                        <td>
                          <span className={styles.statusBadge} style={{ background: STATUS_CONFIG[orderStatuses[order.id]]?.bg, color: STATUS_CONFIG[orderStatuses[order.id]]?.color }}>
                            {STATUS_CONFIG[orderStatuses[order.id]]?.label}
                          </span>
                        </td>
                        <td>
                          <select
                            className={styles.statusSelect}
                            value={orderStatuses[order.id]}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                          >
                            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Products ──────────────────────────────────────── */}
          {section === 'products' && (
            <div>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Product Catalog</h1>
                <span className={styles.totalBadge}>{products.length} products</span>
              </div>
              <div className={styles.filterRow}>
                <div className={styles.searchWrap}>
                  <Search size={16} className={styles.searchIcon} />
                  <input className={styles.filterInput} placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                </div>
              </div>
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Product</th><th>Category</th><th>Brand</th><th>Price</th><th>Rating</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredProducts.slice(0, 20).map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={p.image} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                            <span className={styles.productNameTd}>{p.name}</span>
                          </div>
                        </td>
                        <td><span className={styles.categoryChip}>{p.category}</span></td>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{p.brand}</td>
                        <td>{formatPrice(p.price)}</td>
                        <td><span style={{ color: '#f59e0b' }}>⭐ {p.rating}</span></td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button className={styles.iconBtn} title="View"><Eye size={15} /></button>
                            <button className={styles.iconBtn} title="Edit"><Edit3 size={15} /></button>
                            <button className={`${styles.iconBtn} ${styles.danger}`} title="Deactivate" onClick={() => addToast(`${p.name} deactivated`, 'info')}><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Customers ─────────────────────────────────────── */}
          {section === 'customers' && (
            <div>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Customer Management</h1>
              </div>
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Orders</th><th>Total Spent</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {mockUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-accent)', fontSize: '0.9rem' }}>{u.name.charAt(0)}</div>
                            {u.name}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{u.email}</td>
                        <td><span className={`${styles.roleBadge} ${styles[u.role]}`}>{u.role}</span></td>
                        <td style={{ fontSize: '0.85rem' }}>{u.joined}</td>
                        <td>{u.orders}</td>
                        <td>{u.spent > 0 ? formatPrice(u.spent) : '—'}</td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button className={styles.iconBtn} onClick={() => addToast('User details viewed', 'info')}><Eye size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Reviews ───────────────────────────────────────── */}
          {section === 'reviews' && (
            <div>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Review Moderation</h1>
              </div>
              <div className={styles.reviewsGrid}>
                {testimonials.map(r => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewUser}>
                        <span className={styles.reviewAvatar}>{r.avatar}</span>
                        <div>
                          <div className={styles.reviewName}>{r.name}</div>
                          <div className={styles.reviewRole}>{r.role}</div>
                        </div>
                      </div>
                      <div className={styles.reviewStars}>{'⭐'.repeat(r.rating)}</div>
                    </div>
                    <p className={styles.reviewText}>{r.text}</p>
                    <div className={styles.reviewActions}>
                      <button className={`${styles.iconBtn} ${styles.approve}`} onClick={() => addToast('Review approved', 'success')}><CheckCircle size={15} /> Approve</button>
                      <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => addToast('Review hidden', 'info')}><Trash2 size={15} /> Hide</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
