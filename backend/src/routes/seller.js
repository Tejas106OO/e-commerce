const express = require('express')
const { requireAuth, requireRole } = require('../middleware/auth')
const { uploadProduct } = require('../config/cloudinary')
const ctrl = require('../controllers/sellerController')
const router = express.Router()

router.use(requireAuth, requireRole('seller', 'admin'))
router.get('/products',      ctrl.getSellerProducts)
router.get('/stats',         ctrl.getSellerStats)
router.post('/products',     uploadProduct.array('images', 6), ctrl.createProduct)
router.patch('/products/:id',ctrl.updateProduct)
router.get('/orders',        ctrl.getSellerOrders)

module.exports = router
