# 10. FAQ (Frequently Asked Questions)

> **Tujuan dokumen ini:** Jawaban untuk pertanyaan yang sering diajukan.

## 🚀 Instalasi & Setup

### Q: Node.js versi berapa yang dibutuhkan?

**A:** Minimal Node.js 18.x. Versi LTS direkomendasikan. Cek dengan `node --version`.

### Q: Kenapa `npm install` error?

**A:** Coba langkah berikut:
```bash
# 1. Bersihkan cache
npm cache clean --force

# 2. Hapus node_modules
rm -rf node_modules package-lock.json

# 3. Install ulang
npm install
```

Kalau masih error, pastikan koneksi internet stabil.

### Q: Port 3000 sudah dipakai, gimana?

**A:** Dua opsi:

**Opsi 1:** Matikan aplikasi yang pakai port 3000
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

**Opsi 2:** Ganti port di `package.json`
```json
"dev": "vite --port=3001"
```

### Q: Apa itu Vite? Kenapa bukan Webpack?

**A:** Vite adalah build tool modern yang:
- Lebih cepat dari Webpack (pakai native ES modules)
- HMR (Hot Module Replacement) instan
- Konfigurasi lebih simpel

### Q: Bisa jalan tanpa internet?

**A:** Development butuh internet untuk `npm install` pertama kali. Setelah itu, bisa offline. Tapi:
- Logo PENS di-load dari Wikipedia (butuh internet)
- Font Google Fonts (butuh internet)

Untuk full offline, download logo & font ke folder `public/`.

## ⚛️ React

### Q: Apa beda React dengan HTML biasa?

**A:** 
- HTML: struktur statis
- React: komponen dinamis yang re-render saat state berubah

Contoh: Kalau `currentSlug` berubah di React, seluruh halaman otomatis update. Di HTML biasa, harus manipulasi DOM manual.

### Q: Kapan pakai useState vs useRef?

**A:**
- `useState` → nilai berubah → UI re-render
- `useRef` → nilai berubah → UI tidak re-render

Contoh:
- Counter (UI update) → `useState`
- Timer ID, DOM reference → `useRef`

### Q: Kapan pakai useMemo vs useCallback?

**A:**
- `useMemo` → cache **hasil perhitungan**
- `useCallback` → cache **fungsi**

Contoh:
```tsx
// useMemo
const total = useMemo(() => items.reduce((s, i) => s + i.harga, 0), [items]);

// useCallback
const handleClick = useCallback(() => console.log('click'), []);
```

### Q: Kenapa `useEffect` bikin infinite loop?

**A:** Karena tidak ada dependency array, atau dependency-nya berubah terus.

```tsx
// ❌ Infinite loop
useEffect(() => {
  setCount(count + 1);
});  // gak ada []

// ✅ Benar
useEffect(() => {
  setCount(count + 1);
}, []);  // jalan sekali
```

### Q: Apa itu "lifting state up"?

**A:** Memindahkan state dari child ke parent terdekat supaya bisa di-share antar komponen.

```tsx
// ❌ State di masing-masing
function A() { const [x, setX] = useState(''); }
function B() { const [x, setX] = useState(''); }  // state terpisah!

// ✅ State di parent
function Parent() {
  const [x, setX] = useState('');
  return <><A x={x} setX={setX} /><B x={x} /></>;
}
```

## 📝 Markdown & Wikilinks

### Q: Bedanya `[[Target]]` dengan `[text](url)`?

**A:**
- `[[Target]]` → wikilink ke artikel lain **di dalam PENS Wiki**
- `[text](url)` → link ke **website eksternal**

### Q: Kenapa wikilink saya jadi merah (missing)?

**A:** Karena target wikilink tidak ditemukan. Cek:
1. Nama artikel benar? (case-sensitive)
2. Slug benar?
3. Alias benar?
4. Artikel sudah ada di folder `content/notes/`?

### Q: Bisa link ke heading tertentu?

**A:** Saat ini belum support `[[Target#Heading]]`. Bisa pakai HTML anchor manual:
```markdown
<a href="#sejarah-pendirian">Ke Sejarah</a>
```

