export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function getDiscountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export function truncateText(text, maxLength = 80) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function generateOrderId() {
  const prefix = 'LX'
  const year = new Date().getFullYear()
  const num = Math.floor(Math.random() * 90000) + 10000
  return `${prefix}-${year}-${num}`
}

export function getDeliveryDate(days = 5) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
