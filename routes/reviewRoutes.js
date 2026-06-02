// ══════════════════════════════════════════
// KOKOON — routes/reviewRoutes.js
// FIX: moved GET / (admin) ABOVE GET /:productId
//      so the wildcard param doesn't swallow it.
// ══════════════════════════════════════════
const express = require('express');
const router  = express.Router();
const { Review } = require('../models/OrderReviewUser');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/reviews — all reviews (admin)
// ⚠ MUST be before /:productId or Express matches it as a param
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/reviews/:productId — approved reviews for a product (public)
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId, approved: true })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/reviews — submit a review (public)
router.post('/', async (req, res) => {
  try {
    const { productId, name, email, rating, title, comment } = req.body;
    if (!productId || !name || !rating || !comment) {
      return res.status(400).json({ message: 'productId, name, rating and comment are required' });
    }
    const review = await Review.create({ productId, name, email, rating, title, comment });
    res.status(201).json(review);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/reviews/:id — approve / reject (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/reviews/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
