import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Grid3X3, List, SlidersHorizontal, X, ChevronRight, Check } from 'lucide-react'
import { products, categories, brands } from '../../data/products'
import ProductCard from '../../components/ProductCard/ProductCard'
import styles from './ProductListing.module.css'

export default function ProductListing() {
  const { category } = useParams()
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategories, setSelectedCategories] = useState(category ? [category] : [])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    setSelectedCategories(category ? [category] : [])
    setSelectedBrands([])
    setPriceMin('')
    setPriceMax('')
    setMinRating(0)
  }, [category])

  const catObj = category ? categories.find(c => c.id === category) : null
  const pageTitle = catObj ? catObj.name : 'All Products'

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category))
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand))
    }

    // Price filter
    if (priceMin) result = result.filter(p => p.price >= Number(priceMin))
    if (priceMax) result = result.filter(p => p.price <= Number(priceMax))

    // Rating filter
    if (minRating > 0) result = result.filter(p => p.rating >= minRating)

    // Sort
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break
      case 'price-high': result.sort((a, b) => b.price - a.price); break
      case 'rating': result.sort((a, b) => b.rating - a.rating); break
      case 'newest': result.sort((a, b) => b.id - a.id); break
      case 'featured': result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break
      default: break
    }

    return result
  }, [selectedCategories, selectedBrands, priceMin, priceMax, minRating, sortBy])

  const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    )
  }

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
  }

  const clearFilters = () => {
    setSelectedCategories(category ? [category] : [])
    setSelectedBrands([])
    setPriceMin('')
    setPriceMax('')
    setMinRating(0)
  }

  const hasActiveFilters = selectedBrands.length > 0 || priceMin || priceMax || minRating > 0

  // Available brands for current filter
  const availableBrands = useMemo(() => {
    const filtered = selectedCategories.length > 0
      ? products.filter(p => selectedCategories.includes(p.category))
      : products
    return [...new Set(filtered.map(p => p.brand))]
  }, [selectedCategories])

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            {catObj ? (
              <>
                <Link to="/products">Shop</Link>
                <ChevronRight size={14} />
                <span>{catObj.name}</span>
              </>
            ) : (
              <span>Shop</span>
            )}
          </div>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>{pageTitle}</h1>
              <span className={styles.count}>{filteredProducts.length} products</span>
            </div>
            <div className={styles.controls}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setFiltersOpen(true)}
                id="filter-toggle-btn"
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                id="sort-select"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className={styles.layout}>
          {/* Overlay Backdrop */}
          {filtersOpen && (
            <div className={styles.overlay} onClick={() => setFiltersOpen(false)} />
          )}

          {/* Sidebar Filters */}
          <aside className={`${styles.sidebar} ${filtersOpen ? styles.open : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Filters</span>
              <button onClick={() => setFiltersOpen(false)} style={{ display: 'flex', cursor: 'pointer', color: 'var(--color-text)' }} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>

            {hasActiveFilters && (
              <button className={styles.clearFilters} onClick={clearFilters}>Clear all filters</button>
            )}

            {/* Categories */}
            {!category && (
              <div className={styles.filterSection}>
                <div className={styles.filterTitle}>Categories</div>
                {categories.map(cat => (
                  <label key={cat.id} className={styles.filterOption} onClick={() => toggleCategory(cat.id)}>
                    <div className={`${styles.filterCheckbox} ${selectedCategories.includes(cat.id) ? styles.checked : ''}`}>
                      {selectedCategories.includes(cat.id) && <Check size={12} />}
                    </div>
                    {cat.name}
                  </label>
                ))}
              </div>
            )}

            {/* Brands */}
            <div className={styles.filterSection}>
              <div className={styles.filterTitle}>Brands</div>
              {availableBrands.map(brand => (
                <label key={brand} className={styles.filterOption} onClick={() => toggleBrand(brand)}>
                  <div className={`${styles.filterCheckbox} ${selectedBrands.includes(brand) ? styles.checked : ''}`}>
                    {selectedBrands.includes(brand) && <Check size={12} />}
                  </div>
                  {brand}
                </label>
              ))}
            </div>

            {/* Price Range */}
            <div className={styles.filterSection}>
              <div className={styles.filterTitle}>Price Range</div>
              <div className={styles.priceRange}>
                <input
                  type="number"
                  className={styles.priceInput}
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
                <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                <input
                  type="number"
                  className={styles.priceInput}
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>
            </div>

            {/* Rating */}
            <div className={styles.filterSection}>
              <div className={styles.filterTitle}>Minimum Rating</div>
              {[4, 3, 2, 1].map(r => (
                <label key={r} className={styles.filterOption} onClick={() => setMinRating(minRating === r ? 0 : r)}>
                  <div className={`${styles.filterCheckbox} ${minRating === r ? styles.checked : ''}`}>
                    {minRating === r && <Check size={12} />}
                  </div>
                  {r}+ Stars
                </label>
              ))}
            </div>

            {filtersOpen && (
              <button className="btn btn-accent" style={{ width: '100%', marginTop: 'var(--space-md)' }} onClick={() => setFiltersOpen(false)}>
                Apply Filters
              </button>
            )}
          </aside>

          {/* Product Grid */}
          <div>
            {filteredProducts.length > 0 ? (
              <div className={`${styles.productGrid} ${viewMode === 'list' ? styles.list : ''}`}>
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <h3>No products found</h3>
                <p>Try adjusting your filters or browse our full collection.</p>
                <button className="btn btn-outline" onClick={clearFilters} style={{ marginTop: 'var(--space-lg)' }}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
