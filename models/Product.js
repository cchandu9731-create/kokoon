// ══════════════════════════════════════════
// KOKOON — models/Product.js
// ══════════════════════════════════════════
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  category:   { type: String, required: true, enum: ['Pillowcases','Eye Masks','Sleepwear','Bedding','Scrunchies'] },
  price:      { type: Number, required: true },
  origPrice:  { type: Number, default: 0 },
  description:{ type: String, default: '' },
  details:    { type: String, default: '' },
  images:     [{ type: String }],
  mainClass:  { type: String, default: 'c-champagne' },
  colors:     [{ type: String }],
  sizes:      [{ type: String }],
  badge:      { type: String, default: '' },
  rating:     { type: Number, default: 5.0 },
  reviews:    { type: Number, default: 0 },
  featured:   { type: Boolean, default: false },
  inventory:  { type: Number, default: 99 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
