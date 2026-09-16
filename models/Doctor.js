// models/Doctor.js
// Ye schema tumhari original HOSPITAL_DATA.doctors ki fields ko match karta hai,
// bas 2 nayi fields add ki hain: "status" (live present/absent) aur timestamps.

const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema(
  {
    start: { type: String, required: true }, // "16:00"
    end: { type: String, required: true },   // "17:30"
  },
  { _id: false }
);

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    degrees: { type: [String], default: [] },
    specialization: { type: String, default: '' },
    department: { type: String, required: true },
    fee: { type: Number, default: 1000 },

    // schedule = { mon: [{start,end}], tue: [...], ... }
    schedule: { type: Object, default: {} },

    onLeave: { type: Boolean, default: false },
    notes: { type: String, default: null },

    // === YEH NAYI FIELD HAI — live presence ke liye ===
    // "present" | "absent"
    // Admin panel se yahi field PATCH hoti hai jab receptionist button dabata hai
    status: {
      type: String,
      enum: ['present', 'absent'],
      default: 'absent',
    },
  },
  { timestamps: true } // createdAt/updatedAt khud aa jayenge
);

module.exports =
  mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
