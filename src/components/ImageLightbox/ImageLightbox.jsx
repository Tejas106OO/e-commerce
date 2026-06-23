import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './ImageLightbox.module.css'

export default function ImageLightbox({ images, currentIndex, onClose, onPrev, onNext, onDotClick }) {
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    // Block body scroll
    document.body.style.overflow = 'hidden'
    
    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        onPrev()
      } else if (e.key === 'ArrowRight') {
        onNext()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, onPrev, onNext])

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX
  }

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX
    handleSwipe()
  }

  const handleSwipe = () => {
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) {
      onNext() // swipe left -> next
    } else if (diff < -50) {
      onPrev() // swipe right -> prev
    }
  }

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      aria-label="Close Lightbox"
      id="lightbox-overlay"
    >
      {/* Close button */}
      <button 
        className={styles.closeBtn} 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close lightbox"
        id="lightbox-close-btn"
      >
        <X size={24} />
      </button>

      {/* Navigation Left */}
      {images.length > 1 && (
        <button 
          className={`${styles.navBtn} ${styles.leftBtn}`} 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous image"
          id="lightbox-prev-btn"
        >
          <ChevronLeft size={30} />
        </button>
      )}

      {/* Center Image Container */}
      <div 
        className={styles.imageWrapper}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Product view ${currentIndex + 1}`}
          className={styles.lightboxImg}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25 }}
        />
      </div>

      {/* Navigation Right */}
      {images.length > 1 && (
        <button 
          className={`${styles.navBtn} ${styles.rightBtn}`} 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next image"
          id="lightbox-next-btn"
        >
          <ChevronRight size={30} />
        </button>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className={styles.dots}>
          {images.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${currentIndex === index ? styles.activeDot : ''}`}
              onClick={(e) => { e.stopPropagation(); onDotClick(index); }}
              aria-label={`Go to image ${index + 1}`}
              id={`lightbox-dot-${index}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
