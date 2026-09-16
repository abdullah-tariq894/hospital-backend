// lib/cors.js
// Browser (chatbot frontend) dusre domain se API call karta hai, is liye
// CORS headers zaroori hain. Warna browser request block kar deta hai aur
// frontend par "Failed to fetch" aata hai.

function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  // preflight request (browser khud bhejta hai PATCH/POST se pehle)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // handler ko aage nahi chalana
  }
  return false;
}

module.exports = applyCors;
