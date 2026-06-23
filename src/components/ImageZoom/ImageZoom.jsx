import { useState, useRef, useCallback, useEffect } from 'react'
import styles from './ImageZoom.module.css'

// ── Utility: distance between two touch points ────────────────────────────────
function getTouchDistance(t1, t2) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
}

// ── Desktop Zoom ──────────────────────────────────────────────────────────────
function DesktopZoom({ src, alt, onError, onClick }) {
  const [active, setActive] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })   // % of image
  const imgRef = useRef(null)

  const ZOOM_FACTOR = 2.5   // how much the side panel zooms in
  const LENS_W = 120        // px
  const LENS_H = 120        // px

  const handleMouseMove = useCallback((e) => {
    const rect = imgRef.current.getBoundingClientRect()
    const rawX = ((e.clientX - rect.left) / rect.width) * 100
    const rawY = ((e.clientY - rect.top) / rect.height) * 100
    setLensPos({
      x: Math.max(0, Math.min(100, rawX)),
      y: Math.max(0, Math.min(100, rawY)),
    })
  }, [])

  // Background position is inverted so the zoomed image "follows" the lens
  const bgPosX = lensPos.x
  const bgPosY = lensPos.y

  return (
    <div className={styles.desktopZoomWrapper}>
      {/* Main image + lens */}
      <div
        ref={imgRef}
        className={`${styles.mainImgContainer} ${active ? styles.zoomCursor : ''}`}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onMouseMove={handleMouseMove}
        onClick={onClick}
        style={{ cursor: 'zoom-in' }}
      >
        <img
          src={src}
          alt={alt}
          className={styles.mainImg}
          onError={onError}
          draggable={false}
        />

        {/* Magnifier lens overlay */}
        {active && (
          <div
            className={styles.lens}
            style={{
              left: `calc(${lensPos.x}% - ${LENS_W / 2}px)`,
              top: `calc(${lensPos.y}% - ${LENS_H / 2}px)`,
              width: LENS_W,
              height: LENS_H,
            }}
          />
        )}
      </div>

      {/* Floating zoom result panel */}
      {active && (
        <div
          className={styles.zoomResult}
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: `${ZOOM_FACTOR * 100}%`,
            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  )
}

// ── Mobile Touch Zoom ─────────────────────────────────────────────────────────
function MobileZoom({ src, alt, onError, onClick }) {
  const [scale, setScale] = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isPinching, setIsPinching] = useState(false)

  const lastDist = useRef(null)
  const lastTap = useRef(0)
  const containerRef = useRef(null)
  const startTranslate = useRef({ x: 0, y: 0 })
  const startTouch = useRef(null)

  const MIN_SCALE = 1
  const MAX_SCALE = 4

  // Reset on image change
  useEffect(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
    setOrigin({ x: 50, y: 50 })
  }, [src])

  const clampTranslate = (tx, ty, sc) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: tx, y: ty }
    const maxX = (rect.width * (sc - 1)) / 2
    const maxY = (rect.height * (sc - 1)) / 2
    return {
      x: Math.max(-maxX, Math.min(maxX, tx)),
      y: Math.max(-maxY, Math.min(maxY, ty)),
    }
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setIsPinching(true)
      lastDist.current = getTouchDistance(e.touches[0], e.touches[1])
    } else if (e.touches.length === 1) {
      startTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      startTranslate.current = { ...translate }
    }
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    if (e.touches.length === 2 && lastDist.current !== null) {
      const newDist = getTouchDistance(e.touches[0], e.touches[1])
      const delta = newDist / lastDist.current
      lastDist.current = newDist

      const rect = containerRef.current.getBoundingClientRect()
      const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width * 100
      const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height * 100
      setOrigin({ x: midX, y: midY })

      setScale(prev => {
        const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev * delta))
        return next
      })
    } else if (e.touches.length === 1 && scale > 1 && startTouch.current) {
      const dx = e.touches[0].clientX - startTouch.current.x
      const dy = e.touches[0].clientY - startTouch.current.y
      const clamped = clampTranslate(
        startTranslate.current.x + dx,
        startTranslate.current.y + dy,
        scale
      )
      setTranslate(clamped)
    }
  }

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setIsPinching(false)
      lastDist.current = null
    }
    // Double-tap to toggle zoom
    if (e.changedTouches.length === 1 && !isPinching) {
      const now = Date.now()
      if (now - lastTap.current < 300) {
        // double tap
        if (scale > 1) {
          setScale(1)
          setTranslate({ x: 0, y: 0 })
        } else {
          const rect = containerRef.current.getBoundingClientRect()
          const tapX = (e.changedTouches[0].clientX - rect.left) / rect.width * 100
          const tapY = (e.changedTouches[0].clientY - rect.top) / rect.height * 100
          setOrigin({ x: tapX, y: tapY })
          setScale(2.5)
        }
      }
      lastTap.current = now
    }
    // Snap back to MIN if under-pinched
    if (scale < MIN_SCALE) {
      setScale(MIN_SCALE)
      setTranslate({ x: 0, y: 0 })
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.mobileZoomContainer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={scale === 1 ? onClick : undefined}
      style={{ touchAction: scale > 1 ? 'none' : 'pan-y' }}
    >
      <img
        src={src}
        alt={alt}
        className={styles.mobileImg}
        onError={onError}
        draggable={false}
        style={{
          transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          transformOrigin: `${origin.x}% ${origin.y}%`,
          transition: isPinching ? 'none' : 'transform 0.2s ease',
          willChange: 'transform',
        }}
      />
      {scale > 1 && (
        <button
          className={styles.resetZoomBtn}
          onTouchEnd={(e) => { e.stopPropagation(); setScale(1); setTranslate({ x: 0, y: 0 }) }}
          onClick={() => { setScale(1); setTranslate({ x: 0, y: 0 }) }}
          aria-label="Reset zoom"
        >
          ✕ Reset
        </button>
      )}
      {scale === 1 && (
        <div className={styles.zoomHint}>
          <span>⊕ Pinch or double-tap to zoom</span>
        </div>
      )}
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function ImageZoom({ src, alt, onError, onClick }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 1024px)').matches)
    check()
    const mq = window.matchMedia('(max-width: 1024px)')
    mq.addEventListener('change', check)
    return () => mq.removeEventListener('change', check)
  }, [])

  return isMobile
    ? <MobileZoom src={src} alt={alt} onError={onError} onClick={onClick} />
    : <DesktopZoom src={src} alt={alt} onError={onError} onClick={onClick} />
}
