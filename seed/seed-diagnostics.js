// seed/seed-diagnostics.js
// Ye script tumhari X-Ray, Ultrasound aur Lab Test list MongoDB mein daal deti hai.
// Chalane ka tarika:
//   node seed/seed-diagnostics.js
// (doctors wali seed.js se alag hai — dono ek ek baar chalani hain)

require('dotenv').config();
const mongoose = require('mongoose');
const Diagnostic = require('../models/Diagnostic');

const MONGODB_URI = process.env.MONGODB_URI;

const xray = [
  {name:"Hand X-Ray", price:750},
  {name:"Wrist X-Ray", price:750},
  {name:"Knee Joint X-Ray (1 View)", price:1000},
  {name:"Knee Joint X-Ray (Both)", price:1500},
  {name:"Pelvic X-Ray", price:750},
  {name:"Foot X-Ray", price:750},
  {name:"Ankle X-Ray", price:750},
  {name:"Leg (Tib/Fib) Oblique X-Ray", price:1000},
  {name:"Hip Joint X-Ray", price:1000},
  {name:"Shoulder X-Ray (1 View)", price:1000},
  {name:"Chest X-Ray (PA View)", price:750},
  {name:"Chest X-Ray (AP Lateral)", price:1000},
  {name:"OPG (Orthopantomogram)", price:750},
  {name:"Arm X-Ray", price:750},
  {name:"Elbow X-Ray", price:750},
  {name:"Abdomen / Spine X-Ray", price:750},
  {name:"Erect Abdomen X-Ray", price:750},
].map(t => ({ ...t, type: 'xray', available: true }));

const ultrasoundRaw = [
  {name:"Appendix / RIF (Right Iliac Fossa) U/S", price:1000},
  {name:"Follicular Study", price:1000},
  {name:"FWB U/S", price:750},
  {name:"Gall Bladder U/S", price:700},
  {name:"Urinary Bladder U/S", price:700},
  {name:"Urinary Bladder (Pre & Post Void) Residual", price:1250},
  {name:"KUB + (Pre & Post Void) Residual", price:1300},
  {name:"KUB + Pelvis", price:1500},
  {name:"Liver U/S (Grey Scale)", price:700},
  {name:"Liver + Gall Bladder U/S", price:1250},
  {name:"Lower Abdomen / Pelvis U/S", price:700},
  {name:"Chest U/S for Effusion", price:1300},
  {name:"Pancreas & Spleen U/S", price:1250},
  {name:"Prostate + Pre & Post Void U/S", price:1500},
  {name:"TVS Pelvis", price:1500},
  {name:"Pelvis U/S", price:750},
  {name:"Whole Abdomen U/S", price:1050},
  {name:"Abdomen + Pelvis U/S", price:1500},
  {name:"Thyroid Scan (Doppler)", price:1500, category:"Special"},
  {name:"FWB Anomaly Scan", price:1500, category:"Special"},
  {name:"Pancreas U/S", price:700},
  {name:"Spleen U/S", price:700},
  {name:"Breast (Both) U/S", price:1300, category:"Special"},
  {name:"Brain U/S", price:2500},
  {name:"Breast (Single) U/S", price:700},
  {name:"Abdomen for Collection U/S", price:1200},
  {name:"Guided Biopsy U/S", price:4000},
  {name:"Guided Therapeutic Tap U/S", price:5000},
  {name:"Joint U/S for Effusion", price:1500},
  {name:"Kidney (KUB) U/S", price:1300},
  {name:"Prostate Trans-Rectal (TRUS) U/S", price:2000},
  {name:"Prostate + Residual Urine U/S", price:1250},
  {name:"Portable U/S", price:2000},
  {name:"Single Organ U/S (Grey Scale)", price:700},
  {name:"Swelling U/S (Any Body Organ)", price:1500},
  {name:"Thyroid U/S (Grey Scale)", price:1000},
  {name:"Upper Abdomen U/S", price:700},
  {name:"Doppler (Single Organ)", price:1500},
  {name:"Doppler Left Upper Limb Artery", price:2050},
  {name:"Doppler Left Lower Limb Artery", price:2050},
  {name:"Doppler Right Upper Limb Artery", price:2050},
  {name:"Doppler Right Lower Limb Artery", price:2050},
  {name:"Doppler Right Upper Limb Vein", price:2050},
  {name:"Doppler Right Lower Limb Vein", price:2050},
  {name:"Doppler Left Upper Limb Vein", price:2050},
  {name:"Doppler Left Lower Limb Vein", price:2050},
  {name:"Doppler Both Lower Limb Arteries", price:4050},
  {name:"Doppler Both Upper Limb Arteries", price:4050},
  {name:"Doppler Carotid Arteries", price:3000},
  {name:"Doppler FWB / OBS Bio-Physical Profile", price:2000},
  {name:"Doppler FWB for IUGR / Placenta", price:2350},
  {name:"Doppler Penis (Without Caverject Inj.)", price:2350},
  {name:"Doppler Renal Arteries", price:1500},
  {name:"Varicocele Doppler U/S", price:4050},
  {name:"Kidney (Single) U/S", price:2000},
  {name:"Kidney (Both) U/S", price:700},
  {name:"Doppler Portal Veins", price:1300},
  {name:"Single Eye B-Scan", price:2000},
];
const ultrasound = ultrasoundRaw.map(t => ({
  ...t,
  type: 'ultrasound',
  category: t.category || 'Routine',
  sampleReporting: 'Same day',
  available: true,
}));

const labTests = [
  {name:"CBC (Complete Blood Count)", price:295, discountPrice:250, onOffer:true},
  {name:"CBC + ESR", price:500, discountPrice:350, onOffer:true},
  {name:"Creatinine", price:295, discountPrice:200, onOffer:true},
  {name:"Electrolytes", price:475, discountPrice:250, onOffer:true},
  {name:"Uric Acid", price:350, discountPrice:200, onOffer:true},
  {name:"Serum Urea", price:370, discountPrice:250, onOffer:true},
].map(t => ({ ...t, type: 'labTest', available: true }));

async function run() {
  if (!MONGODB_URI) {
    console.error('❌ .env file mein MONGODB_URI nahi mila.');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB se connect ho gaya');

  await Diagnostic.deleteMany({});
  console.log('🗑️  Purane diagnostics clear kar diye (agar the)');

  const all = [...xray, ...ultrasound, ...labTests];
  await Diagnostic.insertMany(all);
  console.log(`✅ ${xray.length} X-Ray + ${ultrasound.length} Ultrasound + ${labTests.length} Lab Tests MongoDB mein daal diye gaye`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seeding fail ho gayi:', err);
  process.exit(1);
});
