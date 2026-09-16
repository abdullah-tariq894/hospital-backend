// seed/seed.js
// Ye script tumhari OLD hardcoded HOSPITAL_DATA.doctors list MongoDB mein daal deti hai.
// Chalane ka tarika (terminal mein):
//   node seed/seed.js
// Sirf EK BAAR chalana hai. Dobara chalaoge to purane doctors delete karke
// dobara insert kar degi (taake duplicate na banein) — neeche dekho.

require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

const MONGODB_URI = process.env.MONGODB_URI;

// ---- same helper functions jo tumhari original file mein thi ----
function sched(days, start, end) {
  const o = {};
  days.forEach((d) => {
    o[d] = (o[d] || []).concat([{ start, end }]);
  });
  return o;
}
function mergeSched(...objs) {
  const out = {};
  objs.forEach((o) =>
    Object.keys(o).forEach((d) => {
      out[d] = (out[d] || []).concat(o[d]);
    })
  );
  return out;
}
function doc(name, degrees, specialization, department, scheduleObj, notes) {
  return {
    name,
    degrees,
    specialization,
    department,
    fee: 1000,
    schedule: scheduleObj,
    onLeave: !!(notes && notes.onLeave),
    notes: notes && notes.text ? notes.text : null,
    status: 'absent', // sab doctors default "absent" se start hote hain
  };
}

