// ══════════════════════════════════════════
// KOKOON — routes/authRoutes.js
// ══════════════════════════════════════════
const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const { User } = require('../models/OrderReviewUser');
const { protect } = require('../middleware/authMiddleware');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: role || 'customer' });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/auth/profile (protected)
router.get('/profile', protect, async (req, res) => {
  res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role });
});

// PUT /api/auth/profile (protected)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (name)  user.name  = name;
    if (email) user.email = email;
    if (password) user.password = password;
    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/config/emailjs — send emailjs config to frontend
router.get('/emailjs-config', (req, res) => {
  res.json({
    publicKey:          process.env.EMAILJS_PUBLIC_KEY,
    serviceId:          process.env.EMAILJS_SERVICE_ID,
    templateId:         process.env.EMAILJS_TEMPLATE_ORDER,
    trackingTemplateId: process.env.EMAILJS_TEMPLATE_TRACKING,
  });
});

module.exports = router;
