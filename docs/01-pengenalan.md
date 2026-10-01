# 01. Pengenalan PENS Wiki

> **Tujuan dokumen ini:** Memahami apa itu PENS Wiki, latar belakang, dan konsep dasar sebelum masuk ke teknis.

## 📖 Apa itu PENS Wiki?

**PENS Wiki** adalah ensiklopedia digital dan pangkalan pengetahuan terpadu (*knowledge base*) yang mendokumentasikan seluruh ekosistem Politeknik Elektronika Negeri Surabaya (PENS/EEPIS).

Bayangkan **Wikipedia**, tapi:
- ✅ Khusus tentang PENS
- ✅ Terhubung dengan **wikilinks** (seperti Obsidian/Notion)
- ✅ Punya **graph view** yang menampilkan hubungan antar artikel
- ✅ Ada **backlinks** otomatis
- ✅ Bisa dipakai sebagai **digital garden** pribadi atau komunitas

## 🎯 Latar Belakang Proyek

Informasi tentang PENS saat ini tersebar di banyak tempat:

| Sumber | Kelebihan | Kekurangan |
| :--- | :--- | :--- |
| Website resmi PENS | Resmi, terpercaya | Jarang update, sulit dicari |
| Instagram | Update cepat | Tidak terstruktur, sulit dicari |
| Grup WhatsApp | Cepat | Informasi hilang setelah beberapa hari |
| Dokumen PDF | Lengkap | Tidak interaktif, sulit di-link |
| Cerita senior | Autentik | Tidak terdokumentasi |

**PENS Wiki** hadir untuk **menyatukan** semua informasi ini dalam satu platform yang:
- Terstruktur & mudah dicari
- Bisa saling terhubung antar topik
- Mudah dikontribusi siapa pun
- Terbuka & transparan

## 🌟 Konsep Kunci

### 1. Digital Garden

**Digital Garden** adalah pendekatan untuk mengelola catatan yang berbeda dari blog tradisional:

| Blog Tradisional | Digital Garden |
| :--- | :--- |
| Urut berdasarkan tanggal | Urut berdasarkan topik |
| Selesai saat dipublikasikan | Terus tumbuh & berkembang |
| Satu arah (penulis → pembaca) | Dua arah (jaringan pengetahuan) |
| Fokus pada penyelesaian | Fokus pada koneksi |

### 2. Zettelkasten

**Zettelkasten** (bahasa Jerman: "kotak catatan") adalah metode manajemen pengetahuan:
- Setiap catatan = satu ide/konsep
- Catatan saling terhubung dengan tautan
- Munculkan ide baru dari kombinasi catatan lama

Di PENS Wiki, setiap artikel adalah "zettel" (catatan) yang bisa di-link ke artikel lain.

### 3. Bidirectional Links (Backlinks)

Kalau artikel A menulis `[[B]]`:
- **Forward link**: A → B (A menautkan ke B)
- **Backlink**: B ← A (B tahu kalau A menautkannya)

Ini yang membuat PENS Wiki jadi **jaringan pengetahuan**, bukan sekadar kumpulan artikel.

```
Artikel "Sejarah PENS" menulis:
"PENS didirikan dengan bantuan [[JICA]]..."

Maka di artikel "JICA" muncul:
"Disebutkan di: Sejarah PENS"
```

### 4. Map of Content (MOC)

**MOC** adalah artikel khusus yang berfungsi sebagai **peta navigasi** ke topik-topik tertentu.

Contoh MOC di PENS Wiki:
- `MOC-Akademik` → peta semua artikel akademik
- `MOC-Robotika` → peta semua tim robotika
- `MOC-Kemahasiswaan` → peta semua HIMA & UKM

## 🎨 Fitur Unggulan

### 🔗 Wikilinks

Tautan antar artikel dengan format `[[Target]]`. Parser otomatis mendeteksi dan mengubahnya jadi link interaktif.

### 🕸️ Graph View

