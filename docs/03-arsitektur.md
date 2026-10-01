# 03. Arsitektur Proyek

> **Tujuan dokumen ini:** Memahami struktur folder, tech stack, dan alur data aplikasi.

## 🏗️ Tech Stack

### Frontend Framework

| Teknologi | Versi | Fungsi |
| :--- | :--- | :--- |
| **React** | 19.0 | Library UI berbasis komponen |
| **TypeScript** | 7.0 | JavaScript + tipe statis |
| **Vite** | 8.3 | Build tool & dev server |

### Styling

| Teknologi | Versi | Fungsi |
| :--- | :--- | :--- |
| **Tailwind CSS** | 4.3 | Utility-first CSS framework |
| **Bootstrap** | 5.3 | Component-based CSS framework |
| **Bootstrap Icons** | 1.13 | Icon library |
| **Lucide React** | 0.546 | Icon library (React components) |

### Graphics & Animation

| Teknologi | Fungsi |
| :--- | :--- |
| **HTML5 Canvas 2D** | Render graph view |
| **Motion** | Animasi (opsional) |

### Build & Deploy

| Teknologi | Fungsi |
| :--- | :--- |
| **Vite** | Build tool |
| **Vercel** | Hosting & deployment |
| **npm** | Package manager |

## 📂 Struktur Folder

```
wiki-pens/
│
├── 📄 File Konfigurasi (root)
│   ├── package.json          → Manifest project (dependencies, scripts)
│   ├── tsconfig.json         → Konfigurasi TypeScript
│   ├── vite.config.ts        → Konfigurasi Vite
│   ├── index.html            → HTML entry point
│   ├── metadata.json         → Metadata untuk AI Studio
│   ├── .env.example          → Template environment variables
│   ├── .gitignore            → File yang diabaikan Git
│   └── README.md             → Dokumentasi utama
│
├── 📁 docs/                  → Dokumentasi lengkap
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
│
├── 📁 public/                → Asset statis (tidak diproses Vite)
│   └── images/               → Gambar
│
└── 📁 src/                   → Kode sumber
    │
    ├── 📄 File Utama
    │   ├── main.tsx          → Entry point React
    │   ├── App.tsx           → Komponen utama
    │   ├── index.css         → Style global
    │   └── types.ts          → Definisi tipe TypeScript
    │
    ├── 📁 components/        → Komponen UI
    │   ├── BacklinksPanel.tsx
    │   ├── CitationModal.tsx
    │   ├── GlobalGraphModal.tsx
    │   ├── HoverPreviewCard.tsx
    │   ├── LeftSidebar.tsx
    │   ├── LocalGraphView.tsx
    │   ├── QuickSearchModal.tsx
    │   ├── TableOfContents.tsx
    │   └── WikilinkRenderer.tsx
    │
    ├── 📁 content/notes/     → Artikel markdown
    │   ├── 00-index/
    │   ├── 01-identitas/
    │   ├── 02-akademik/
    │   ├── 03-kemahasiswaan/
    │   ├── 04-komunitas/
    │   ├── 05-robotika/
    │   └── 06-riset-inovasi/
    │
    └── 📁 utils/             → Fungsi bantu
        └── markdownParser.ts
```

## 🔄 Alur Data (Data Flow)

### Alur Rendering Awal

```
1. User buka https://pens.dejavi.id
   ↓
2. Browser load index.html
   ↓
3. index.html load /src/main.tsx
   ↓
4. main.tsx panggil createRoot().render(<App />)
   ↓
5. React render <App /> ke <div id="root">
   ↓
6. App.tsx useEffect dipanggil:
   ├── loadAllNotes() → baca semua file .md
   ├── Parse frontmatter YAML
   ├── Parse content markdown
   ├── Resolve wikilinks
   ├── Build backlinks
   └── setAllNotes(loaded)
   ↓
7. App.tsx render UI:
   ├── <Header />
   ├── <LeftSidebar allNotes={allNotes} />
   ├── <main>
   │   ├── <WikilinkRenderer content={currentNote.content} />
   │   └── <BacklinksPanel backlinks={currentNote.backlinks} />
   ├── <aside>
   │   ├── <LocalGraphView currentNote={currentNote} />
   │   └── <TableOfContents headings={currentNote.headings} />
   └── Modals (hidden by default)
```

### Alur Navigasi Antar Artikel

