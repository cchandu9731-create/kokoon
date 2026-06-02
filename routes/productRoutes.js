// ══════════════════════════════════════════
// KOKOON — routes/productRoutes.js
// ══════════════════════════════════════════
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, sort, limit = 50 } = req.query;
    let query = {};
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    let sortObj = {};
    if (sort === 'price-asc') sortObj = { price: 1 };
    else if (sort === 'price-desc') sortObj = { price: -1 };
    else if (sort === 'new') sortObj = { createdAt: -1 };
    else sortObj = { featured: -1, createdAt: -1 };

    const products = await Product.find(query).sort(sortObj).limit(parseInt(limit));
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/products (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/products/:id (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/products/:id (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
