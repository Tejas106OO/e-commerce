const express = require('express')
const { requireAuth } = require('../middleware/auth')
const { createOrder, getOrders, getOrderById } = require('../controllers/orderController')
const router = express.Router()

router.use(requireAuth)
router.post('/',    createOrder)
router.get('/',     getOrders)
router.get('/:id',  getOrderById)

module.exports = router
