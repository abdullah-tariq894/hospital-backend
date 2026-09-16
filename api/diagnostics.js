// api/diagnostics.js  ->  URL: /api/diagnostics
// GET  = sab tests laana. Query se filter bhi ho sakta hai:
//        /api/diagnostics?type=xray
//        /api/diagnostics?type=ultrasound
//        /api/diagnostics?type=labTest
// POST = naya test add karna (admin panel se, future mein)

const applyCors = require('../lib/cors');
const connectDB = require('../lib/mongodb');
const Diagnostic = require('../models/Diagnostic');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return; // CORS + preflight

  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ error: 'Database connect nahi ho saka', details: err.message });
  }

  if (req.method === 'GET') {
    try {
      const filter = {};
      if (req.query.type) filter.type = req.query.type;

      const items = await Diagnostic.find(filter).lean();
      const formatted = items.map((t) => ({
        id: t._id.toString(),
        type: t.type,
        name: t.name,
        price: t.price,
        discountPrice: t.discountPrice,
        onOffer: t.onOffer,
        category: t.category,
        sampleReporting: t.sampleReporting,
        available: t.available,
      }));

      // frontend ko easy shape mein bhej rahe hain: { xray:[], ultrasound:[], labTests:[] }
      const grouped = {
        xray: formatted.filter((t) => t.type === 'xray'),
        ultrasound: formatted.filter((t) => t.type === 'ultrasound'),
        labTests: formatted.filter((t) => t.type === 'labTest'),
      };

      return res.status(200).json(req.query.type ? { items: formatted } : grouped);
    } catch (err) {
      return res.status(500).json({ error: 'Diagnostics fetch nahi ho sake', details: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const newItem = await Diagnostic.create(req.body);
      return res.status(201).json({ item: newItem });
    } catch (err) {
      return res.status(400).json({ error: 'Add nahi ho saka', details: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} allowed nahi hai` });
};
