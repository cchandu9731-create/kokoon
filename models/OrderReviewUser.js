// ══════════════════════════════════════════
// KOKOON — models/Order.js
// ══════════════════════════════════════════
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: String, name: String, category: String,
  price: Number, qty: Number, color: String, size: String, img: String,
});

const shippingSchema = new mongoose.Schema({
  status: { type: String, default: 'pending' },
  carrier: String, tracking: String, trackingUrl: String,
  note: String, eta: String,
});

const orderSchema = new mongoose.Schema({
  orderId:    { type: String, unique: true },
  email:      { type: String, required: true },
  name:       { type: String, default: 'Guest' },
  address:    { type: String, default: '' },
  city:       { type: String, default: '' },
  address:    { type: String, default: '' },
  items:      [orderItemSchema],
  subtotal:   Number,
  total:      { type: Number, required: true },
  discount:   { type: Number, default: 0 },
  status:     { type: String, default: 'Confirmed' },
  paymentId:  { type: String, default: '' },
  paymentMethod: { type: String, default: 'razorpay' },
  shipping:   { type: shippingSchema, default: () => ({}) },
}, { timestamps: true });

// Auto-generate orderId
orderSchema.pre('save', function(next) {
  if (!this.orderId) this.orderId = 'KOK-' + Date.now().toString(36).toUpperCase();
  next();
});

// ══════════════════════════════════════════
// KOKOON — models/Review.js
// ══════════════════════════════════════════
const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name:      { type: String, required: true },
  email:     { type: String, default: '' },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  title:     { type: String, default: '' },
  comment:   { type: String, required: true },
  verified:  { type: Boolean, default: false },
  approved:  { type: Boolean, default: true },
}, { timestamps: true });

// ══════════════════════════════════════════
// KOKOON — models/User.js
// ══════════════════════════════════════════
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role:     { type: String, enum: ['admin','customer'], default: 'customer' },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = {
  Order:   mongoose.model('Order', orderSchema),
  Review:  mongoose.model('Review', reviewSchema),
  User:    mongoose.model('User', userSchema),
};
