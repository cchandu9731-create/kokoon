// ══════════════════════════════════════════
// KOKOON — config/cloudinary.js
// Uses cloudinary v2 natively (no multer-storage-cloudinary)
// multer buffers the file in memory; we stream it to Cloudinary.
// ══════════════════════════════════════════
const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store file in memory (buffer) — we stream it ourselves
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp','image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Upload a buffer to Cloudinary, return { url, public_id }
function uploadToCloudinary(buffer, folder = 'kokoon') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        allowed_formats: ['jpg','jpeg','png','webp'],
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

module.exports = { cloudinary, upload, uploadToCloudinary };
