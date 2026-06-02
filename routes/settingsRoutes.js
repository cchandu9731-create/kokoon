// ══════════════════════════════════════════
// KOKOON — routes/settingsRoutes.js
// GET/PUT any settings key (admin protected)
// Public GET for safe keys (razorpay public,
// emailjs public, banners, hero, announce)
// ══════════════════════════════════════════
const express  = require('express');
const router   = express.Router();
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Keys readable without auth (safe/public values only)
const PUBLIC_KEYS = [
  'emailjs', 'announcement', 'cat_banners',
  'hero_slides', 'about', 'razorpay_public'
];

// GET /api/settings/:key — public keys open, rest admin only
router.get('/:key', async (req, res) => {
  const { key } = req.params;
  const isPublic = PUBLIC_KEYS.includes(key);

  if (!isPublic) {
    // Require auth for sensitive keys like razorpay_secret
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ message: 'Not authorised' });
    }
  }

  try {
    const doc = await Settings.findOne({ key });
    if (!doc) return res.json({ key, value: null });
    res.json({ key, value: doc.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/settings/:key — admin only
router.put('/:key', protect, adminOnly, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ message: '`value` is required' });

  try {
    const doc = await Settings.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ key, value: doc.value });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/settings — list all keys (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const docs = await Settings.find({}, 'key updatedAt');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
