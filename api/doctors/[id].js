// api/doctors/[id].js  ->  URL: /api/doctors/:id
// PUT    = doctor ki details edit karna (schedule, fee, department waghera)
// DELETE = doctor remove karna

const applyCors = require('../../lib/cors');
const connectDB = require('../../lib/mongodb');
const Doctor = require('../../models/Doctor');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return; // CORS + preflight

  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ error: 'Database connect nahi ho saka', details: err.message });
  }
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const updated = await Doctor.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updated) return res.status(404).json({ error: 'Doctor nahi mila' });
      return res.status(200).json({ doctor: updated });
    } catch (err) {
      return res.status(400).json({ error: 'Update nahi ho saka', details: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await Doctor.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Doctor nahi mila' });
      return res.status(200).json({ message: 'Doctor delete ho gaya' });
    } catch (err) {
      return res.status(400).json({ error: 'Delete nahi ho saka', details: err.message });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} allowed nahi hai` });
};
