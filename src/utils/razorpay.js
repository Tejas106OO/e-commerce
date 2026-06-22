/**
 * Razorpay Frontend Integration Utility
 *
 * Usage:
 *   const rzp = await loadRazorpay()
 *   rzp.open(options)
 *
 * The RAZORPAY_KEY_ID is read from the Vite environment variable.
 * Set VITE_RAZORPAY_KEY_ID in your .env file.
 */

/**
 * Dynamically loads the Razorpay checkout script.
 * Returns a promise that resolves to the Razorpay constructor.
 */
export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload  = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.body.appendChild(script)
  })
}

/**
 * Opens the Razorpay checkout modal.
 *
 * @param {object} opts
 * @param {number} opts.amount           - Amount in paise (e.g. 9999 = ₹99.99)
 * @param {string} opts.orderId          - Razorpay order ID from backend
 * @param {string} opts.name             - Customer name
 * @param {string} opts.email            - Customer email
 * @param {string} opts.contact          - Customer phone
 * @param {function} opts.onSuccess      - Called with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 * @param {function} opts.onFailure      - Called with error message string
 */
export async function openRazorpayCheckout({ amount, orderId, name, email, contact, onSuccess, onFailure }) {
  try {
    const Razorpay = await loadRazorpayScript()

    const options = {
      key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount,
      currency:    'INR',
      order_id:    orderId,
      name:        'LUXE',
      description: 'Premium Shopping Experience',
      image:       '/logo.png',
      prefill: { name, email, contact },
      theme: {
        color: '#c9a84c'     // LUXE champagne gold
      },
      modal: {
        ondismiss: () => onFailure?.('Payment cancelled')
      },
      handler: (response) => {
        onSuccess?.(response)
      }
    }

    const rzp = new Razorpay(options)
    rzp.on('payment.failed', (response) => {
      onFailure?.(response.error.description || 'Payment failed')
    })
    rzp.open()
  } catch (err) {
    onFailure?.(err.message || 'Could not load payment gateway')
  }
}
