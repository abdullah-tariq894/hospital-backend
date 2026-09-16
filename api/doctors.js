// api/doctors.js  ->  URL: /api/doctors
// GET  = sab doctors laana (chatbot ye call karega)
// POST = naya doctor add karna (admin panel se)

const applyCors = require('../lib/cors');
const connectDB = require('../lib/mongodb');
const Doctor = require('../models/Doctor');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return; // CORS + preflight

  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ error: 'Database connect nahi ho saka', details: err.message });
  }

  if (req.method === 'GET') {
    try {
      const doctors = await Doctor.find({}).lean();
      // frontend ko id string chahiye (tumhare purane doc-001 jaisa format nahi,
      // MongoDB ki _id use hogi — chatbot code isse "id" field se hi kaam chalayega)
      const formatted = doctors.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        degrees: d.degrees,
        specialization: d.specialization,
        department: d.department,
        fee: d.fee,
        schedule: d.schedule,
        onLeave: d.onLeave,
        notes: d.notes,
        status: d.status, // "present" | "absent"
      }));
      return res.status(200).json({ doctors: formatted });
    } catch (err) {
      return res.status(500).json({ error: 'Doctors fetch nahi ho sake', details: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const newDoctor = await Doctor.create(req.body);
      return res.status(201).json({ doctor: newDoctor });
    } catch (err) {
      return res.status(400).json({ error: 'Doctor add nahi ho saka', details: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} allowed nahi hai` });
};
