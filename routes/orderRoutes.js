// ══════════════════════════════════════════
// KOKOON — routes/orderRoutes.js
// ══════════════════════════════════════════
const express = require('express');
const router  = express.Router();
const { Order } = require('../models/OrderReviewUser');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST /api/orders — create order (public, called after payment)
router.post('/', async (req, res) => {
  try {
    const { email, name, address, city, items, subtotal, total, discount, paymentId, paymentMethod } = req.body;
    if (!email || !items || !total) return res.status(400).json({ message: 'email, items and total are required' });

    const order = await Order.create({ email, name, address, city, items, subtotal, total, discount, paymentId, paymentMethod });
    res.status(201).json(order);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/orders — all orders (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/orders/:id — single order
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/orders/:id — update status / shipping (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/orders/lookup/:orderId — public lookup by orderId (no auth required)
// Returns limited fields for customer-facing order status page
router.get('/lookup/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: 'Order not found. Please check your order number.' });
    // Return all customer-relevant fields
    res.json({
      orderId:       order.orderId,
      name:          order.name,
      email:         order.email,
      status:        order.status,
      items:         order.items,
      subtotal:      order.subtotal,
      total:         order.total,
      discount:      order.discount,
      paymentMethod: order.paymentMethod,
      paymentId:     order.paymentId,
      shipping:      order.shipping,
      createdAt:     order.createdAt,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