Visualisasi jaring laba-laba yang menampilkan semua artikel dan hubungannya. Bisa di-drag, zoom, dan filter.

### 🪟 Hover Preview

Arahkan kursor ke wikilink → muncul kartu preview tanpa perlu pindah halaman.

### 🔍 Quick Search

Tekan `Ctrl + K` (atau `Cmd + K` di Mac) → modal pencarian instan.

### 📑 Table of Contents

Daftar isi otomatis dengan scroll spy — heading aktif di-highlight saat kamu scroll.

### 🎓 Citation Generator

Generate sitasi akademik (APA 7th, IEEE, BibTeX) untuk setiap artikel.

### 📖 Zen Reading Mode

Mode baca fokus — sidebar disembunyikan, artikel jadi terpusat.

### 🌗 Dark/Light Theme

Toggle tema dengan satu klik, atau ikuti preferensi sistem.

## 🏗️ Konsep Arsitektur (High Level)

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│  ┌───────────────────────────────────────────────┐  │
│  │           React Application                   │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────┐  │  │
│  │  │Sidebar  │  │  Artikel │  │   Graph     │  │  │
│  │  │Kiri     │  │  Utama   │  │   View      │  │  │
│  │  └─────────┘  └──────────┘  └─────────────┘  │  │
│  │         ↑            ↑            ↑           │  │
│  │         └────────────┼────────────┘           │  │
│  │                      │                        │  │
│  │              ┌───────▼────────┐               │  │
│  │              │  Markdown      │               │  │
│  │              │  Parser        │               │  │
│  │              └───────┬────────┘               │  │
│  │                      │                        │  │
│  │              ┌───────▼────────┐               │  │
│  │              │  File .md      │               │  │
│  │              │  (Artikel)     │               │  │
│  │              └────────────────┘               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Alur data:**
1. File `.md` dibaca oleh parser
2. Parser ekstrak frontmatter + content + wikilinks
3. Data disimpan di state React
4. Komponen render UI berdasarkan state
5. User interaksi → update state → re-render

## 🎯 Siapa yang Cocok Pakai PENS Wiki?

### 1. Mahasiswa Baru PENS
Butuh informasi tentang departemen, kurikulum, UKM, fasilitas? Tinggal cari di PENS Wiki.

### 2. Mahasiswa Aktif
Mau tahu detail tim robotika, HIMA, atau program double degree? Ada semua di sini.

### 3. Dosen & Staf
Butuh referensi cepat tentang sejarah, struktur, atau program kampus?

### 4. Alumni
Ingin nostalgia atau cari informasi untuk networking?

### 5. Calon Mahasiswa
Sedang mempertimbangkan PENS? Pelajari dulu ekosistemnya di sini.

## 🔄 Perbedaan dengan Wiki Lain

| Aspek | PENS Wiki | Wikipedia | MediaWiki |
| :--- | :--- | :--- | :--- |
| **Platform** | React SPA | MediaWiki | MediaWiki |
| **Wikilinks** | `[[Target\|Label]]` | `[[Target\|Label]]` | `[[Target\|Label]]` |
| **Backlinks** | Otomatis | Tidak ada | Butuh ekstensi |
| **Graph View** | Built-in | Tidak ada | Butuh ekstensi |
| **Hover Preview** | Built-in | Butuh gadget | Butuh gadget |
| **Markdown** | ✅ Native | ❌ Wikitext | ❌ Wikitext |
| **Offline** | Bisa (PWA) | ❌ | ❌ |
| **Kecepatan** | Sangat cepat | Sedang | Sedang |

## 📚 Selanjutnya

- [02. Instalasi](02-instalasi.md) — Cara install & jalankan
- [03. Arsitektur](03-arsitektur.md) — Struktur folder & tech stack
- [04. Konsep React](04-konsep-react.md) — Belajar React dari nol

---

[⬅️ Kembali ke README](../README.md) | [Selanjutnya: Instalasi ➡️](02-instalasi.md)