// ---- tumhari poori doctor list (waisi hi jaisi original file mein thi) ----
const doctors = [
  doc("Dr. Musarrat Ayaz", ["MBBS","FCPS (Family Medicine)"], "Family Medicine", "General Physician & Diabetologist",
    mergeSched(sched(['mon','wed'],'15:00','17:00'), sched(['fri'],'17:00','19:00'), sched(['sun'],'18:00','19:00'))),
  doc("Dr. Jetender Maheshwari", ["MBBS","FCPS"], "General Medicine", "General Physician & Diabetologist",
    sched(['sun'],'16:00','18:00')),
  doc("Dr. Hina Murad", ["MBBS","FCPS (Internal Medicine)"], "Internal Medicine", "General Physician & Diabetologist",
    sched(['mon','wed','sat'],'17:00','19:00')),
  doc("Dr. Riazuddin Khanzada", ["MBBS","FCPS (Family Medicine)","D.Diabetology (CFHP)"], "Family Medicine & Diabetology", "General Physician & Diabetologist",
    sched(['mon','thu'],'18:00','19:00')),
  doc("Dr. Arshia Arif", ["MBBS","MRCGP(int)","MCPS (Family Medicine)"], "Family Medicine", "General Physician & Diabetologist",
    sched(['tue','sat'],'17:00','19:00')),
  doc("Dr. Mamoon Zubair", ["MBBS","FCPS"], "General Medicine", "General Physician & Diabetologist",
    {}, {onLeave:true, text:"Currently on leave."}),
  doc("Dr. Sandeep Kumar", ["MBBS","FCPS"], "General Medicine", "General Physician & Diabetologist",
    mergeSched(sched(['mon','wed'],'09:00','10:00'), sched(['tue','sat'],'20:00','22:00'))),
  doc("Dr. Hamid Ali Syed", ["MBBS","FCPS"], "General Medicine", "General Physician & Diabetologist",
    sched(['mon','wed','fri'],'20:00','22:00')),
  doc("Prof. Dr. Kamal Ahmed", ["MBBS","FCPS"], "General Medicine", "General Physician & Diabetologist",
    mergeSched(sched(['wed'],'21:00','23:00'), sched(['sat'],'22:00','23:59')), {text:"By pre-appointment only."}),

  doc("Dr. Kashif Murtaza", ["MBBS","FCPS"], "Orthopaedic Surgery", "Orthopaedic Surgeon",
    sched(['mon','wed','fri'],'16:00','17:30')),
  doc("Dr. Shahzaib Soomro", ["MBBS","FCPS"], "Orthopaedic Surgery", "Orthopaedic Surgeon",
    sched(['tue','thu','sat'],'17:00','19:00')),
  doc("Dr. Saddam Mazar", ["MBBS","MS","MD"], "Orthopaedic Surgery", "Orthopaedic Surgeon",
    mergeSched(sched(['mon'],'19:00','21:00'), sched(['sat'],'19:00','20:00'))),
  doc("Dr. Muhammad Asif Aziz", ["MBBS","MS"], "Orthopaedic Surgery", "Orthopaedic Surgeon",
    mergeSched(sched(['mon'],'21:00','22:00'), sched(['wed'],'19:00','21:00'))),
  doc("Dr. Masroor Usmani", ["MBBS","Dip. Ortho"], "Orthopaedic Surgery", "Orthopaedic Surgeon",
    sched(['tue','thu','fri','sat'],'19:30','21:00')),

  doc("Dr. Hajira Mukarram", ["MBBS","MCPS"], "Dermatology", "Dermatologist",
    mergeSched(sched(['mon','wed'],'16:30','17:30'), sched(['tue'],'12:00','13:00'))),
  doc("Dr. Shayana Rukhsar", ["MBBS","FCPS (Dermatology)"], "Dermatology", "Dermatologist",
    mergeSched(sched(['tue'],'15:00','17:00'), sched(['fri'],'15:00','16:30'))),
  doc("Dr. Junaid Rabbani", ["MBBS","D.Derm"], "Dermatology", "Dermatologist",
    sched(['tue','thu','sat'],'17:00','18:00')),

  doc("Dr. Uneza", ["MBBS","MCPS"], "Gynaecology (ER Department)", "Gynaecologist",
    sched(['sun','mon','tue','wed','thu','fri'],'11:00','13:00')),
  doc("Dr. Hina Memon", ["MBBS","FCPS"], "Gynaecology", "Gynaecologist",
    sched(['wed','thu','sat'],'14:00','16:00')),
  doc("Dr. Tahira Jabeen", ["MBBS","FCPS"], "Gynaecology", "Gynaecologist",
    sched(['mon','thu','sat'],'16:30','17:30')),
  doc("Dr. Reeta Mukesh", ["MBBS","MCPS"], "Gynaecology", "Gynaecologist",
    sched(['fri'],'16:30','18:00')),
  doc("Dr. Sheema Izzat", ["MBBS","FCPS"], "Gynaecology", "Gynaecologist",
    sched(['tue','thu'],'17:30','18:30'), {text:"By pre-appointment only."}),
  doc("Dr. Ghulam Sughra Bhellar", ["MBBS","FCPS"], "Gynaecology", "Gynaecologist",
    sched(['wed','fri'],'19:30','21:30')),
  doc("Dr. Ambreen Naz Khan", ["MBBS","CHPE"], "Gynaecology", "Gynaecologist",
    sched(['mon','sat'],'20:00','21:00')),
  doc("Dr. Sumaiya Aziz", ["MBBS","FCPS"], "Gynaecology", "Gynaecologist",
    sched(['tue','thu'],'20:30','22:00')),

  doc("Dr. Abdul Muqeet", ["MBBS","FCPS"], "General Surgery", "General Surgeon",
    mergeSched(sched(['tue'],'16:00','17:30'), sched(['fri'],'21:00','22:00'))),
  doc("Dr. Syed Ali Haider Rizvi", ["MBBS","FCPS"], "General Surgery", "General Surgeon",
    sched(['thu','sat'],'15:00','16:30')),
  doc("Dr. Javeria Munir", ["MBBS","FCPS"], "General Surgery", "General Surgeon",
    sched(['thu'],'17:30','19:30'), {text:"By pre-appointment only."}),
  doc("Dr. Muhammad Ali Edhi", ["MBBS","MRCS (Surg)","MRAH"], "General Surgery", "General Surgeon",
    mergeSched(sched(['wed'],'21:30','23:00'), sched(['fri'],'22:00','23:59'))),

  doc("Dr. Azaan Abdullah Qureshi", ["MBBS","MCPS"], "Psychiatry", "Psychiatrist",
    sched(['tue','thu'],'15:00','17:00')),

  doc("Dr. Nida Amir", ["BDS","RDS"], "Dental Surgery", "Dental Surgeon",
    sched(['mon','wed','thu'],'10:00','12:00')),
  doc("Dr. Iqra Shehzad", ["BDS","RDS"], "Dental Surgery", "Dental Surgeon",
    mergeSched(sched(['tue','thu','sat'],'12:30','14:30'), sched(['sun'],'17:00','20:00'))),
  doc("Dr. Aisha Waseem", ["BDS","RDS"], "Dental Surgery", "Dental Surgeon",
    sched(['mon','wed','thu','fri'],'16:00','18:30')),
  doc("Dr. Huma Azmat", ["BDS","RDS","MPH","CHPE"], "Dental Surgery", "Dental Surgeon",
    mergeSched(sched(['tue'],'16:00','18:00'), sched(['sat'],'15:00','18:00'), sched(['sun'],'18:00','22:00'))),
  doc("Dr. Hassan Bin Tariq", ["BDS","RDS (Dow University)"], "Dental Surgery", "Dental Surgeon",
    mergeSched(sched(['mon','wed','fri'],'18:30','21:30'), sched(['sat'],'10:30','12:30'))),
  doc("Dr. Ayesha Khurram", ["BDS","RDS"], "Dental Surgery", "Dental Surgeon",
    sched(['tue','thu','sat'],'19:00','22:00')),

  doc("Dr. Hira Zaidi", ["MBBS","FCPS (Dow University)"], "ENT Surgery", "ENT Surgeon",
    sched(['mon','wed','fri'],'17:00','18:00')),
  doc("Dr. Nand Lal", ["MBBS","DLO"], "ENT Surgery", "ENT Surgeon",
    sched(['tue','fri'],'17:00','19:00')),
  doc("Dr. Komal Shamim", ["MBBS","FCPS"], "ENT Surgery", "ENT Surgeon",
    sched(['sun','mon','thu'],'18:00','20:00')),

  doc("Dr. Arsala Mushtaq", ["FCPS","MBBS"], "Urology", "Urologist",
    sched(['mon','wed','fri'],'17:00','19:00')),

  doc("Dr. Gulnaz Azam", ["DHMS","RHMP"], "Burns & Wound Care", "Burns Specialist",
    sched(['mon','wed','fri'],'19:00','20:30')),

  doc("Dr. Syeda Sabika Zehra Zaidi", ["Master in Audiology & Speech Therapy"], "Speech Therapy", "Speech Therapist",
    sched(['tue','thu','sat'],'16:00','18:00')),

  doc("Dr. Ali Jaan", ["MBBS","DCN","FCPS"], "Neurophysiology", "Neurophysician",
    sched(['mon','wed','fri'],'16:30','18:00')),
  doc("Dr. Muhammad Nawaz", ["MBBS","FCPS"], "Neurophysiology", "Neurophysician",
    sched(['tue','thu','sat'],'16:00','18:00')),

  doc("Dr. Syed Fahad Zahoor", ["MBBS","FCPS"], "Plastic Surgery", "Plastic Surgeon",
    sched(['tue','thu'],'17:00','18:00'), {text:"By pre-appointment only."}),

  doc("Dr. Sabir Ali", ["MBBS","FCPS (Gastro)"], "Gastroenterology", "Gastroenterologist",
    sched(['mon','wed','fri','sat'],'20:30','21:30')),

  doc("Dr. Farah Anum Jameel", ["MBBS","FCPS"], "Nephrology", "Nephrologist",
    sched(['thu'],'19:00','20:00')),

  doc("Dr. Abdul Saleem", ["MBBS","DCH","MCPS"], "Paediatrics", "Paediatrician",
    sched(['mon','tue','wed','thu','fri','sat'],'20:00','22:00')),
  doc("Dr. Lachman Das", ["MBBS","DCH"], "Paediatrics (ER Department)", "Paediatrician",
    mergeSched(sched(['tue','thu','fri'],'10:00','12:00'), sched(['sun'],'15:00','17:00'))),

  doc("Dr. Roshu Mal", ["MBBS","DTCD"], "Pulmonology", "Chest Specialist",
    mergeSched(sched(['tue'],'19:30','21:00'), sched(['fri'],'09:30','11:30'))),

  doc("Dr. Sher Muhammad", ["MBBS","FCPS"], "Cardiology", "Cardiologist",
    sched(['tue','thu'],'19:00','21:00'), {text:"By pre-appointment only."}),

  doc("Dr. Shazia Khan", ["MBBS","ARDMS (USA)"], "Diagnostic Ultrasound", "Ultrasound",
    mergeSched(sched(['mon','wed','sat'],'10:00','13:00'), sched(['fri'],'16:00','19:00'))),
  doc("Dr. Ayesha Faisal", ["MBBS","BSc (Physiology)","U/S Course"], "Diagnostic Ultrasound", "Ultrasound",
    sched(['mon','tue','wed','thu','sat'],'16:00','19:00')),
  doc("Dr. Junaid Azhar", ["U/S Course"], "Diagnostic Ultrasound", "Ultrasound",
    sched(['mon','tue','wed','thu','fri','sat'],'19:00','21:00')),
  doc("Dr. Aisha Farooq", ["MBBS","U/S Course"], "Diagnostic Ultrasound", "Ultrasound",
    mergeSched(sched(['mon','wed','sat'],'20:30','22:30'), sched(['tue','thu','fri'],'19:30','21:00'))),

  doc("Dr. Asma Khushnood", ["MBBS","Hijama Specialist"], "Hijama Therapy", "Female Hijama",
    sched(['mon','thu','sat'],'14:00','16:00')),
];

async function run() {
  if (!MONGODB_URI) {
    console.error('❌ .env file mein MONGODB_URI nahi mila. Pehle .env banao.');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB se connect ho gaya');

  await Doctor.deleteMany({}); // purana data hata ke fresh daal rahe hain
  console.log('🗑️  Purane doctors clear kar diye (agar the)');

  await Doctor.insertMany(doctors);
  console.log(`✅ ${doctors.length} doctors MongoDB mein daal diye gaye`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seeding fail ho gayi:', err);
  process.exit(1);
});
