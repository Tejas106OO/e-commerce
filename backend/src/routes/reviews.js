const express = require('express')
const { requireAuth } = require('../middleware/auth')
const { createReview, getProductReviews, markHelpful } = require('../controllers/reviewController')
const router = express.Router()

router.get('/:productId',           getProductReviews)
router.post('/',        requireAuth, createReview)
router.patch('/:id/helpful', requireAuth, markHelpful)

module.exports = router
