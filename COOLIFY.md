# 🚀 คำแนะนำการ Deploy บน Coolify (Coolify Deployment Guide)

โปรเจกต์ **Mystic Tarot** ถูกปรับแต่งให้พร้อม Deploy บน **Coolify** ได้ทันทีในรูปแบบ **Dockerfile** หรือ **Docker Compose** โดยมีระบบจัดเก็บข้อมูล SQLite แบบชั่วอสงไขย (Persistent Volume) และจัดการระบบ SSL/Domain อัตโนมัติ

---

## 🛠️ ขั้นตอนการ Deploy บน Coolify Dashboard

### วิธีที่ 1: Deploy ผ่าน Dockerfile (แนะนำ - ง่ายที่สุด)

1. เข้าสู่ **Coolify Dashboard** -> เลือก **Projects** -> เลือก Environment ของคุณ
2. กด **+ Add New Resource** -> เลือก **Public Repository** หรือ **Private Repository** (ชี้มาที่ Git Repo นี้)
3. ในส่วน **Build Pack** ให้เลือก: **Dockerfile**
4. กำหนดค่า **Ports Exposed**: `3001` (สื่อสารภายในกับ Coolify Proxy โดยไม่ต้องเปิด Host Port สู่ภายนอก)
5. ในส่วน **Environment Variables** เพิ่มค่าต่อไปนี้:
   - `PORT` = `3001`
   - `OPENAI_API_KEY` = `sk-dce7f4d0918d74dd-ocq0dk-310c8c1d` (หรือ Key ของคุณ)
   - `OPENAI_BASE_URL` = `https://9router.jsd.my.id/v1`
   - `OPENAI_MODEL` = `tarot-cards`
6. ในส่วน **Persistent Storage (Volumes)** เพิ่ม Volume เพื่อรักษาข้อมูลประวัติการทำนายใน SQLite:
   - **Source Path / Volume Name**: `tarot-data`
   - **Destination Path**: `/app/server/data`
7. กด **Deploy** 🚀

---

### วิธีที่ 2: Deploy ผ่าน Docker Compose

1. เข้าสู่ **Coolify Dashboard** -> **+ Add New Resource** -> เลือก **Docker Compose**
2. เลือก Git Repository นี้
3. Coolify จะอ่านไฟล์ `docker-compose.yml` อัตโนมัติ
4. เพิ่ม **Environment Variables** เดียวกันใน Coolify UI
5. กำหนด Domain ชื่อเว็บของคุณ (เช่น `https://tarot.yourdomain.com`) แล้วกด **Deploy**

---

## 🔍 การทำงานภายในเมื่อ Deploy บน Coolify

- **Auto SSL/TLS**: Coolify Traefik/Caddy Reverse Proxy จะขอใบรับรอง SSL (Let's Encrypt) ฟรีให้อัตโนมัติ
- **Frontend & Backend Unified**: ฝั่ง Frontend (React) จะถูก Build ไปไว้ที่ `server/public` และรันควบคู่กับ Express API บนพอร์ต 3001
- **Database Persistence**: SQLite database จะถูกเก็บไว้ที่ `/app/server/data/tarot.db` ผ่าน Named Volume ไม่สูญหายเมื่อมีการ Deploy ใหม่
