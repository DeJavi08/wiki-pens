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
```

### 2. Override di `[data-theme="dark"]`

```css
[data-theme="dark"] {
  /* Dark Theme */
  --wiki-bg: #091422;
  --wiki-surface: #0f243e;
  --wiki-navbar-bg: #071526;
  --wiki-sidebar-bg: #0c1f36;
  --wiki-text-primary: #f8fafc;
  --wiki-text-secondary: #cbd5e1;
  --wiki-brand-accent: #3b82f6;
  --wiki-border: #1a385f;
  /* ... */
}
```

### 3. Pakai Variabel di CSS

```css
body {
  background-color: var(--wiki-bg);
  color: var(--wiki-text-primary);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.navbar {
  background-color: var(--wiki-navbar-bg);
  border-bottom: 1px solid var(--wiki-border);
}
```

### 4. Toggle dari React

```tsx
const [theme, setTheme] = useState<'light' | 'dark'>('light');

const toggleTheme = () => {
  const nextTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(nextTheme);
  document.documentElement.setAttribute('data-theme', nextTheme);
};
```

**Alur:**
1. User klik tombol toggle
2. `setTheme('dark')` update state React
3. `document.documentElement.setAttribute('data-theme', 'dark')` set attribute di `<html>`
4. CSS selector `[data-theme="dark"]` aktif
5. Semua warna otomatis berubah (tanpa reload)

## 🎨 Palet Warna Lengkap

### Light Theme

| Variable | Nilai | Fungsi |
| :--- | :--- | :--- |
| `--wiki-bg` | `#f8fafc` | Background utama |
| `--wiki-surface` | `#ffffff` | Surface (card) |
| `--wiki-navbar-bg` | `#002855` | Navbar (PENS Deep Royal Navy) |
| `--wiki-sidebar-bg` | `#edf4fc` | Sidebar (soft blue) |
| `--wiki-sidebar-border` | `#cde0f5` | Border sidebar |
| `--wiki-sidebar-active-bg` | `#d7e7f8` | Sidebar item aktif |
| `--wiki-sidebar-active-text` | `#034078` | Text sidebar aktif |
| `--wiki-card-bg` | `#ffffff` | Card background |
| `--wiki-border` | `#dbe4ef` | Border umum |
| `--wiki-text-primary` | `#1e293b` | Text utama |
| `--wiki-text-secondary` | `#475569` | Text sekunder |
| `--wiki-text-muted` | `#64748b` | Text redup |
| `--wiki-brand-navy` | `#002855` | Brand navy |
| `--wiki-brand-accent` | `#1d4ed8` | Brand accent (biru) |
| `--wiki-wikilink-color` | `#1d4ed8` | Warna wikilink |
| `--wiki-wikilink-hover` | `#1e40af` | Wikilink hover |
| `--wiki-wikilink-bg` | `rgba(29, 78, 216, 0.08)` | Background wikilink |

### Dark Theme

| Variable | Nilai | Fungsi |
| :--- | :--- | :--- |
| `--wiki-bg` | `#091422` | Background utama (deep midnight) |
| `--wiki-surface` | `#0f243e` | Surface |
| `--wiki-navbar-bg` | `#071526` | Navbar (deepest midnight) |
| `--wiki-sidebar-bg` | `#0c1f36` | Sidebar |
| `--wiki-sidebar-border` | `#18385e` | Border sidebar |
| `--wiki-card-bg` | `#102642` | Card |
| `--wiki-border` | `#1a385f` | Border umum |
| `--wiki-text-primary` | `#f8fafc` | Text utama |
| `--wiki-text-secondary` | `#cbd5e1` | Text sekunder |
| `--wiki-text-muted` | `#829ab1` | Text redup |
| `--wiki-brand-accent` | `#3b82f6` | Brand accent |
| `--wiki-wikilink-color` | `#60a5fa` | Wikilink |
| `--wiki-wikilink-hover` | `#93c5fd` | Wikilink hover |

## 🔄 Deteksi Preferensi Sistem

Browser modern bisa deteksi preferensi user via `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Dark theme variables */
  }
}
```

Atau dari JavaScript:

```tsx
useEffect(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    setTheme('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}, []);
```

## 🎨 Styling dengan Variabel

### Contoh: Card

```css
.card {
  background-color: var(--wiki-card-bg);
  border: 1px solid var(--wiki-border);
  color: var(--wiki-text-primary);
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.card:hover {
  border-color: var(--wiki-card-hover-border);
}
```

### Contoh: Wikilink

```css
.wikilink-badge {
  color: var(--wiki-wikilink-color);
  background-color: var(--wiki-wikilink-bg);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: underline;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.wikilink-badge:hover {
  color: var(--wiki-wikilink-hover);
  background-color: rgba(29, 78, 216, 0.16);
}
```

### Contoh: Callout

```css
.classic-callout {
  border-radius: 6px;
  padding: 0.9rem 1.15rem;
  margin: 1.35rem 0;
  border-left: 3.5px solid;
  background-color: var(--wiki-card-bg);
}

.classic-callout-note {
  border-left-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.06);
}

.classic-callout-tip {
  border-left-color: #059669;
  background-color: rgba(5, 150, 105, 0.06);
}

.classic-callout-warning {
  border-left-color: #d97706;
  background-color: rgba(217, 119, 6, 0.06);
}
```

## 🌈 Palet Warna Kategori

Setiap kategori punya warna:

```tsx
const categoryColorMap = {
  Identitas: '#059669',      // Hijau
  Akademik: '#2563eb',       // Biru
  'Riset & Inovasi': '#7c3aed', // Ungu
  Robotika: '#d97706',       // Oranye
  Kemahasiswaan: '#db2777',  // Pink
};
```

Dipakai di badge:

```tsx
<span
  className="badge"
  style={{
    backgroundColor: `${catColor}15`,  // 15 = opacity 8%
    color: catColor,
  }}
>
  {category}
</span>
```

**Trick `${catColor}15`:** Menambahkan hex opacity di akhir. `15` = 8% opacity (21/255).

## 🎯 Dark Mode Overrides

Beberapa elemen butuh override khusus di dark mode:

```css
[data-theme="dark"] .bg-light {
  background-color: #122844 !important;
  color: #cbd5e1 !important;
  border-color: #1a385f !important;
}

[data-theme="dark"] .text-dark {
  color: #f8fafc !important;
}

[data-theme="dark"] .text-secondary {
  color: #94a3b8 !important;
}

[data-theme="dark"] .btn-outline-secondary {
  border-color: var(--wiki-border) !important;
  color: #cbd5e1 !important;
  background-color: var(--wiki-card-bg) !important;
}

[data-theme="dark"] .btn-outline-secondary:hover {
  background-color: #18385e !important;
  color: #ffffff !important;
  border-color: #2563eb !important;
}

[data-theme="dark"] .form-control {
  background-color: var(--wiki-input-bg) !important;
  color: var(--wiki-input-text) !important;
  border-color: var(--wiki-border) !important;
}

[data-theme="dark"] .modal-content {
  background-color: var(--wiki-card-bg) !important;
  border-color: var(--wiki-border) !important;
  color: #f8fafc !important;
}

[data-theme="dark"] .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}
```

**Kenapa `!important`?** Karena Bootstrap punya style default yang kuat. Kadang perlu `!important` untuk override.

## 🎬 Animasi Transisi

Biar gak "kaget" saat ganti tema:

```css
body {
  transition: background-color 0.2s ease, color 0.2s ease;
}

.card {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.navbar {
  transition: background-color 0.2s ease;
}
```

**Durasi 200ms** — cukup cepat biar gak kerasa lambat, cukup lambat biar halus.

## 🎨 Tips Theming

### 1. Konsisten dengan Nama Variabel

```css
/* ❌ Salah */
--color1: #fff;
--my-color: #fff;
--bgWhite: #fff;

/* ✅ Benar */
--wiki-bg: #fff;
--wiki-surface: #fff;
--wiki-border: #fff;
```

### 2. Grouping Logis

```css
:root {
  /* Background colors */
  --wiki-bg: #f8fafc;
  --wiki-surface: #ffffff;
  --wiki-card-bg: #ffffff;

  /* Text colors */
  --wiki-text-primary: #1e293b;
  --wiki-text-secondary: #475569;
  --wiki-text-muted: #64748b;

  /* Border colors */
  --wiki-border: #dbe4ef;
  --wiki-sidebar-border: #cde0f5;
}
```

### 3. Warna Kontras

Pastikan kontras text vs background memenuhi WCAG AA (minimal 4.5:1 untuk text normal).

**Tool:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 4. Preview Sebelum Commit

Selalu test di light & dark mode sebelum commit. Buka DevTools → Elements → ubah `data-theme` di `<html>`.

## 📚 Selanjutnya

- [09. Menulis Artikel](09-menulis-artikel.md) — Panduan kontribusi
- [10. FAQ](10-faq.md) — Pertanyaan umum

---

[⬅️ Kembali: Graph View](07-graph-view.md) | [Selanjutnya: Menulis Artikel ➡️](09-menulis-artikel.md)
