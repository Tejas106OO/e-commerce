import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search as SearchIcon } from 'lucide-react'
import { products } from '../../data/products'
import ProductCard from '../../components/ProductCard/ProductCard'
import { sanitizeInput } from '../../utils/sanitize'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const sanitizedQuery = useMemo(() => sanitizeInput(query), [query])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-2xl))', paddingBottom: 'var(--space-4xl)', minHeight: '70vh' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: 'var(--space-xs)' }}>
            Search Results
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2xl)' }}>
            {results.length} results for "<strong>{sanitizedQuery}</strong>"
          </p>

          {results.length > 0 ? (
            <div className="grid-products">
              {results.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl) 0' }}>
              <SearchIcon size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)', opacity: 0.3 }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 'var(--space-sm)' }}>No results found</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>
                Try different keywords or browse our collections.
              </p>
              <Link to="/products" className="btn btn-accent">Browse All Products</Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
