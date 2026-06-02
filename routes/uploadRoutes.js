// ══════════════════════════════════════════
// KOKOON — routes/uploadRoutes.js
// Uses cloudinary v2 native stream (no multer-storage-cloudinary)
// ══════════════════════════════════════════
const express  = require('express');
const router   = express.Router();
const { upload, uploadToCloudinary, cloudinary } = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST /api/upload — single image (admin only)
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.url, public_id: result.public_id });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

// POST /api/upload/multiple — up to 5 images (admin only)
router.post('/multiple', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ message: 'No files uploaded' });
    const results = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer)));
    res.json({ images: results });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

// DELETE /api/upload/:public_id — delete from Cloudinary (admin only)
router.delete('/:public_id', protect, adminOnly, async (req, res) => {
  try {
    // public_id may contain '/' which gets URL-encoded — decode it
    const publicId = decodeURIComponent(req.params.public_id);
    const result = await cloudinary.uploader.destroy(publicId);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
