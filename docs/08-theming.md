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

&#x20; /* Light Theme */

&#x20; --wiki-bg: #f8fafc;

&#x20; --wiki-surface: #ffffff;

&#x20; --wiki-navbar-bg: #002855;

&#x20; --wiki-sidebar-bg: #edf4fc;

&#x20; --wiki-text-primary: #1e293b;

&#x20; --wiki-text-secondary: #475569;

&#x20; --wiki-brand-accent: #1d4ed8;

&#x20; --wiki-border: #dbe4ef;

&#x20; /* ... */

}
