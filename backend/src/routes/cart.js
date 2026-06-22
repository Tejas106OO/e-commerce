const express = require('express')
const { requireAuth } = require('../middleware/auth')
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController')
const router = express.Router()

router.use(requireAuth)
router.get('/',       getCart)
router.post('/',      addToCart)
router.patch('/:id',  updateCartItem)
router.delete('/:id', removeFromCart)
router.delete('/',    clearCart)

module.exports = router
