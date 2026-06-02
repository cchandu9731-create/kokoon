// ══════════════════════════════════════════
// KOKOON — seed-admin.js
// Run ONCE to create the admin user in MongoDB
// Usage: node seed-admin.js
// ══════════════════════════════════════════
require('dotenv').config();
const connectDB = require('./config/db');
const { User } = require('./models/OrderReviewUser');

(async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@kokoon.in';
  const pass  = process.env.ADMIN_PASSWORD || 'kokoon2026';

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`✅ Existing user updated to admin role: ${email}`);
    } else {
      console.log(`✅ Admin user already exists: ${email}`);
    }
  } else {
    await User.create({ name: 'Admin', email, password: pass, role: 'admin' });
    console.log(`✅ Admin user created: ${email}`);
  }

  process.exit(0);
})().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
