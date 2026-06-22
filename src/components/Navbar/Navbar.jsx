import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingBag, Heart, User, Sun, Moon, Menu, X, LayoutDashboard, Store } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useDebounce } from '../../hooks/useDebounce'
import { products } from '../../data/products'
import { formatPrice } from '../../utils/helpers'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const { darkMode, toggleTheme } = useTheme()
  const { user } = useAuth()
  // Debounce: only filter results 300ms after the user stops typing
  const debouncedQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    if (debouncedQuery.trim().length > 1) {
      const q = debouncedQuery.toLowerCase()
      const results = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      ).slice(0, 6)
      setSearchResults(results)
      setShowSearch(true)
    } else {
      setSearchResults([])
      setShowSearch(false)
    }
  }, [debouncedQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSearch(false)
      setMobileOpen(false)
    }
  }

  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`)
    setSearchQuery('')
    setShowSearch(false)
  }

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/products/fashion', label: 'Fashion' },
    { to: '/products/electronics', label: 'Electronics' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  const adminLink = user?.role === 'admin' ? { to: '/admin', label: 'Admin', icon: <LayoutDashboard size={16} /> } : null
  const sellerLink = (user?.role === 'seller' || user?.role === 'admin') ? { to: '/seller', label: 'Dashboard', icon: <Store size={16} /> } : null

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} id="main-navbar">
        <div className={styles.navInner}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            LUX<span>E</span>
          </Link>

          {/* Nav Links */}
          <div className={styles.navLinks}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Search */}
          <div className={styles.searchWrapper} ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="search-input"
              />
            </form>
            <AnimatePresence>
              {showSearch && searchResults.length > 0 && (
                <motion.div
                  className={styles.searchDropdown}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {searchResults.map(product => (
                    <div
                      key={product.id}
                      className={styles.searchItem}
                      onClick={() => handleResultClick(product.id)}
                    >
                      <img src={product.image} alt={product.name} className={styles.searchItemImage} />
                      <div className={styles.searchItemInfo}>
                        <div className={styles.searchItemName}>{product.name}</div>
                        <div className={styles.searchItemPrice}>{formatPrice(product.price)}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className={styles.navActions}>
            {adminLink && (
              <Link to={adminLink.to} className={styles.navAction} aria-label="Admin Panel" id="nav-admin">
                {adminLink.icon}
              </Link>
            )}
            {sellerLink && !adminLink && (
              <Link to={sellerLink.to} className={styles.navAction} aria-label="Seller Dashboard" id="nav-seller">
                {sellerLink.icon}
              </Link>
            )}
            <button className={styles.navAction} onClick={toggleTheme} aria-label="Toggle theme" id="theme-toggle">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/wishlist" className={styles.navAction} aria-label="Wishlist" id="nav-wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <motion.span
                  className={styles.navBadge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={wishlistCount}
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>
            <Link to="/cart" className={styles.navAction} aria-label="Shopping Cart" id="nav-cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <motion.span
                  className={styles.navBadge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={cartCount}
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
            <Link to="/account" className={styles.navAction} aria-label="Account" id="nav-account">
              <User size={20} />
            </Link>
            <button
              className={styles.menuToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={`${styles.mobileMenu} ${styles.open}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <form onSubmit={handleSearchSubmit} className={styles.mobileSearchForm}>
              <Search size={18} className={styles.mobileSearchIcon} />
              <input
                type="text"
                className={styles.mobileSearchInput}
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="mobile-search-input"
              />
            </form>
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={styles.mobileNavLink}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className={styles.mobileDivider} />
            <Link to="/wishlist" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
              <Heart size={18} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
            <Link to="/cart" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
              <ShoppingBag size={18} /> Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            <Link to="/account" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
              <User size={18} /> Account
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
