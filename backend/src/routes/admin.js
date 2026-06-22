const express = require('express')
const { requireAuth, requireRole } = require('../middleware/auth')
const ctrl = require('../controllers/adminController')
const router = express.Router()

router.use(requireAuth, requireRole('admin'))
router.get('/stats',              ctrl.getDashboardStats)
router.get('/users',              ctrl.getUsers)
router.patch('/users/:id',        ctrl.updateUser)
router.get('/orders',             ctrl.getAllOrders)
router.patch('/orders/:id/status',ctrl.updateOrderStatus)
router.delete('/products/:id',    ctrl.deleteProduct)
router.patch('/reviews/:id',      ctrl.moderateReview)

module.exports = router
