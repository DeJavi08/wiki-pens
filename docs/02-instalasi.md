# 02. Instalasi & Menjalankan Proyek

> **Tujuan dokumen ini:** Panduan langkah demi langkah untuk menginstall dan menjalankan PENS Wiki di komputer lokal.

## 📋 Prasyarat

Sebelum mulai, pastikan komputer kamu sudah terinstall:

### 1. Node.js (versi 18 atau lebih baru)

**Cek apakah sudah terinstall:**
```bash
node --version
```

Kalau belum, download di [nodejs.org](https://nodejs.org/). Pilih versi **LTS** (Long Term Support).

**Kenapa Node.js?**
Node.js adalah runtime JavaScript di luar browser. Vite dan npm butuh ini untuk build project React.

### 2. npm (Node Package Manager)

**Cek apakah sudah terinstall:**
```bash
npm --version
```

Biasanya sudah otomatis terinstall bersama Node.js.

### 3. Git

**Cek apakah sudah terinstall:**
```bash
git --version
```

Kalau belum, download di [git-scm.com](https://git-scm.com/).

### 4. Code Editor (opsional tapi direkomendasikan)

- **VS Code** — [Download](https://code.visualstudio.com/) (paling populer)
- **Cursor** — [Download](https://cursor.sh/) (VS Code + AI)
- **WebStorm** — [Download](https://www.jetbrains.com/webstorm/) (berbayar)

**Ekstensi VS Code yang direkomendasikan:**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- Auto Rename Tag
- Prettier - Code formatter

## 🚀 Langkah Instalasi

### Langkah 1: Clone Repository

Buka terminal/command prompt, lalu jalankan:

```bash
git clone https://github.com/dejavi08/wiki-pens.git
cd wiki-pens
```

**Penjelasan:**
- `git clone` → download seluruh repository dari GitHub
- `cd wiki-pens` → masuk ke folder project

### Langkah 2: Install Dependencies

```bash
npm install
```

**Apa yang terjadi?**
- npm baca file `package.json`
- npm download semua library yang dibutuhkan ke folder `node_modules/`
- Proses ini butuh 1-3 menit tergantung kecepatan internet

**Kalau error?**
```bash
# Coba bersihkan cache npm
npm cache clean --force

# Lalu install lagi
npm install
```

### Langkah 3: Konfigurasi Environment (Opsional)

```bash
cp .env.example .env.local
```

File `.env.example` isinya:
```env
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
```

**Kalau kamu tidak pakai fitur AI/Gemini, langkah ini bisa dilewati.**

### Langkah 4: Jalankan Development Server

```bash
npm run dev
```

**Output yang muncul:**
```
  VITE v8.3.0  ready in 245 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.10:3000/
  ➜  press h + enter to show help
```

Buka browser, akses **http://localhost:3000**

## 🎨 Apa itu "Development Server"?

**Development Server** adalah server lokal yang:
- Menyajikan aplikasi di `localhost:3000`
- **Auto-reload** setiap kali kamu edit file (Hot Module Replacement)
- Menampilkan error langsung di browser

**Hot Module Replacement (HMR):**
Kamu edit file `App.tsx` → simpan → browser otomatis update **tanpa reload halaman**. Ini yang bikin development cepat.

## 🏗️ Build Produksi

Setelah selesai development, kamu bisa build versi produksi:

```bash
npm run build
```

**Output:**
```
vite v8.3.0 building for production...
✓ 1247 modules transformed.
dist/index.html                   0.85 kB │ gzip:  0.48 kB
dist/assets/index-a1b2c3d4.css   45.32 kB │ gzip:  8.21 kB
dist/assets/index-e5f6g7h8.js   312.45 kB │ gzip: 89.12 kB
✓ built in 3.42s
```

**Apa yang terjadi?**
- Vite gabungkan semua file jadi satu bundle
- Minify (perkecil) JavaScript & CSS
- Optimize assets (gambar, font)
- Output ke folder `dist/`

**Preview hasil build:**
```bash
npm run preview
```

## 📂 Struktur Folder Setelah Install

```
wiki-pens/
├── node_modules/          ← Library (hasil npm install) — JANGAN di-commit
├── dist/                  ← Hasil build — JANGAN di-commit
├── src/                   ← Kode sumber
├── public/                ← Asset statis
├── .env.local             ← Environment variables — JANGAN di-commit
├── .gitignore             ← File yang diabaikan Git
├── package.json           ← Manifest project
├── package-lock.json      ← Lock versi dependencies
├── tsconfig.json          ← Konfigurasi TypeScript
└── vite.config.ts         ← Konfigurasi Vite
```

## 🔧 Perintah npm yang Tersedia

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk produksi |
| `npm run preview` | Preview hasil build |
| `npm run lint` | Cek TypeScript error |
| `npm run clean` | Hapus folder build |

## 🐛 Troubleshooting

### Error: `EADDRINUSE: address already in use :::3000`

**Penyebab:** Port 3000 sudah dipakai aplikasi lain.

**Solusi:**
```bash
# Opsi 1: Matikan aplikasi yang pakai port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Opsi 2: Ganti port di package.json
# Ubah "vite --port=3000" jadi "vite --port=3001"
```

### Error: `Cannot find module 'xxx'`

**Penyebab:** Dependencies belum terinstall sempurna.

**Solusi:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: `Module not found: Can't resolve 'react'`

**Penyebab:** React belum terinstall.

**Solusi:**
```bash
npm install react react-dom
```

### Error: TypeScript error di VS Code

**Penyebab:** VS Code pakai versi TypeScript berbeda.

**Solusi:**
1. Buka Command Palette (`Ctrl + Shift + P`)
2. Ketik "TypeScript: Select TypeScript Version"
3. Pilih "Use Workspace Version"

### Halaman blank putih

**Penyebab:** Ada error JavaScript yang belum terlihat.

**Solusi:**
1. Buka Developer Tools (`F12` atau `Ctrl + Shift + I`)
2. Lihat tab **Console** untuk error
3. Perbaiki error yang muncul

### HMR tidak bekerja

**Penyebab:** File watcher bermasalah.

**Solusi:**
```bash
# Restart dev server
Ctrl + C  (matikan)
npm run dev  (jalankan ulang)
```

## 🌐 Deploy ke Vercel

### Opsi 1: Deploy via GitHub

1. Push kode ke GitHub
2. Buka [vercel.com](https://vercel.com/)
3. Klik **"New Project"**
4. Import repository dari GitHub
5. Vercel otomatis detect Vite
6. Klik **"Deploy"**

### Opsi 2: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy ke production
vercel --prod
```

### Konfigurasi Custom Domain

1. Buka dashboard Vercel
2. Pilih project → **Settings** → **Domains**
3. Tambahkan domain kamu (misal: `pens.dejavi.id`)
4. Ikuti instruksi untuk setup DNS

**Contoh setup DNS di Cloudflare:**
```
Type: CNAME
Name: pens
Content: cname.vercel-dns.com
Proxy: DNS Only (bukan Proxied)
```

## 📚 Selanjutnya

- [03. Arsitektur](03-arsitektur.md) — Struktur folder & tech stack
- [04. Konsep React](04-konsep-react.md) — Belajar React dari nol

---

[⬅️ Kembali: Pengenalan](01-pengenalan.md) | [Selanjutnya: Arsitektur ➡️](03-arsitektur.md)
