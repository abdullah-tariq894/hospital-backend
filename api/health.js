// api/health.js  ->  URL: /api/health
// Browser mein ye URL khol kar check karo ke database connect ho raha hai ya nahi.

const applyCors = require('../lib/cors');
const connectDB = require('../lib/mongodb');
const Doctor = require('../models/Doctor');
const Diagnostic = require('../models/Diagnostic');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return;

  try {
    await connectDB();
    const [doctors, diagnostics, present] = await Promise.all([
      Doctor.countDocuments({}),
      Diagnostic.countDocuments({}),
      Doctor.countDocuments({ status: 'present' }),
    ]);
    return res.status(200).json({
      ok: true,
      database: 'connected',
      doctors,
      presentDoctors: present,
      diagnostics,
      time: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      database: 'not connected',
      error: err.message,
      hint: 'MONGODB_URI check karo aur MongoDB Atlas -> Network Access mein 0.0.0.0/0 allow karo.',
    });
  }
};