### Q: Bagaimana cara nambah kategori baru?

**A:** Edit `LeftSidebar.tsx`:
```tsx
const map = {
  Identitas: { directNotes: [], subcategories: {} },
  Akademik: { directNotes: [], subcategories: {} },
  // Tambah kategori baru:
  KategoriBaru: { directNotes: [], subcategories: {} },
};
```

Juga update `categoryColorMap` di `App.tsx` dan `BacklinksPanel.tsx`.

## 🕸️ Graph View

### Q: Graph-nya berat, gimana?

**A:** Beberapa optimasi:
- Filter kategori di Global Graph Modal
- Gunakan search filter
- Klik "Jeda" untuk pause simulasi
- Di device low-end, jangan buka Global Graph

### Q: Kenapa node saya gak berhenti bergerak?

**A:** Kemungkinan ada node yang di-drag. Cek dengan:
1. Klik "Jeda" di toolbar
2. Atau tunggu 5-10 detik sampai alpha decay selesai

### Q: Graph-nya CPU 100%, kenapa?

**A:** Normal saat simulasi aktif. Setelah stabil (~3 detik), CPU turun ke 0%.

Kalau terus 100%, mungkin ada bug. Coba:
1. Refresh halaman
2. Cek DevTools → Performance tab

### Q: Bisa export graph ke PNG?

**A:** Belum ada fitur ini. Bisa pakai screenshot manual:
- Windows: `Win + Shift + S`
- Mac: `Cmd + Shift + 4`

## 🎨 Theming

### Q: Bagaimana cara tambah tema baru?

**A:** Edit `index.css`:
```css
[data-theme="sepia"] {
  --wiki-bg: #f4ecd8;
  --wiki-text-primary: #5b4636;
  /* ... */
}
```

Lalu tambah option di toggle:
```tsx
const themes = ['light', 'dark', 'sepia'];
```

### Q: Dark mode tidak berubah, kenapa?

**A:** Cek:
1. Attribute `data-theme="dark"` sudah di `<html>`?
2. CSS variable sudah didefinisikan di `[data-theme="dark"]`?
3. Tidak ada `!important` yang override?

Buka DevTools → Elements → cek `<html>` element.

## 🚀 Deployment

### Q: Bagaimana deploy ke Vercel?

