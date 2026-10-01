<div align="center">

<img src="https://upload.wikimedia.org/wikipedia/id/4/44/Logo_PENS.png" alt="Logo PENS" width="110" height="110" />

# PENS Wiki (Ensiklopedia Digital PENS)
**Pangkalan Pengetahuan Terpadu Politeknik Elektronika Negeri Surabaya Berbasis Obsidian Markdown & Interactive Relation Graph**

### 🌐 Live Demo
**[pens.dejavi.id](https://pens.dejavi.id)** &nbsp;•&nbsp; **[wiki-pens.vercel.app](https://wiki-pens.vercel.app)**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square)](https://tailwindcss.com/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white&style=flat-square)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](LICENSE)

<p align="center">
  <a href="#-tentang-proyek">Tentang</a> •
  <a href="#-fitur-utama">Fitur Utama</a> •
  <a href="#-arsitektur-teknologi">Tech Stack</a> •
  <a href="#-struktur-direktori">Struktur Direktori</a> •
  <a href="#-cara-menjalankan-secara-lokal">Memulai</a> •
  <a href="#-panduan-kontribusi-artikel">Kontribusi</a>
</p>

</div>

---

## 📖 Tentang Proyek

**PENS Wiki** adalah ensiklopedia digital modern dan pangkalan pengetahuan terpadu (*digital garden / knowledge base*) yang mendokumentasikan ekosistem **Politeknik Elektronika Negeri Surabaya (PENS / EEPIS)** secara komprehensif.

Aplikasi ini mengintegrasikan seluruh arsip sejarah JICA (1988), struktur departemen vokasi (DTE, DTIK, DTME, DTMK, Pascasarjana Terapan, PSDKU), panduan akademik & SKEM, armada riset robotika legendaris (ER2C, EROS, ERSOW, EIRA, Dirgantara, Maritim), hingga puluhan UKM dan komunitas mahasiswa dalam jejaring berkas Markdown lokal yang saling terhubung secara dua arah (*bidirectional links*).

> 🔗 **Coba sekarang:** [pens.dejavi.id](https://pens.dejavi.id) — mirror: [wiki-pens.vercel.app](https://wiki-pens.vercel.app)

---

## ✨ Fitur Utama

- 🔗 **Wikilinks & Bidirectional Backlinks (`[[Topik]]`)**: Penautan non-linear antar artikel dengan penyelesaian alias otomatis (`[[Target|Label]]`) serta panel pelacak rujukan timbal balik (*mentions*).
- 🕸️ **Interactive Graph View (Obsidian Vault Engine)**:
  - **Local Graph Canvas**: Peta visual keterhubungan artikel aktif dengan tetangga terdekat secara dinamis.
  - **Global Graph Modal**: Visualisasi jaring laba-laba global seluruh dokumen dengan simulasi pegas elastis (*Hooke's Law & Coulomb Repulsion*), kontrol zoom, panning, dan filter kategori.
- 🪟 **Hover Preview Card**: Popover cerdas yang menampilkan intisari, waktu baca, dan metadata artikel saat kursor mengarah (*hover*) ke tautan tanpa perlu berpindah halaman.
- 🔍 **Instant Quick Search (`Ctrl + K` / `Cmd + K`)**: Modal pencarian instan berkecepatan tinggi yang menyaring judul, ringkasan eksekutif, tag, dan alias dokumen.
- 📑 **Daftar Isi Otomatis (Dynamic Table of Contents)**: Pemetaan heading (H1–H4) dengan indikator posisi gulir aktif secara *real-time*.
- 🎓 **Generator Sitasi Ilmiah**: Pembuatan format kutipan artikel otomatis dalam standar akademik **APA (7th Edition)**, **IEEE**, dan **BibTeX**.
- 📖 **Zen Reading Mode**: Mode baca fokus editorial yang menyembunyikan bilah sisi kiri & kanan dalam satu klik.
- 🌗 **Tema Gelap & Terang (PENS Blue & Midnight Navy)**: Palet warna editorial profesional dengan adaptasi otomatis ke preferensi sistem (*color-scheme*).

---

## 🛠️ Arsitektur Teknologi

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Rendering antarmuka komponen fungsional modern |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | Pengetikan statis ketat untuk kestabilan kode |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | *Bundler* ultra-cepat dengan Hot Module Replacement (HMR) |
| **Styling** | Tailwind CSS v4 & Bootstrap 5 | Integrasi utilitas CSS modern dan komponen responsif |
| **Ikonografi** | Bootstrap Icons & Lucide React | Visualisasi ikon status dan folder navigasi |
| **Canvas Engine** | HTML5 Canvas 2D API | Simulasi graf fisika mandiri tanpa dependensi berat |
| **Deployment** | [Vercel](https://vercel.com/) | Hosting produksi dengan auto-deploy dari branch `main` |

---

## 📂 Struktur Direktori

```text
└── dejavi08-wiki-pens/
    ├── README.md
    ├── index.html
    ├── metadata.json
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── .env.example
    └── src/
        ├── App.tsx
        ├── index.css
        ├── main.tsx
        ├── types.ts
        ├── components/
        │   ├── BacklinksPanel.tsx
        │   ├── CitationModal.tsx
        │   ├── GlobalGraphModal.tsx
        │   ├── HoverPreviewCard.tsx
        │   ├── LeftSidebar.tsx
        │   ├── LocalGraphView.tsx
        │   ├── QuickSearchModal.tsx
        │   ├── TableOfContents.tsx
        │   └── WikilinkRenderer.tsx
        ├── content/
        │   └── notes/
        │       ├── akademik/
        │       │   ├── departemen-dte.md
        │       │   ├── departemen-dtik.md
        │       │   ├── departemen-dtme.md
        │       │   ├── departemen-dtmk.md
        │       │   ├── program-pascasarjana.md
        │       │   ├── psdku-pens.md
        │       │   ├── internasional/
        │       │   │   └── panduan-double-degree-pico.md
        │       │   ├── layanan/
        │       │   │   └── fasilitas-dan-layanan-digital.md
        │       │   └── peraturan/
        │       │       ├── aturan-akademik-dan-evaluasi.md
        │       │       └── panduan-lengkap-skem.md
        │       ├── identitas/
        │       │   ├── beranda.md
        │       │   ├── identitas-kelembagaan.md
        │       │   ├── infrastruktur-kampus.md
        │       │   └── sejarah-pendirian.md
        │       ├── kemahasiswaan/
        │       │   ├── hima-ce.md
        │       │   ├── hima-elin.md
        │       │   ├── hima-elka.md
        │       │   ├── hima-energi.md
        │       │   ├── hima-meka.md
        │       │   ├── hima-mmb.md
        │       │   ├── hima-telkom.md
        │       │   ├── himit.md
        │       │   ├── himpunan-mahasiswa-pens.md
        │       │   ├── km-pens.md
        │       │   ├── ukm-ent.md
        │       │   ├── tata-kelola/
        │       │   │   ├── rekrutmen-kaderisasi.md
        │       │   │   └── sistem-layanan-kemahasiswaan.md
        │       │   ├── ukm-kerohanian/
        │       │   │   ├── ukm-uk3.md
        │       │   │   └── ukm-ukki.md
        │       │   ├── ukm-olahraga/
        │       │   │   ├── ukm-badminton.md
        │       │   │   ├── ukm-basket.md
        │       │   │   ├── ukm-futsal.md
        │       │   │   ├── ukm-karate.md
        │       │   │   ├── ukm-mahetala.md
        │       │   │   ├── ukm-pencak-silat.md
        │       │   │   ├── ukm-taekwondo.md
        │       │   │   ├── ukm-tenis-meja.md
        │       │   │   └── ukm-voli.md
        │       │   ├── ukm-penalaran/
        │       │   │   ├── ukm-dirgantara.md
        │       │   │   ├── ukm-e-trans.md
        │       │   │   ├── ukm-e2c.md
        │       │   │   ├── ukm-gamespace.md
        │       │   │   ├── ukm-mhe.md
        │       │   │   ├── ukm-roboholic.md
        │       │   │   ├── ukm-softdev.md
        │       │   │   └── ukm-tekkes.md
        │       │   └── ukm-seni/
        │       │       ├── ukm-cinemascope.md
        │       │       ├── ukm-frens.md
        │       │       ├── ukm-musik.md
        │       │       ├── ukm-psm.md
        │       │       ├── ukm-tari.md
        │       │       └── ukm-usi.md
        │       ├── komunitas/
        │       │   ├── minat-khusus/
        │       │   │   ├── komunitas-bridge.md
        │       │   │   ├── komunitas-janaka.md
        │       │   │   ├── komunitas-sahabat-bahasa.md
        │       │   │   └── komunitas-sre.md
        │       │   └── teknologi/
        │       │       ├── komunitas-gdgoc.md
        │       │       ├── komunitas-pens-esport.md
        │       │       └── komunitas-pensmate.md
        │       ├── riset-inovasi/
        │       │   ├── dewan-guru-besar.md
        │       │   ├── ekosistem-inovasi.md
        │       │   ├── er2c.md
        │       │   └── lab-kontrol-cerdas.md
        │       └── robotika/
        │           ├── tim-bamantara-eepisat.md
        │           ├── tim-effiro.md
        │           ├── tim-eilero.md
        │           ├── tim-eira.md
        │           ├── tim-erisa.md
        │           ├── tim-eros.md
        │           ├── tim-ersow.md
        │           ├── tim-eternos.md
        │           ├── tim-penship-emaver.md
        │           ├── dirgantara/
        │           │   ├── tim-caksa.md
        │           │   ├── tim-earo.md
        │           │   ├── tim-efrisa.md
        │           │   ├── tim-emiro.md
        │           │   └── tim-espyro.md
        │           └── maritim/
        │               └── tim-emosver.md
        └── utils/
            └── markdownParser.ts
```

---

## 🚀 Cara Menjalankan Secara Lokal

Pastikan Anda telah menginstal **Node.js** (versi 18.x atau lebih baru) dan **npm** di komputer Anda.

### 1. Kloning Repositori

```bash
git clone https://github.com/dejavi08/wiki-pens.git
cd wiki-pens
```

### 2. Pasang Dependensi

```bash
npm install
```

### 3. Konfigurasi Lingkungan (Opsional)

Salin berkas konfigurasi lingkungan jika menggunakan kapabilitas tambahan:

```bash
cp .env.example .env.local
```

### 4. Jalankan Server Pengembangan

```bash
npm run dev
```

Akses aplikasi melalui peramban web di alamat: **http://localhost:3000**

### 5. Kompilasi Produksi

Untuk menguji hasil kompilasi produksi (*production build*):

```bash
npm run build
npm run preview
```

---

## 🌐 Deployment

Proyek ini di-deploy secara otomatis melalui **[Vercel](https://vercel.com/)** setiap kali ada push ke branch `main`.

| Environment | URL |
| :--- | :--- |
| **Production (Primary)** | [pens.dejavi.id](https://pens.dejavi.id) |
| **Production (Mirror)** | [wiki-pens.vercel.app](https://wiki-pens.vercel.app) |

---

## 📝 Panduan Kontribusi Artikel

Setiap catatan artikel disimpan dalam folder `src/content/notes/` berformat Markdown standar dengan **YAML frontmatter**:

```markdown
---
title: "Nama Artikel atau Topik"
slug: "nama-artikel-unik"
category: "Akademik"
subcategory: "Departemen & Vokasi"
tags: ["PENS", "Vokasi", "Teknologi"]
aliases: ["Nama Lain", "Singkatan"]
updated: "2026-09-30"
summary: "Ringkasan eksekutif dokumen dalam 1-2 kalimat padat."
icon: "bi-journal-code"
featured: false
---

# Nama Artikel

Teks isi artikel menggunakan format Markdown standar.

Anda dapat menautkan ke dokumen lain menggunakan format Wikilink:
- Menautkan langsung: [[Departemen Teknik Elektro (DTE)]]
- Menautkan dengan label kustom: [[Pusat Riset ER2C|Pusat Riset Robotika]]

> [!NOTE]
> Mendukung callout boxes seperti [!NOTE], [!INFO], [!TIP], dan [!WARNING].
```

---

## 📜 Lisensi & Atribusi

Proyek ini dilisensikan di bawah ketentuan **Apache License 2.0**.

Konten dokumentasi dan lambang resmi merupakan hak cipta sivitas akademika **Politeknik Elektronika Negeri Surabaya (PENS)**.

<div align="center">
<sub>Dibangun dengan dedikasi untuk sivitas akademika Politeknik Elektronika Negeri Surabaya. <strong>PENS JOSS!</strong></sub>
</div>
