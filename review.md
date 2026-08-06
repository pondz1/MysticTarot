# Code Review — MysticVerse

**วันที่รีวิว:** 2026-08-06
**Commit:** `d0c47af`
**Stack:** React 19 + Vite 8 + Tailwind 4 (client) / Express 4 + better-sqlite3 (server) / Docker + Coolify
**ขนาด:** ~13,400 บรรทัด TS/TSX, 6 feature modules, 0 tests

## ภาพรวม: 6.5/10

โครงสร้างดีเกินคาดสำหรับโปรเจ็คขนาดนี้ — feature-based architecture สะอาด, TypeScript ผ่าน `--strict` ได้ 0 error, code splitting ทำแล้ว, Docker layer caching ทำแล้ว **แต่** ฝั่ง security ของ backend มีช่องโหว่ที่ทำให้ API key ถูกใช้ฟรีได้ทั้งโลก

---

## P0 — ต้องแก้ก่อน deploy จริง

### 1. API key จริงถูก commit ลง git

**ไฟล์:** `.env.example:2`

```
OPENAI_API_KEY=sk-dce7f4d0…   # ← key จริง ไม่ใช่ placeholder
```

Key นี้อยู่ใน git history ตั้งแต่ commit `cda7ee4` การลบไฟล์ทิ้งไม่ช่วย เพราะยังอ่านย้อนหลังได้

**ต้องทำ:**
1. Revoke key นี้ที่ provider (9router) **ทันที** แล้วออกใหม่
2. แทนด้วย placeholder: `OPENAI_API_KEY=sk-your-key-here`

---

### 2. `/api/user/refill` เติมเครดิตได้ไม่จำกัด ไม่มี auth

**ไฟล์:** `server/src/routes/user.ts:17-25`

```bash
curl -X POST https://<host>/api/user/refill -H 'Content-Type: application/json' -d '{"amount":999999}'
```

ใครก็ยิงได้ ระบบเครดิตทั้งหมดจึงไม่มีผลบังคับใช้เลย รวมกับข้อ 3 = เปิด AI proxy ฟรีให้อินเทอร์เน็ต โดยจ่ายค่า token เอง

**แนวทางแก้:** ลบ endpoint นี้ออกจาก production หรือใส่ admin token / จำกัด amount

---

### 3. CORS เปิดหมด + ไม่มี rate limit

**ไฟล์:** `server/src/index.ts:16-17`

```ts
app.use(cors());                      // Access-Control-Allow-Origin: *
app.use(express.json({ limit: '10mb' }));
```

เว็บใดก็เรียก `/api/ai/completion` ได้ตรง ๆ ไม่มี auth, ไม่มี rate limit, `max_tokens: 5000` ต่อ request, body ได้ถึง 10 MB

**แนวทางแก้:**
- Production: server เสิร์ฟ frontend เองอยู่แล้ว → ไม่ต้องใช้ CORS เลย ใส่ `origin` allowlist หรือเปิดเฉพาะ dev
- เพิ่ม `express-rate-limit` ที่ `/api/ai`
- ลด `limit` ของ `express.json` ลงเหลือ ~100kb

---

### 4. เครดิตเป็น global ทุกคนใช้ก้อนเดียวกัน

**ไฟล์:** `server/src/db.ts` (ทุก method), `server/src/routes/ai.ts:37`

`'default_user'` ถูก hardcode ทั้งระบบ → user คนแรกที่เข้ามาใช้ 10 ครั้ง ทำให้คนทั้งเว็บใช้ไม่ได้

**แนวทางแก้:** ผูกเครดิตกับ identity อย่างน้อยระดับ signed cookie / session id

---

## P1 — ควรแก้เร็ว ๆ นี้

### 5. `tsconfig.app.json` ไม่เปิด `strict`

**ไฟล์:** `client/tsconfig.app.json`