**A:** 
1. Push ke GitHub
2. Buka [vercel.com](https://vercel.com/)
3. New Project → Import GitHub repo
4. Deploy

Atau pakai CLI:
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Q: Bisa deploy ke Netlify?

**A:** Bisa. Setting:
- Build command: `npm run build`
- Publish directory: `dist`

### Q: Custom domain bagaimana?

**A:** 
1. Vercel Dashboard → Settings → Domains
2. Add domain
3. Setup DNS di registrar:
   ```
   Type: CNAME
   Name: pens
   Value: cname.vercel-dns.com
   ```

## 🤝 Kontribusi

### Q: Bagaimana cara kontribusi?

**A:** 
1. Fork repo
2. Clone fork
3. Buat branch baru
4. Commit perubahan
5. Push ke branch
6. Buat Pull Request

Detail di [CONTRIBUTING.md](../CONTRIBUTING.md).

### Q: Saya bukan mahasiswa PENS, boleh kontribusi?

**A:** Boleh! Kontribusi terbuka untuk siapa pun. Tapi konten harus relevan dengan PENS.

### Q: Kontribusi apa saja yang diterima?

**A:** 
- 📝 Menambah artikel baru
- 🐛 Memperbaiki bug
- ✨ Menambah fitur
- 📖 Memperbaiki dokumentasi
- 🌐 Terjemahan
- 🎨 Desain UI
- ♿ Aksesibilitas

### Q: Bagaimana cara melaporkan bug?

**A:** Buat issue di GitHub dengan template:
```markdown
**Deskripsi:**
[Jelaskan bug]

**Langkah reproduksi:**
1. ...
2. ...

**Expected:**
[Yang seharusnya terjadi]

**Actual:**
[Yang terjadi]

**Screenshot:**
[Kalau ada]

**Environment:**
- OS: Windows 11
- Browser: Chrome 120
- Node: 18.17.0
```

## 🎓 Akademik

### Q: Ini tugas kuliah apa?

**A:** Proyek ini dibuat untuk mata kuliah **Workshop Desain Web** di PENS, dengan dosen pengampu **Pak Hero**.

### Q: Boleh dipakai sebagai referensi?

**A:** Boleh, dengan syarat:
- Cantumkan sumber
- Jangan plagiat
- Gunakan untuk pembelajaran

### Q: Bisa dipakai untuk skripsi/TA?

**A:** Bisa. Beberapa ide pengembangan:
- Full-text search dengan indexing
- Multi-bahasa
- PWA offline mode
- Real-time collaboration
- AI-powered Q&A

## 🔧 Development

### Q: Bagaimana cara debug?

**A:** 
1. Buka DevTools (`F12`)
2. Lihat tab **Console** untuk error
3. Tab **Elements** untuk inspect HTML
4. Tab **Network** untuk cek request
5. Tab **Performance** untuk cek performa
6. Tab **Application** untuk cek localStorage/cache

### Q: Bagaimana cara nambah komponen baru?

**A:** 
1. Buat file di `src/components/NamaKomponen.tsx`
2. Tulis komponen:
   ```tsx
   import React from 'react';

   interface Props {
     title: string;
   }

   export const NamaKomponen: React.FC<Props> = ({ title }) => {
     return <div>{title}</div>;
   };
   ```
3. Import di `App.tsx`:
   ```tsx
   import { NamaKomponen } from './components/NamaKomponen';
   ```
4. Pakai di JSX:
   ```tsx
   <NamaKomponen title="Hello" />
   ```

### Q: Bagaimana cara nambah artikel?

**A:** 
1. Buat file `.md` di folder kategori yang sesuai
2. Isi frontmatter YAML
3. Tulis konten
4. Save → otomatis muncul di sidebar & search

### Q: Bagaimana cara nambah field frontmatter?

**A:** 
1. Update interface di `src/types.ts`:
   ```tsx
   export interface NoteFrontmatter {
     // ... existing
     newField?: string;
   }
   ```
2. Update parser di `src/utils/markdownParser.ts`
3. Pakai di komponen

## 🌐 Lain-lain

### Q: Kenapa namanya "PENS Wiki"?

**A:** Karena PENS = Politeknik Elektronika Negeri Surabaya. Wiki = ensiklopedia.

### Q: Ada rencana mobile app?

**A:** Belum ada rencana. Tapi PWA (Progressive Web App) mungkin di masa depan.

### Q: Bagaimana cara backup data?

**A:** Semua data ada di folder `src/content/notes/`. Cukup backup folder ini.

### Q: Apakah ada biaya?

**A:** 
- **Free**: Hosting di Vercel (free tier), domain custom optional
- **Paid**: Domain custom (~Rp150k/tahun), opsional

### Q: Siapa yang maintain?

**A:** Komunitas kontributor PENS Wiki. Lihat [Contributors](https://github.com/dejavi08/wiki-pens/graphs/contributors).

### Q: Bagaimana cara menghubungi maintainer?

**A:** 
- Buat issue di GitHub
- Email: [lihat profil GitHub]
- Instagram: [lihat profil GitHub]

---

## 📚 Kembali ke Dokumentasi

- [01. Pengenalan](01-pengenalan.md)
- [02. Instalasi](02-instalasi.md)
- [03. Arsitektur](03-arsitektur.md)
- [04. Konsep React](04-konsep-react.md)
- [05. Komponen](05-komponen.md)
- [06. Markdown Parser](06-markdown-parser.md)
- [07. Graph View](07-graph-view.md)
- [08. Theming](08-theming.md)
- [09. Menulis Artikel](09-menulis-artikel.md)

---

[⬅️ Kembali: Menulis Artikel](09-menulis-artikel.md) | [⬆️ Kembali ke README](../README.md)
