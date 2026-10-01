<div align="center">

<img src="https://upload.wikimedia.org/wikipedia/id/4/44/Logo_PENS.png" alt="Logo PENS" width="120" height="120" />

# PENS Wiki

### Ensiklopedia Digital Politeknik Elektronika Negeri Surabaya

**Pangkalan pengetahuan terpadu berbasis Obsidian Markdown & Interactive Relation Graph**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white&style=flat-square)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](LICENSE)

### 🌐 Live Demo

**[pens.dejavi.id](https://pens.dejavi.id)** &nbsp;•&nbsp; **[wiki-pens.vercel.app](https://wiki-pens.vercel.app)**

[📖 Dokumentasi](docs/) &nbsp;•&nbsp;
[🚀 Instalasi](docs/02-instalasi.md) &nbsp;•&nbsp;
[🏗️ Arsitektur](docs/03-arsitektur.md) &nbsp;•&nbsp;
[📝 Menulis Artikel](docs/09-menulis-artikel.md) &nbsp;•&nbsp;
[❓ FAQ](docs/10-faq.md)

</div>

---

## 📸 Screenshot Demo

<div align="center">

<img src="https://raw.githubusercontent.com/DeJavi08/wiki-pens/refs/heads/main/public/images/demo.png" alt="PENS Wiki — Demo Screenshot" width="100%" />

</div>

---

## 📖 Tentang Proyek

**PENS Wiki** adalah ensiklopedia digital modern dan pangkalan pengetahuan terpadu (*digital garden / knowledge base*) yang mendokumentasikan ekosistem **Politeknik Elektronika Negeri Surabaya (PENS/EEPIS)** secara komprehensif.

Aplikasi ini mengintegrasikan seluruh arsip sejarah JICA (1988), struktur departemen vokasi (DTE, DTIK, DTME, DTMK, Pascasarjana Terapan, PSDKU), panduan akademik & SKEM, armada riset robotika legendaris (ER2C, EROS, ERSOW, EIRA, Dirgantara, Maritim), hingga puluhan UKM dan komunitas mahasiswa dalam jejaring berkas Markdown lokal yang saling terhubung secara dua arah (*bidirectional links*).

### 🎯 Tujuan Proyek

- **Sentralisasi Informasi**: Menyatukan seluruh informasi PENS yang tersebar di berbagai platform
- **Knowledge Graph**: Menampilkan hubungan antar topik secara visual
- **Open Contribution**: Siapa pun bisa berkontribusi menulis artikel
- **Modern Tech Stack**: Menggunakan teknologi web terkini (React 19, TypeScript, Vite)
- **Obsidian-like Experience**: Pengalaman menjelajah pengetahuan seperti di aplikasi Obsidian

---

## ✨ Fitur Utama

### 🔗 Wikilinks & Bidirectional Backlinks

Penautan non-linear antar artikel dengan format `[[Target]]` atau `[[Target|Label]]`. Parser otomatis mendeteksi wikilink dan menampilkan panel backlinks (artikel mana saja yang menyebut artikel ini).

```
Format penulisan:
[[Sejarah Pendirian]]           → tautan langsung
[[sejarah-pendirian|Sejarah]]   → tautan dengan label kustom
```

### 🕸️ Interactive Graph View

- **Local Graph Canvas**: Peta visual keterhubungan artikel aktif dengan tetangga terdekat
- **Global Graph Modal**: Visualisasi jaring laba-laba seluruh dokumen dengan simulasi fisika *Hooke's Law & Coulomb Repulsion*
- Kontrol zoom, panning, drag node, filter kategori

### 🪟 Hover Preview Card

Popover cerdas yang menampilkan intisari, waktu baca, dan metadata artikel saat kursor mengarah ke tautan — tanpa perlu berpindah halaman.

### 🔍 Instant Quick Search (`Ctrl + K`)

Modal pencarian instan berkecepatan tinggi yang menyaring judul, ringkasan eksekutif, tag, dan alias dokumen.

### 📑 Daftar Isi Otomatis

Pemetaan heading (H1–H4) dengan indikator posisi gulir aktif secara *real-time* (scroll spy).

### 🎓 Generator Sitasi Ilmiah

Pembuatan format kutipan artikel otomatis dalam standar akademik **APA (7th Edition)**, **IEEE**, dan **BibTeX**.

### 📖 Zen Reading Mode

Mode baca fokus editorial yang menyembunyikan bilah sisi kiri & kanan dalam satu klik.

### 🌗 Tema Gelap & Terang

Palet warna editorial profesional dengan adaptasi otomatis ke preferensi sistem.

---

## 🛠️ Arsitektur Teknologi

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Rendering antarmuka komponen fungsional modern |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | Pengetikan statis ketat untuk kestabilan kode |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | *Bundler* ultra-cepat dengan HMR |
| **Styling** | Tailwind CSS v4 & Bootstrap 5 | Integrasi utilitas CSS modern & komponen responsif |
| **Ikonografi** | Bootstrap Icons & Lucide React | Visualisasi ikon status dan navigasi |
| **Canvas Engine** | HTML5 Canvas 2D API | Simulasi graf fisika mandiri tanpa dependensi berat |
| **Deployment** | [Vercel](https://vercel.com/) | Hosting produksi dengan auto-deploy |

---

## 📂 Struktur Direktori

```text
wiki-pens/
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── docs/                        # Dokumentasi lengkap
│   ├── 01-pengenalan.md
│   ├── 02-instalasi.md
│   ├── 03-arsitektur.md
│   ├── 04-konsep-react.md
│   ├── 05-komponen.md
│   ├── 06-markdown-parser.md
│   ├── 07-graph-view.md
│   ├── 08-theming.md
│   ├── 09-menulis-artikel.md
│   └── 10-faq.md
└── src/
    ├── App.tsx                  # Komponen utama
    ├── main.tsx                 # Entry point
    ├── index.css                # Style global
    ├── types.ts                 # Definisi tipe TypeScript
    ├── components/              # Komponen UI
    │   ├── BacklinksPanel.tsx
    │   ├── CitationModal.tsx
    │   ├── GlobalGraphModal.tsx
    │   ├── HoverPreviewCard.tsx
    │   ├── LeftSidebar.tsx
    │   ├── LocalGraphView.tsx
    │   ├── QuickSearchModal.tsx
    │   ├── TableOfContents.tsx
    │   └── WikilinkRenderer.tsx
    ├── content/notes/           # Artikel markdown
    │   ├── 00-index/
    │   ├── 01-identitas/
    │   ├── 02-akademik/
    │   ├── 03-kemahasiswaan/
    │   ├── 04-komunitas/
    │   ├── 05-robotika/
    │   └── 06-riset-inovasi/
    └── utils/
        └── markdownParser.ts    # Parser markdown + wikilinks
```

---

## 🚀 Quick Start

### Prasyarat

- **Node.js** versi 18.x atau lebih baru — [Download](https://nodejs.org/)
- **npm** (biasanya sudah include dengan Node.js)
- **Git** — [Download](https://git-scm.com/)

### Instalasi Cepat

```bash
# 1. Clone repository
git clone https://github.com/dejavi08/wiki-pens.git
cd wiki-pens

# 2. Install dependencies
npm install

# 3. Konfigurasi environment (opsional)
cp .env.example .env.local

# 4. Jalankan development server
npm run dev
```

Buka **http://localhost:3000** di browser.

### Build Produksi

```bash
npm run build     # Build untuk produksi
npm run preview   # Preview hasil build
```

📖 **Panduan instalasi lengkap:** [docs/02-instalasi.md](docs/02-instalasi.md)

---

## 📚 Dokumentasi

| Dokumen | Deskripsi |
| :--- | :--- |
| [01. Pengenalan](docs/01-pengenalan.md) | Apa itu PENS Wiki dan konsep dasarnya |
| [02. Instalasi](docs/02-instalasi.md) | Cara install & jalankan di lokal |
| [03. Arsitektur](docs/03-arsitektur.md) | Struktur folder, tech stack, dan alur data |
| [04. Konsep React](docs/04-konsep-react.md) | Belajar React dari nol untuk proyek ini |
| [05. Komponen](docs/05-komponen.md) | Bedah setiap komponen UI |
| [06. Markdown Parser](docs/06-markdown-parser.md) | Cara kerja parser markdown & wikilinks |
| [07. Graph View](docs/07-graph-view.md) | Simulasi fisika pada graph visualization |
| [08. Theming](docs/08-theming.md) | Sistem tema dark/light dengan CSS Variables |
| [09. Menulis Artikel](docs/09-menulis-artikel.md) | Panduan kontribusi artikel markdown |
| [10. FAQ](docs/10-faq.md) | Pertanyaan yang sering diajukan |

---

## 📝 Cara Kontribusi

Kami menerima kontribusi dari siapa pun! Baik itu menambah artikel baru, memperbaiki bug, atau meningkatkan fitur.

### Langkah Kontribusi

1. **Fork** repository ini
2. **Clone** fork-mu: `git clone https://github.com/USERNAME/wiki-pens.git`
3. **Buat branch** baru: `git checkout -b fitur-baru`
4. **Commit** perubahan: `git commit -m "Menambah artikel X"`
5. **Push** ke branch: `git push origin fitur-baru`
6. **Buat Pull Request** di GitHub

📖 **Panduan kontribusi lengkap:** [CONTRIBUTING.md](CONTRIBUTING.md)

### Menulis Artikel Baru

Lihat panduan lengkap di [docs/09-menulis-artikel.md](docs/09-menulis-artikel.md).

Contoh template artikel:

```markdown
---
title: "Judul Artikel"
slug: "judul-artikel"
category: "Akademik"
subcategory: "Departemen & Vokasi"
tags: ["PENS", "Vokasi"]
aliases: ["Nama Lain", "Singkatan"]
updated: "2026-09-30"
summary: "Ringkasan eksekutif dokumen dalam 1-2 kalimat."
icon: "bi-journal-code"
featured: false
---

# Judul Artikel

Isi artikel dalam format Markdown standar.

Tautkan ke artikel lain dengan format wikilink:
- [[Departemen Teknik Elektro (DTE)]]
- [[Pusat Riset ER2C|Pusat Riset Robotika]]

> [!NOTE]
> Mendukung callout boxes seperti [!NOTE], [!INFO], [!TIP], [!WARNING].
```

---

## 🗺️ Roadmap

- [x] Wikilinks & bidirectional backlinks
- [x] Interactive graph view (local & global)
- [x] Hover preview card
- [x] Quick search (Ctrl+K)
- [x] Table of contents dengan scroll spy
- [x] Citation generator (APA/IEEE/BibTeX)
- [x] Zen reading mode
- [x] Dark/light theme
- [ ] Full-text search dengan indexing
- [ ] Export ke PDF
- [ ] Multi-bahasa (Indonesia/Inggris)
- [ ] PWA (Progressive Web App)
- [ ] Offline mode
- [ ] Comment system

---

## 🤝 Kontributor

Terima kasih kepada semua yang telah berkontribusi:

<a href="https://github.com/dejavi08/wiki-pens/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=dejavi08/wiki-pens" />
</a>

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah **Apache License 2.0** — lihat file [LICENSE](LICENSE) untuk detail.

Konten dokumentasi dan lambang resmi merupakan hak cipta sivitas akademika **Politeknik Elektronika Negeri Surabaya (PENS)**.

---

<div align="center">

**Dibangun dengan dedikasi untuk sivitas akademika Politeknik Elektronika Negeri Surabaya.**

### PENS JOSS! 🚀

<sub>⭐ Jangan lupa kasih bintang kalau proyek ini bermanfaat!</sub>

</div>
