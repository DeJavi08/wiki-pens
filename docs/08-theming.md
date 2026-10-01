# 08. Sistem Theming (Dark/Light Mode)

> **Tujuan dokumen ini:** Memahami cara kerja sistem tema dark/light dengan CSS Variables.

## 🎨 Konsep Theming

PENS Wiki punya dua tema:

- ☀️ **Light Mode** — Terang, default

- 🌙 **Dark Mode** — Gelap, untuk mata nyaman malam

Theming pakai **CSS Variables** + **data attribute**. Ini teknik modern yang:

- ✅ Cepat (gak perlu ganti class satu-satu)

- ✅ Ringan (gak perlu library)

- ✅ Fleksibel (gampang tambah tema baru)

## 🔧 Cara Kerja

### 1. Definisi Variabel di `:root`

```css

:root {

  /* Light Theme */

  --wiki-bg: #f8fafc;

  --wiki-surface: #ffffff;

  --wiki-navbar-bg: #002855;

  --wiki-sidebar-bg: #edf4fc;

  --wiki-text-primary: #1e293b;

  --wiki-text-secondary: #475569;

  --wiki-brand-accent: #1d4ed8;

  --wiki-border: #dbe4ef;

  /* ... */

}