```
1. User klik wikilink [[ER2C]]
   ↓
2. WikilinkRenderer onClick handler → handleLinkClick()
   ↓
3. handleLinkClick resolve target → dapat slug 'er2c'
   ↓
4. Panggil onSelectNote('er2c')
   ↓
5. App.tsx handleSelectNote:
   ├── setCurrentSlug('er2c')
   ├── window.location.hash = 'er2c'
   ├── window.scrollTo(0, 0)
   └── setHoveredNote(null)
   ↓
6. State currentSlug berubah → React re-render
   ↓
7. useMemo currentNote dihitung ulang → dapat artikel ER2C
   ↓
8. Semua komponen yang bergantung ke currentNote re-render:
   ├── Main article
   ├── LeftSidebar highlight
   ├── TableOfContents
   ├── LocalGraphView
   └── BacklinksPanel
```

### Alur Graph Simulation

```
1. User buka Global Graph Modal
   ↓
2. useEffect dipanggil:
   ├── buildGraphData(allNotes) → nodes & edges
   ├── Inisialisasi posisi node (radial)
   ├── alpha = 1.0 (simulasi aktif)
   └── runLoop() mulai
   ↓
3. Setiap frame (~60fps):
   ├── physicsTick():
   │   ├── Hitung gaya Coulomb (repulsion)
   │   ├── Hitung gaya Hooke (spring)
   │   ├── Update velocity node
   │   ├── Update posisi node
   │   └── alpha *= 0.965
   └── drawCanvas():
       ├── Clear canvas
       ├── Gambar edges
       └── Gambar nodes
   ↓
4. Ketika alpha < 0.002:
   └── Stop animation frame → CPU 0%
   ↓
5. User drag node:
   ├── alpha = 0.7 → bangunkan simulasi
   └── Simulasi jalan lagi sampai stabil
```

## 🧩 Komponen Overview

### Komponen Utama

| Komponen | Fungsi | State Internal |
| :--- | :--- | :--- |
| `App.tsx` | Komponen root, manage state global | 9+ state |
| `LeftSidebar.tsx` | Sidebar kiri dengan tree navigasi | searchTerm, collapsed |
| `WikilinkRenderer.tsx` | Render markdown + wikilinks | — |
| `BacklinksPanel.tsx` | Panel "disebutkan di halaman lain" | — |
| `TableOfContents.tsx` | Daftar isi dengan scroll spy | activeId |
| `LocalGraphView.tsx` | Graph kecil di sidebar | canvas refs |
| `GlobalGraphModal.tsx` | Graph besar fullscreen | canvas refs |
| `HoverPreviewCard.tsx` | Kartu preview | — |
| `QuickSearchModal.tsx` | Modal pencarian | query, selectedIndex |
| `CitationModal.tsx` | Modal sitasi | copiedFormat |

### Hierarki Komponen

```
<App>
├── <Header>
│   ├── Logo
│   ├── Search button
│   └── Theme toggle
│
├── <Layout 3 kolom>
│   ├── <LeftSidebar>
│   │   ├── <SearchInput>
│   │   └── <CategoryTree>
│   │       └── <SubCategory>
│   │           └── <NoteLink>
│   │
│   ├── <main>
│   │   ├── <Breadcrumb>
│   │   ├── <ArticleHeader>
│   │   ├── <WikilinkRenderer>
│   │   ├── <TagsSection>
│   │   ├── <PrevNextNav>
│   │   ├── <LocalGraphView> (mobile)
│   │   └── <BacklinksPanel>
│   │
│   └── <aside>
│       ├── <LocalGraphView>
│       └── <TableOfContents>
│
└── <Modals>
    ├── <GlobalGraphModal>
    ├── <CitationModal>
    └── <QuickSearchModal>
```

## 🔧 File Konfigurasi Penting

### `package.json`

```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "bootstrap": "^5.3.8",
    "bootstrap-icons": "^1.13.1",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  }
}
```

### `vite.config.ts`

```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
```

**Penjelasan:**
- `plugins: [react(), tailwindcss()]` → aktifkan plugin React & Tailwind
- `alias: { '@': ... }` → alias `@` untuk root folder
- `server.hmr` → Hot Module Replacement

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 📚 Selanjutnya

- [04. Konsep React](04-konsep-react.md) — Belajar React dari nol
- [05. Komponen](05-komponen.md) — Bedah setiap komponen

---

[⬅️ Kembali: Instalasi](02-instalasi.md) | [Selanjutnya: Konsep React ➡️](04-konsep-react.md)
