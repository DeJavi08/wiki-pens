const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, 'src', 'content', 'notes');

// Helper to ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Target folders
const folders = [
  '00-index',
  '01-identitas',
  '02-akademik',
  '03-kemahasiswaan',
  '04-komunitas',
  '05-robotika',
  '06-riset-inovasi'
];

folders.forEach(f => ensureDir(path.join(notesDir, f)));

// Recursive function to find all .md files
function getAllMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Skip top-level 00-06 folders if they already exist
      if (!file.match(/^\d{2}-/)) {
        getAllMarkdownFiles(filePath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allMdFiles = getAllMarkdownFiles(notesDir);

// Mapping rules for moving files
function getTargetFolder(fileName, content) {
  if (fileName === 'beranda.md' || fileName.startsWith('moc-')) {
    return '00-index';
  }
  if (['identitas-kelembagaan.md', 'infrastruktur-kampus.md', 'sejarah-pendirian.md'].includes(fileName)) {
    return '01-identitas';
  }
  if ([
    'aturan-akademik-dan-evaluasi.md', 'panduan-lengkap-skem.md', 'panduan-double-degree-pico.md',
    'fasilitas-dan-layanan-digital.md', 'departemen-dte.md', 'departemen-dtik.md',
    'departemen-dtme.md', 'departemen-dtmk.md', 'program-pascasarjana.md', 'psdku-pens.md'
  ].includes(fileName) || content.includes('category: "Akademik"')) {
    return '02-akademik';
  }
  if (fileName.startsWith('hima-') || fileName.startsWith('ukm-') || fileName.startsWith('km-pens') || fileName.startsWith('himpunan-mahasiswa') || fileName.startsWith('rekrutmen-kaderisasi') || fileName.startsWith('sistem-layanan-kemahasiswaan') || fileName.startsWith('himit') || fileName.startsWith('hmce') || content.includes('category: "Kemahasiswaan"')) {
    return '03-kemahasiswaan';
  }
  if (fileName.startsWith('komunitas-') || content.includes('category: "Komunitas"')) {
    return '04-komunitas';
  }
  if (fileName.startsWith('tim-') || content.includes('category: "Robotika"')) {
    return '05-robotika';
  }
  if ([
    'dewan-guru-besar.md', 'ekosistem-inovasi.md', 'er2c.md', 'lab-kontrol-cerdas.md'
  ].includes(fileName) || content.includes('category: "Riset & Inovasi"')) {
    return '06-riset-inovasi';
  }
  return '03-kemahasiswaan';
}

allMdFiles.forEach(filePath => {
  const fileName = path.basename(filePath);
  // Skip if already in 00-06 folder
  if (filePath.includes('/00-index/') || filePath.includes('/01-identitas/') || filePath.includes('/02-akademik/') || filePath.includes('/03-kemahasiswaan/') || filePath.includes('/04-komunitas/') || filePath.includes('/05-robotika/') || filePath.includes('/06-riset-inovasi/')) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const targetFolder = getTargetFolder(fileName, content);
  const destPath = path.join(notesDir, targetFolder, fileName);

  fs.copyFileSync(filePath, destPath);
  console.log(`Moved ${fileName} -> ${targetFolder}/`);
});

// Create MOC files in 00-index
const mocFiles = {
  'Beranda.md': `---
title: "Beranda PENS Wiki"
slug: "beranda"
category: "Identitas"
tags: ["Beranda", "Index", "MOC", "PENS"]
updated: "2026-09-30"
summary: "Peta utama (Map of Content) Ensiklopedia Terbuka Politeknik Elektronika Negeri Surabaya."
author: "Tim Ensiklopedia PENS"
icon: "bi-house-door"
featured: true
---

# Selamat Datang di PENS Wiki

Selamat datang di **PENS Wiki**, ensiklopedia dan basis pengetahuan terbuka Politeknik Elektronika Negeri Surabaya. Wiki ini mengadopsi prinsip **Zettelkasten** dan **Map of Content (MOC)** untuk memudahkan penelusuran informasi antar-artikel melalui tautan langsung (`[[wikilinks]]`).

## 🗺️ Peta Utama Pengetahuan (Map of Content)

- [[MOC-Akademik|Peta Akademik & Departemen]]
- [[MOC-Kemahasiswaan|Peta Kemahasiswaan & HIMA]]
- [[MOC-UKM-dan-Komunitas|Peta UKM & Komunitas]]
- [[MOC-Robotika|Peta Tim Robotika PENS]]

## 🏛️ Profil Institusi
- [[identitas-kelembagaan|Identitas Kelembagaan]]
- [[sejarah-pendirian|Sejarah Pendirian PENS]]
- [[infrastruktur-kampus|Infrastruktur Kampus]]
`,
  'MOC-Akademik.md': `---
title: "Map of Content: Akademik & Departemen PENS"
slug: "moc-akademik"
category: "Akademik"
tags: ["MOC", "Akademik", "Departemen", "Kurikulum"]
updated: "2026-09-30"
summary: "Peta penghubung seluruh artikel akademik, peraturan, fasilitas digital, dan departemen di PENS."
author: "Tim Ensiklopedia PENS"
icon: "bi-book"
featured: true
---

# Map of Content: Akademik & Departemen PENS

Halaman ini berfungsi sebagai pusat navigasi untuk seluruh informasi akademik di PENS.

## 🏢 Departemen & Program Studi
- [[departemen-dte|Departemen Teknik Elektro (DTE)]]
- [[departemen-dtik|Departemen Teknik Informatika dan Komputer (DTIK)]]
- [[departemen-dtme|Departemen Teknik Mekanika dan Energi (DTME)]]
- [[departemen-dtmk|Departemen Teknologi Multimedia Kreatif (DTMK)]]
- [[program-pascasarjana|Program Pascasarjana Terapan]]
- [[psdku-pens|PSDKU PENS di Luar Kampus Utama]]

## 📜 Peraturan & Panduan Akademik
- [[aturan-akademik-dan-evaluasi|Aturan Akademik dan Evaluasi Studi]]
- [[panduan-lengkap-skem|Panduan SKEM (Satuan Kredit Kegiatan Mahasiswa)]]
- [[panduan-double-degree-pico|Panduan Double Degree & PICO]]
- [[fasilitas-dan-layanan-digital|Fasilitas & Layanan Digital Kampus]]
`,
  'MOC-Kemahasiswaan.md': `---
title: "Map of Content: Kemahasiswaan & HIMA PENS"
slug: "moc-kemahasiswaan"
category: "Kemahasiswaan"
tags: ["MOC", "Kemahasiswaan", "HIMA", "BEM"]
updated: "2026-09-30"
summary: "Peta penghubung struktur Keluarga Mahasiswa (KM PENS) dan delapan himpunan mahasiswa program studi."
author: "Tim Ensiklopedia PENS"
icon: "bi-people"
featured: true
---

# Map of Content: Kemahasiswaan & HIMA PENS

Pusat koordinasi dan representasi keorganisasian mahasiswa Politeknik Elektronika Negeri Surabaya.

## 🏛️ Tata Kelola KM PENS
- [[km-pens|Keluarga Mahasiswa PENS (KM PENS)]]
- [[himpunan-mahasiswa-pens|Ekosistem & Rekonfigurasi HIMA PENS]]
- [[sistem-layanan-kemahasiswaan|Sistem Layanan Kemahasiswaan]]
- [[rekrutmen-kaderisasi|Rekrutmen & Sistem Kaderisasi]]

## ⚡ Himpunan Mahasiswa (HIMA)
- [[hima-energi|HIMA ENERGI (Sistem Pembangkit Energi)]]
- [[himit|HIMIT (Teknik Informatika)]]
- [[hmce|HMCE (Computer Engineering)]]
- [[hima-elin|HIMA ELIN (Teknik Elektro Industri)]]
- [[hima-elka|HIMA ELKA (Teknik Elektronika)]]
- [[hima-meka|HIMA MEKA (Teknik Mekatronika)]]
- [[hima-telkom|HIMA TELKOM (Teknik Telekomunikasi)]]
- [[hima-mmb|HIMA MMB (Multimedia Broadcasting)]]
`,
  'MOC-UKM-dan-Komunitas.md': `---
title: "Map of Content: UKM & Komunitas PENS"
slug: "moc-ukm-dan-komunitas"
category: "Kemahasiswaan"
tags: ["MOC", "UKM", "Komunitas", "Minat Bakat"]
updated: "2026-09-30"
summary: "Peta penghubung seluruh Unit Kegiatan Mahasiswa (UKM) seni, olahraga, kerohanian, penalaran, dan komunitas minat khusus."
author: "Tim Ensiklopedia PENS"
icon: "bi-patch-check"
featured: true
---

# Map of Content: UKM & Komunitas PENS

Direktori lengkap unit kegiatan mahasiswa dan komunitas independen di lingkungan PENS.

## ⚽ UKM Olahraga
- [[ukm-badminton|UKM Badminton]]
- [[ukm-basket|UKM Basket]]
- [[ukm-futsal|UKM Futsal]]
- [[ukm-voli|UKM Bola Voli]]
- [[ukm-taekwondo|UKM Taekwondo]]
- [[ukm-karate|UKM Karate]]
- [[ukm-pencak-silat|UKM Pencak Silat]]
- [[ukm-mahetala|UKM Mahetala (Pencinta Alam)]]
- [[ukm-tenis-meja|UKM Tenis Meja]]

## 🎨 UKM Seni & Budaya
- [[ukm-psm|UKM Paduan Suara Mahasiswa (Gita Swara PENS)]]
- [[ukm-teater|UKM Teater]]
- [[ukm-cinemascope|UKM Cinemascope (Sinematografi)]]
- [[ukm-frens|UKM Frens (Band & Musik)]]
- [[ukm-usi|UKM USI (Seni Islam)]]
- [[ukm-tari|UKM Seni Tari Tradisional & Modern]]
- [[ukm-musik|UKM Musik]]

## 🕌 UKM Kerohanian
- [[ukm-uk3|UKM Kerohanian Islam (UK3)]]
- [[ukm-ukki|UKM Keluarga Mahasiswa Katolik (KMK)]]

## 🔬 UKM Penalaran & Riset
- [[ukm-ent|UKM Enterpreneurship]]
- [[ukm-penalaran-ilmiah|UKM Penalaran & Riset Ilmiah]]
- [[ukm-jurnalistik|UKM Jurnalistik & Pers Mahasiswa]]
- [[ukm-fotografi|UKM Fotografi]]
- [[ukm-roboholic|UKM Roboholic]]
- [[ukm-softdev|UKM Software Development]]
- [[ukm-dirgantara|UKM Dirgantara]]

## 💡 Komunitas Minat Khusus & Teknologi
- [[komunitas-sre|Solar Boat & Renewable Energy (SRE)]]
- [[komunitas-bridge|Bridge Community]]
- [[komunitas-sahabat-bahasa|Komunitas Sahabat Bahasa]]
- [[komunitas-janaka|Komunitas Janaka]]
- [[komunitas-pens-esport|PENS Esports Community]]
- [[komunitas-pensmate|PENS Mate]]
- [[komunitas-gdgoc|Google Developer Groups on Campus (GDGOC PENS)]]
`,
  'MOC-Robotika.md': `---
title: "Map of Content: Tim Robotika PENS"
slug: "moc-robotika"
category: "Robotika"
tags: ["MOC", "Robotika", "Tim Robot", "KRI"]
updated: "2026-09-30"
summary: "Peta penghubung seluruh divisi dan tim riset robotika kebanggaan PENS di kancah nasional dan internasional."
author: "Tim Ensiklopedia PENS"
icon: "bi-robot"
featured: true
---

# Map of Content: Tim Robotika PENS

Pusat dokumentasi divisi dan tim riset robotika PENS yang telah malang melintang menjuarai Kontes Robot Indonesia (KRI) dan kontes internasional.

## 🤖 Tim Riset & Divisi Robotika Utama
- [[tim-eros|TIM EROS (ERM Robot Soccer)])
- [[tim-erisa|TIM ERISA (KRCI / KRAI)]]
- [[tim-ersow|TIM ERSOW (Robot Seni)]]
- [[tim-eira|TIM EIRA (Robot Pemadam Api)]]
- [[tim-eilero|TIM EILERO]]
- [[tim-eternos|TIM ETERNOS]]
- [[tim-bamantara-eepisat|TIM BAMANTARA (EEHISAT - Satelit Nano)]]
- [[tim-effiro|TIM EFFIRO]]
- [[tim-penship-emaver|TIM PESHIP EMAVER]]
- [[tim-caksa|TIM CAKSA (Dirgantara)]]
- [[tim-earo|TIM EARO (Dirgantara)]]
- [[tim-efrisa|TIM EFRISA (Dirgantara)]]
- [[tim-emiro|TIM EMIRO (Dirgantara)]]
- [[tim-espyro|TIM ESPYRO (Dirgantara)]]
- [[tim-emosver|TIM EMOSVER (Maritim)]]
`
};

Object.entries(mocFiles).forEach(([name, content]) => {
  fs.writeFileSync(path.join(notesDir, '00-index', name), content, 'utf8');
  console.log(`Created MOC: ${name}`);
});

console.log('Restructuring completed successfully!');
