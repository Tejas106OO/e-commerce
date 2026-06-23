import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import BackToTop from './components/BackToTop'
import ErrorBoundary from './components/ErrorBoundary'
import CookieConsent from './components/CookieConsent/CookieConsent'

// Import Context Providers
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'

// Import Pages
import Home from './pages/Home/Home'
import ProductListing from './pages/ProductListing/ProductListing'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import Cart from './pages/Cart/Cart'
import Checkout from './pages/Checkout/Checkout'
import OrderSuccess from './pages/OrderSuccess/OrderSuccess'
import Account from './pages/Account/Account'
import Wishlist from './pages/Wishlist/Wishlist'
import Search from './pages/Search/Search'
import About from './pages/About/About'
import Contact from './pages/Contact/Contact'
import FAQ from './pages/FAQ/FAQ'
import NotFound from './pages/NotFound/NotFound'
import Admin from './pages/Admin/Admin'
import Seller from './pages/Seller/Seller'
import ProtectedRoute from './components/ProtectedRoute'
import Privacy from './pages/Privacy/Privacy'
import Terms from './pages/Terms/Terms'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <div className="app-container">
                  <Navbar />
                  <main style={{ minHeight: '80vh' }}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<ProductListing />} />
                      <Route path="/products/:category" element={<ProductListing />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      } />
                      <Route path="/order-success" element={
                        <ProtectedRoute>
                          <OrderSuccess />
                        </ProtectedRoute>
                      } />
                      <Route path="/account" element={<Account />} />
                      <Route path="/wishlist" element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      } />
                      <Route path="/search" element={<Search />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq"            element={<FAQ />} />
                      <Route path="/privacy"        element={<Privacy />} />
                      <Route path="/terms"          element={<Terms />} />
                      <Route path="/admin"          element={
                        <ProtectedRoute requiredRole="admin">
                          <Admin />
                        </ProtectedRoute>
                      } />
                      <Route path="/seller"         element={
                        <ProtectedRoute requiredRole="seller">
                          <Seller />
                        </ProtectedRoute>
                      } />
                      <Route path="*"               element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                  <BackToTop />
                  <CookieConsent />
                </div>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </ErrorBoundary>
)
}
