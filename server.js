// ══════════════════════════════════════════
// KOKOON — server.js
// ══════════════════════════════════════════
const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const path      = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ── CORS ─────────────────────────────────
// Accept any localhost / 127.0.0.1 port (Live Server, Vite, etc.)
// Accept file:// origins (Origin header is "null")
// Accept the production FRONTEND_URL from .env
// FIX: expanded CORS — allows localhost any port, file://, and multiple FRONTEND_URLs
const _allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);           // curl, Postman, same-origin
    if (origin === 'null') return cb(null, true); // file:// double-click
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
    if (_allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/reviews',  require('./routes/reviewRoutes'));
app.use('/api/upload',   require('./routes/uploadRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/config',   require('./routes/authRoutes')); // legacy emailjs-config compat

// ── Health check ──────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Kokoon API running', timestamp: new Date().toISOString() });
});

// ── Global JSON error handler ─────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || err.statusCode || 500).json({ message: err.message || 'Server error' });
});

// ── 404 fallback (always JSON) ────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🕊  Kokoon API listening on http://localhost:${PORT}`));
