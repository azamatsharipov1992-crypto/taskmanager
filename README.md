# TASK CONTROL — Enterprise Edition
## Multi-User IT Task Management & Customer Support System
**Versiya:** 2.0 (17.11.2026)  
**Platformalar:** Windows Desktop (Tauri 2 / Web) + Cloud Backend (Node.js/Express/Prisma) + Telegram Bot  
**Interfeys tillari:** O‘zbekcha (UZ) / Ruscha (RU)  
**GitHub Repository:** [https://github.com/azamatsharipov1992-crypto/taskmanager.git](https://github.com/azamatsharipov1992-crypto/taskmanager.git)

---

## 🌟 Asosiy Biznes Qoidasi (Core Principle)

> **"Dasturchi vazifani bajargani bilan murojaat yopilmaydi. Mijoz muammoning hal qilinganini rasman tasdiqlamaguncha murojaat ochiq qoladi va tizim nazoratidan chiqmaydi."**

### 4 Bosqichli Nazorat Bosqichlari:
1. **1-bosqich: Murojaat qabul qilindi & Biriktirildi** (`NEW`, `ASSIGNED`, `IN_PROGRESS`)
2. **2-bosqich: Mas'ul xodim yechim berdi** (`RESOLVED`) — *Dasturchi commit/izoh yuklaydi, ammo murojaat yopilmaydi!*
3. **3-bosqich: Yechim mijozga yetkazildi** (`DELIVERED`) — *Operator yechimni mijozga taqdim etadi va sinov boshlanadi.*
4. **4-bosqich: Mijoz natijani tasdiqladi** (`CLOSED`) — *Mijoz qoniqqanligini tasdiqlagachgina murojaat rasman yopiladi.*

### 👤 Operator Lock Qoidasi:
Murojaatni faqat uni ochgan mas'ul operator yoki Superadmin yopish va mijozga yetkazilgan deb tasdiqlash huquqiga ega.

---

## 📂 Loyiha Tuzilishi

```
taskmanager/
├── backend/                  # Node.js + Express + Prisma + Telegram Bot eslatmalar xizmati
│   ├── src/
│   │   ├── types.ts          # RBAC rollar, 4-bosqichli statuslar va interfeyslar
│   │   ├── db.ts             # Ma'lumotlar bazasi va CRUD operatsiyalar
│   │   ├── telegram.ts       # Telegram bot integratsiyasi va xabarnomalar
│   │   └── server.ts         # REST API server (port 4000)
│   ├── data/
│   │   └── db.json           # Dastlabki toza baza (mahsulotlar va administrator)
│   ├── .env.example          # Server konfiguratsiyasi namunasi
│   ├── Dockerfile            # Backend konteyneri
│   └── package.json
├── frontend/                 # React + Vite + TypeScript + Tailwind CSS (Desktop UI)
│   ├── src/
│   │   ├── components/       # Dashboard, Kanban, Murojaatlar, Xodimlar, KPI, Sozlamalar
│   │   ├── translations.ts   # O'zbekcha va Ruscha to'liq lokalizatsiya
│   │   └── App.tsx
│   ├── src-tauri/            # Tauri 2 native Windows Desktop integratsiyasi
│   │   ├── tauri.conf.json   # Windows .exe/.msi konfiguratsiyasi
│   │   └── Cargo.toml
│   ├── Dockerfile            # Web UI konteyneri (Nginx)
│   └── package.json
├── docs/                     # Rasmiy Foydalanuvchi Qo'llanmasi (PDF & HTML)
│   ├── TASK_CONTROL_Foydalanuvchi_Qollanmasi.pdf
│   └── user_manual.html
├── nginx/
│   └── taskcontrol.conf      # Domen va Let's Encrypt SSL konfiguratsiyasi
├── docker-compose.yml        # To'liq tizimni 1 buyruq bilan ishga tushirish
├── deploy.sh                 # Linux VPS ga o'rnatish va onlayn yangilash skripti
└── README.md
```

---

## 🚀 Mahalliy Ishga Tushirish (Local Run)

### 1. Barcha paketlarni o'rnatish:
```bash
npm install --prefix backend
npm install --prefix frontend
```

### 2. Backend serverni yoqish:
```bash
cd backend
cp .env.example .env
npm run dev
```
Backend API manzili: `http://localhost:4000`

### 3. Frontend dasturini yoqish:
```bash
cd frontend
npm run dev
```
Interfeys manzili: `http://localhost:3000`

---

## 🖥 Windows Desktop O'rnatuvchi Paketini Yig'ish (.exe / .msi)

Windows uchun native dastur paketini yig'ish:
```powershell
.\build_windows_installer.ps1
```
yoki Tauri CLI orqali:
```bash
cd frontend
npm run tauri build
```
Tayyor installer: `frontend/src-tauri/target/release/bundle/msi/` yoki `nsis/` papkasida hosil bo'ladi.

---

## 🌐 Serverga O'rnatish va Domen Ulash (VPS & Domain)

### 1. Linux VPS ga Docker va loyihani yuklash:
```bash
git clone https://github.com/azamatsharipov1992-crypto/taskmanager.git /opt/taskmanager
cd /opt/taskmanager
chmod +x deploy.sh
./deploy.sh install
```

### 2. Domenni ulash va SSL (HTTPS) o'rnatish:
1. Domeningiz DNS sozlamalarida (A Record) serveringizning IP manzilini kiriting.
2. Nginx faylini serverga nusxalang:
   ```bash
   sudo cp nginx/taskcontrol.conf /etc/nginx/sites-available/taskcontrol.conf
   # Fayl ichidagi YOUR_DOMAIN.COM o'rniga o'z domeningizni yozing
   sudo nano /etc/nginx/sites-available/taskcontrol.conf
   sudo ln -s /etc/nginx/sites-available/taskcontrol.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. Bepul Let's Encrypt SSL sertifikatini oling:
   ```bash
   sudo certbot --nginx -d sizningdomeningiz.uz -d www.sizningdomeningiz.uz
   ```

---

## 🔄 Onlayn Yangilash (Online Update Workflow)

Dasturga o'zgartirish kiritib, GitHub ga yuklaganingizdan so'ng, serverda uni 1 ta buyruq bilan onlayn yangilaysiz:

```bash
cd /opt/taskmanager
./deploy.sh update
```
Ushbu buyruq avtomatik tarzda:
1. GitHub-dan eng so'nggi `main` branch kodlarini tortib oladi (`git fetch && git reset --hard`).
2. Docker konteynerlarini qayta quradi va uzilishlarsiz qayta yoqadi (`docker-compose up --build -d`).

---

## 🤖 Telegram Bot Integratsiyasi

* **Bot Tokeni:** `7996799482:AAGuXIr6jk-9fvY3kpo-nGQQV7X_CEYKPLc`
* **Admin Chat ID:** `53663779`
* **Xodimlar ulanishi:** Yangi xodim qo'shilgach, botda `/start` buyrug'ini bajarishi orqali uning Chat ID si avtomatik ulanadi.

---

## 📄 Foydalanuvchi Qo'llanmasi
To'liq 10 sahifali rasmiy qo'llanma hujjatlari `docs/` papkasida saqlangan:
* [TASK_CONTROL_Foydalanuvchi_Qollanmasi.pdf](docs/TASK_CONTROL_Foydalanuvchi_Qollanmasi.pdf)
