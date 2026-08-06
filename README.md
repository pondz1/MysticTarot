# 🔮 MysticVerse — ศาสตร์แห่งคำทำนายดิจิทัล (Tarot & Astrology)

**MysticVerse** คือเว็บแอปพลิเคชันดูดวงและศาสตร์คำทำนายครบวงจร (ไพ่ยิปซี/ไพ่ทาโรต์, เลขศาสตร์เบอร์มงคล/ทะเบียนรถ, ฮวงจุ้ยบ้าน, โหราศาสตร์ไทยกราฟชีวิต, และจักรราศี) ที่ขับเคลื่อนด้วย AI

---

## 🌟 ฟีเจอร์หลัก (Features)

1. **🔮 ดูดวงไพ่ยิปซี (Tarot Reading)**
   - โหมดการสุ่ม 6 รูปแบบ (Standard, Wheel, Cut, Fan, Compass, Jumping)
   - การทำนายเชิงลึกด้วย AI พร้อมวิเคราะห์ต่อยอด (Follow-up Chat)
   - ระบบบันทึกประวัติการดูดวงลง Local Storage & SQLite

2. **🔢 วิเคราะห์เลขศาสตร์ (Numerology & Phone Analysis)**
   - วิเคราะห์เบอร์โทรศัพท์, ทะเบียนรถ, บ้านเลขที่ และเลขบัตรประชาชน
   - คำนวณผลรวมความหมาย, คู่ตัวเลข (00-99), เกรดมงคล (A+ ถึง F) และกราฟคะแนนแต่ละด้าน

3. **🏡 ฮวงจุ้ยและทิศมงคล (Feng Shui Analysis)**
   - วิเคราะห์ผังบ้าน/ห้องทำงาน และทิศมงคลประจำปี

4. **📈 โหราศาสตร์ไทยกราฟชีวิต (Thai Life Graph)**
   - คำนวณเรือนชะตา 12 เรือนตามหลักโหราศาสตร์ไทย

5. **♈ ดูดวงราศีประจำวัน/เดือน (Zodiac Horoscope)**
   - ค้นหาราศีอัตโนมัติตามวันเกิด พร้อมวิเคราะห์ดวงชะตา

6. **⚙️ ระบบ AI & Credit System**
   - รองรับ **Credit Mode** (ฟรี 10 เครดิต/Session ผ่านเซิร์ฟเวอร์) และ **Custom Mode** (เชื่อมต่อตรงกับ API Key ส่วนตัว เช่น OpenAI, DeepSeek, Groq, OpenRouter, Ollama)

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, TypeScript (`strict`), Tailwind CSS v4, Framer Motion, Lucide Icons, Vitest
- **Backend**: Express 4, Node.js, `better-sqlite3`, `express-rate-limit`, CORS
- **Deployment & Infra**: Docker Multi-stage build, Nginx (Production static server), Coolify / Container Cloud

---

## 🚀 การติดตั้งและเรียกใช้งาน (Getting Started)

### Requirements
- Node.js >= 20.0.0
- npm >= 10.0.0

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-repo/tarot-cards.git
cd tarot-cards

# ติดตั้ง dependencies ทั้งหมด (Root, Client, Server)
npm run install:all
```

### 2. Environment Variables

สร้างไฟล์ `.env` ใน directory หลัก (หรือคัดลอกจาก `.env.example`):

```env
PORT=3001
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

### 3. Development Mode

```bash
# รันทั้ง Frontend (Port 5173) และ Backend (Port 3001) พร้อมกัน
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

### 4. Build & Production

```bash
# ตรวจสอบ TypeScript & Build สินค้าสำหรับ Production
npm run build

# ทดสอบรัน Server Production
npm run start:server
```

### 5. Running Tests

```bash
# รัน Unit Tests ด้วย Vitest
npm run test --prefix client
```

---

## 🐳 Docker Deployment

```bash
docker build -t mystic-verse .
docker run -p 3001:3001 -v $(pwd)/data:/app/server/data mystic-verse
```

---

## 📄 License

MIT License © 2026 MysticVerse Team
