import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook, Link2 } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer} id="main-footer">
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>LUX<span>E</span></div>
            <p className={styles.footerDesc}>
              Curating premium lifestyle products since 2020. We believe in quality over quantity, 
              bringing you the finest from around the world.
            </p>
            <div className={styles.footerSocials}>
              <a href="https://instagram.com" className={styles.socialIcon} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com" className={styles.socialIcon} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <Twitter size={18} />
              </a>
              <a href="https://facebook.com" className={styles.socialIcon} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <Facebook size={18} />
              </a>
              <a href="https://pinterest.com" className={styles.socialIcon} aria-label="Pinterest" target="_blank" rel="noopener noreferrer">
                <Link2 size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.footerColumn}>
            <h4>Quick Links</h4>
            <Link to="/products" className={styles.footerLink}>All Products</Link>
            <Link to="/products/fashion" className={styles.footerLink}>Fashion</Link>
            <Link to="/products/electronics" className={styles.footerLink}>Electronics</Link>
            <Link to="/products/home" className={styles.footerLink}>Home & Living</Link>
            <Link to="/products/beauty" className={styles.footerLink}>Beauty</Link>
            <Link to="/products/sports" className={styles.footerLink}>Sports</Link>
          </div>

          {/* Customer Service */}
          <div className={styles.footerColumn}>
            <h4>Customer Service</h4>
            <Link to="/account" className={styles.footerLink}>My Account</Link>
            <Link to="/cart" className={styles.footerLink}>Shopping Cart</Link>
            <Link to="/wishlist" className={styles.footerLink}>Wishlist</Link>
            <Link to="/faq" className={styles.footerLink}>FAQ</Link>
            <Link to="/contact" className={styles.footerLink}>Contact Us</Link>
            <Link to="/about" className={styles.footerLink}>About Us</Link>
          </div>

          {/* Contact */}
          <div className={styles.footerColumn}>
            <h4>Get in Touch</h4>
            <div className={styles.contactItem}>
              <MapPin size={16} />
              <span>42, MG Road, Indiranagar<br />Bangalore, Karnataka 560038</span>
            </div>
            <div className={styles.contactItem}>
              <Phone size={16} />
              <span>+91 98765 43210</span>
            </div>
            <div className={styles.contactItem}>
              <Mail size={16} />
              <span>hello@luxestore.in</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>© {new Date().getFullYear()} LUXE. All rights reserved.</p>
          <div className={styles.footerBottomLinks}>
            <Link to="/privacy" className={styles.footerBottomLink}>Privacy Policy</Link>
            <Link to="/terms" className={styles.footerBottomLink}>Terms & Conditions</Link>
            <Link to="/faq" className={styles.footerBottomLink}>FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
