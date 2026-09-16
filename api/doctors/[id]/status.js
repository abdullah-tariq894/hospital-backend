// api/doctors/[id]/status.js  ->  URL: /api/doctors/:id/status
// PATCH = sirf "present" / "absent" status badalna
// Admin panel mein jab receptionist "Mark Present" button dabayega,
// yahi endpoint call hoga aur MongoDB mein turant update ho jayega.

const applyCors = require('../../../lib/cors');
const connectDB = require('../../../lib/mongodb');
const Doctor = require('../../../models/Doctor');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return; // CORS + preflight

  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ error: 'Database connect nahi ho saka', details: err.message });
  }
  const { id } = req.query;

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ error: `Method ${req.method} allowed nahi hai` });
  }

  const { status } = req.body; // "present" ya "absent"

  if (!['present', 'absent'].includes(status)) {
    return res.status(400).json({ error: 'status sirf "present" ya "absent" ho sakta hai' });
  }

  try {
    const updated = await Doctor.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Doctor nahi mila' });
    return res.status(200).json({ doctor: updated });
  } catch (err) {
    return res.status(400).json({ error: 'Status update nahi ho saka', details: err.message });
  }
};