ฝั่ง server เปิด `strict: true` แต่ client ไม่เปิด — ทดสอบแล้ว `tsc -p tsconfig.app.json --strict` ได้ **0 error** เปิดได้ฟรีทันที ไม่มีอะไรพัง เป็น win ที่ถูกที่สุดในโปรเจ็ค

### 6. `npm run build` ไม่ตรวจ type เลย

**ไฟล์:** `client/package.json`

```json
"build": "vite build"          // ปัจจุบัน — esbuild/oxc strip type ทิ้งโดยไม่เช็ค
"build": "tsc -b && vite build" // ควรเป็น
```

Type error หลุดขึ้น production ได้

### 7. OpenAI SDK ติดอยู่ใน entry bundle

`index-*.js` = **239 kB (57 kB gzip)** และยืนยันแล้วว่ามี OpenAI SDK อยู่ในนั้น

สาเหตุคือ barrel file:
```
App.tsx → storageService.ts → aiService.ts (re-export ทุกอย่าง) → aiClient.ts → import OpenAI
```

SDK ใช้แค่ใน custom mode เท่านั้น (credit mode ยิงผ่าน `fetch` ธรรมดา)

**แนวทางแก้:**
- ให้ `storageService.ts` import `DEFAULT_API_SETTINGS` จากไฟล์ constants แยก (ไม่ผ่าน barrel `aiService.ts`)
- `await import('openai')` แบบ lazy ใน `getOpenAIClient()`

**Bundle ปัจจุบัน:**
| Chunk | Raw | Gzip |
|---|---|---|
| vendor-react | 357 kB | 113 kB |
| index (entry) | 239 kB | 57 kB |
| TarotSubNav (shared data) | 166 kB | 30 kB |
| vendor-ui | 136 kB | 45 kB |
| CSS | 185 kB | 21 kB |

### 8. รูปการ์ด 16 MB ไม่ optimize

`client/public/cards/` — 78 ไฟล์ JPG ขนาด 300–380 kB ต่อใบ

- ไม่มี WebP/AVIF
- ไม่มี responsive `srcset`
- ไม่มี `loading="lazy"`

หน้า deck ที่โชว์การ์ดหลายใบพร้อมกันจะโหลดหลาย MB บนมือถือ แปลงเป็น WebP กว้าง ~600px ด้วย `sharp`/`squoosh` ลดได้ราว 80–90%

### 9. ไม่มี test เลยแม้แต่ไฟล์เดียว

ไม่มี vitest/jest ทั้งโปรเจ็ค อย่างน้อยควรมี unit test ให้ตรรกะที่คำนวณจริงและพังเงียบได้:

- `cleanAiResponse()` — regex ซับซ้อน มีโอกาส strip เนื้อหาจริงทิ้ง
- การคำนวณเลขศาสตร์ (`numerologyData.ts`)
- การหาราศีจากวันเกิด (`BirthdateZodiacFinder.tsx`)
- กราฟชีวิตดวงไทย (`thaiAstrologyData.ts`)

---

## P2 — Code quality

### `useEffect` dependency ไม่ครบ

**ไฟล์:** `client/src/features/tarot/pages/TarotReadingPage.tsx:59-80`

Effect อ่าน `savedReadings`, `isAnalyzing`, `drawnCards` แต่ deps มีแค่ `[id]` ตอนนี้ยังไม่พังเพราะโชคดี แต่เปราะมาก และ `.oxlintrc.json` ก็ไม่ได้เปิด `exhaustive-deps`

### Prop drilling

**ไฟล์:** `client/src/App.tsx`

`apiSettings` ถูกส่งลงทุกหน้า และ `setSavedReadings` ถูกส่งเป็น setter ดิบ ๆ ลง page component ควรใช้ Context (หรือ RTK)

### สื่อสารข้าม component ด้วย `window.dispatchEvent`

**ไฟล์:** `client/src/services/ai/aiClient.ts:82` → `client/src/components/common/Navbar.tsx:38-45`

Custom event `user_credits_updated` เป็น global event bus ที่ TypeScript ตรวจไม่ได้ (สังเกตว่าต้อง cast `as EventListener`) ควรเป็น Context

