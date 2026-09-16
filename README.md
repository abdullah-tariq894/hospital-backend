# My City Hospital — MongoDB Backend Setup

Ye backend tumhari chatbot HTML file ke `HOSPITAL_DATA.doctors` (hardcoded array) ki jagah
MongoDB se live data dega, aur ek admin panel (`admin.html`) dega jisse receptionist
doctor ko "Present" / "Absent" mark kar sake.

## 1. MongoDB Atlas banao (free hai)

1. https://www.mongodb.com/cloud/atlas/register pe account banao
2. Free "M0" cluster create karo
3. Database Access mein ek user banao (username/password yaad rakhna)
4. Network Access mein "Allow access from anywhere" (0.0.0.0/0) add karo
5. "Connect" -> "Drivers" -> connection string copy karo, kuch aisi dikhegi:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## 2. Local pe test karna (optional lekin recommended)

```bash
cd hospital-backend
npm install
cp .env.example .env
# .env file kholo aur apni real MongoDB_URI daalo
npm run seed
npm run seed:diagnostics
```

`npm run seed` chalane se tumhari purani 55 doctors ki list MongoDB mein chali jayegi.
`npm run seed:diagnostics` chalane se X-Ray (17), Ultrasound (58) aur Lab Tests (6) —
sab MongoDB mein chale jayenge.

## 3. Vercel pe deploy karna

1. Is `hospital-backend` folder ko GitHub repo bana ke push karo
2. Vercel.com pe jao -> "Add New Project" -> apna repo select karo
3. Deploy se pehle **Environment Variables** mein jaake add karo:
   - Key: `MONGODB_URI`
   - Value: apni connection string (jo `.env` mein daali thi)
4. Deploy dabao

Deploy hone ke baad tumhare paas 2 cheezein honge:
- `https://tumhara-project.vercel.app/api/doctors` (GET/POST)
- `https://tumhara-project.vercel.app/api/doctors/<id>` (PUT/DELETE)
- `https://tumhara-project.vercel.app/api/doctors/<id>/status` (PATCH — present/absent)
- `https://tumhara-project.vercel.app/api/diagnostics` (GET → `{xray:[], ultrasound:[], labTests:[]}`)
- `https://tumhara-project.vercel.app/api/diagnostics?type=xray` (sirf ek type)
- `https://tumhara-project.vercel.app/api/diagnostics/<id>` (PUT/DELETE)
- `https://tumhara-project.vercel.app/admin.html` (reception panel)

## 4. Apni chatbot HTML file ko connect karna

Tumhari asal chatbot file mein 2 cheezein badalni hain:

### (a) `HOSPITAL_DATA.doctors` ko empty rakho
Jahan `doctors: [ ... 60+ doc(...) entries ... ]` likha hai, use khali kar do:
```js
doctors: [],   // ab ye API se aayega
```
(Baaki — departments, diagnostics, otherServices — waise hi rehne do, wo abhi static rahenge)

### (b) Ye loader function add karo (file ke upar, HOSPITAL_DATA ke baad)
```js
const API_BASE = "https://tumhara-project.vercel.app"; // apna Vercel URL yahan daalo

async function loadDoctorsFromAPI(setVersion){
  try{
    const res = await fetch(`${API_BASE}/api/doctors`);
    const data = await res.json();
    HOSPITAL_DATA.doctors = data.doctors; // isi array ko live refresh karta hai
    if(setVersion) setVersion(v => v + 1); // React ko batao ke re-render karo
  }catch(err){
    console.error("Doctors load nahi ho sake:", err);
  }
}
```

### (c) Apne main App component ke andar (jahan `useState`, `useEffect` use ho rahe hain)
```jsx
const [doctorsVersion, setDoctorsVersion] = useState(0);

useEffect(() => {
  loadDoctorsFromAPI(setDoctorsVersion);           // pehli baar load
  const interval = setInterval(() => {
    loadDoctorsFromAPI(setDoctorsVersion);         // har 8 second refresh
  }, 8000);
  return () => clearInterval(interval);
}, []);
```

Bas itna karne se:
- Doctors ab MongoDB se aayenge (hardcoded nahi)
- `findBestDoctor`, `findDeptFromAliases`, autocomplete — sab waisi hi kaam karengi
  kyunke wo `HOSPITAL_DATA.doctors` ko hi read karti hain (bas ab uska data live hai)
- Jab admin panel se koi doctor "Present" mark hoga, 8 second ke andar chatbot mein
  bhi wo "Present" dikhne lag jayega — bina refresh kiye

### (d) `computeDoctorStatus` mein ek chhoti si tabdeeli
Tumhari file mein ye line hai:
```js
const liveStatus = doctor.onLeave ? 'on_leave' : (presenceMap[doctor.id] || 'absent');
```
Isko is se replace karo (kyunke ab status khud doctor object ke andar aa raha hai API se):
```js
const liveStatus = doctor.onLeave ? 'on_leave' : (doctor.status || 'absent');
```
Aur jahan bhi `presenceMap` App component mein banaya ja raha ho (agar wo random/simulate ho raha tha), ab uski zarurat nahi — status seedha `doctor.status` se aa raha hai.

---

**Note:** Maine tumhari poori original file (chat UI, message handling wala hissa) nahi dekha
tha — wo hissa truncate ho gaya tha jo tumne bheja. Agar poori file share kar do (ya upload kar do),
to main ye saari tabdeeliyan seedha usi file mein kar ke tumhein final ready-to-deploy file de dunga.