### `catch (e) {}` ว่าง 21 จุด

`npm run lint` เตือน 21 warning ส่วนใหญ่คือ swallow error เงียบ ๆ ทำให้ debug ยาก

### `error: any` + leak internal error message

**ไฟล์:** `server/src/routes/{ai,readings,user}.ts` — ทุก route

```ts
catch (error: any) {
  res.status(500).json({ error: error.message });  // ← leak ออก client
}
```

ควรมี error middleware กลางที่ log จริงแต่ตอบ generic message

### ไฟล์ใหญ่เกิน

| ไฟล์ | บรรทัด |
|---|---|
| `Cut3DeckView.tsx` | 634 |
| `TarotEncyclopediaPage.tsx` | 578 |
| `HoroscopePage.tsx` | 466 |
| `NumerologyPage.tsx` | 439 |
| `MindfulHoldView.tsx` | 426 |

ควรแยก logic ออกเป็น custom hooks

### `README.md` ยังเป็น template ของ Vite

ไม่มีคำอธิบายโปรเจ็ค, วิธี setup, env vars (COOLIFY.md มีบ้าง แต่ README คือหน้าแรกที่คนอ่าน)

---

## Docker — ใกล้ดีแล้ว

### ทำถูกแล้ว

- Multi-stage build
- Layer caching แยก `package.json` ก่อน `COPY . .`
- BuildKit `--mount=type=cache,target=/root/.npm`
- ไม่มี `ARG` ให้ secret รั่วเข้า image history
- Volume path ตรงกับ `process.cwd()/data` เป๊ะ (`/app/server/data`)
- Healthcheck ครบ

### ที่ยังปรับได้

| ประเด็น | รายละเอียด |
|---|---|
| Image ใหญ่เกิน | prod stage ยัง `apk add python3 make g++` (~150 MB) ควรใช้ multi-stage rebuild native module แล้วก็อปแค่ผลลัพธ์ หรือใช้ prebuilt binary ของ better-sqlite3 |
| devDeps ติดไป prod | `COPY --from=build /app/server ./server` ก็อป `node_modules` ที่มี tsx, typescript, @types และ `src/` ที่ไม่ใช้ตอน runtime มาด้วย → ควร `npm ci --omit=dev` ใน prod stage |
| รันเป็น root | ควรใส่ `USER node` |
| `.dockerignore` | ยังไม่มี `.DS_Store` (มีไฟล์นี้อยู่ใน `client/public/cards/`) |
| `nginx.conf` | ไม่มี security headers (HSTS, X-Content-Type-Options, CSP) — ถ้า Coolify จัดการ TLS/headers ให้แล้วก็ข้ามได้ |

---

## ลำดับที่แนะนำ

| # | งาน | Priority | แรง |
|---|---|---|---|
| 1 | Revoke API key ที่รั่ว + แทนด้วย placeholder ใน `.env.example` | P0 | ต่ำ |
| 2 | ปิด `/api/user/refill` ใน prod + จำกัด CORS origin + ใส่ rate limit | P0 | ต่ำ–กลาง |
| 3 | เปลี่ยนเครดิตจาก `default_user` เป็น per-session | P0 | กลาง |
| 4 | เปิด `strict: true` + เปลี่ยน build เป็น `tsc -b && vite build` | P1 | ต่ำมาก (ฟรี, 0 error) |
| 5 | Lazy-load OpenAI SDK ออกจาก entry bundle | P1 | ต่ำ |
| 6 | Optimize รูปการ์ดเป็น WebP + `loading="lazy"` | P1 | กลาง |
| 7 | ใส่ vitest + test ตรรกะคำนวณดวง | P1 | กลาง–สูง |
| 8 | Error middleware กลางฝั่ง server | P2 | ต่ำ |
| 9 | Context แทน prop drilling + `window.dispatchEvent` | P2 | กลาง |
| 10 | เขียน README ใหม่ | P2 | ต่ำ |
