# 05. Bedah Komponen UI

> **Tujuan dokumen ini:** Memahami setiap komponen di folder `src/components/`.

## 📋 Daftar Komponen

| Komponen | Fungsi | File |
| :--- | :--- | :--- |
| `App` | Komponen root, state global | `App.tsx` |
| `LeftSidebar` | Sidebar navigasi kiri | `LeftSidebar.tsx` |
| `WikilinkRenderer` | Render markdown + wikilinks | `WikilinkRenderer.tsx` |
| `BacklinksPanel` | Panel backlinks | `BacklinksPanel.tsx` |
| `TableOfContents` | Daftar isi | `TableOfContents.tsx` |
| `LocalGraphView` | Graph kecil (sidebar) | `LocalGraphView.tsx` |
| `GlobalGraphModal` | Graph besar (modal) | `GlobalGraphModal.tsx` |
| `HoverPreviewCard` | Kartu preview hover | `HoverPreviewCard.tsx` |
| `QuickSearchModal` | Modal pencarian | `QuickSearchModal.tsx` |
| `CitationModal` | Modal sitasi | `CitationModal.tsx` |
---

## 1. `App.tsx` — Komponen Root

**Fungsi:** Komponen utama yang menyusun seluruh aplikasi dan menyimpan state global.

**State:**

```tsx

const [allNotes, setAllNotes] = useState<NoteItem[]>([]);

const [currentSlug, setCurrentSlug] = useState<string>('beranda');

const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

const [isGlobalGraphOpen, setIsGlobalGraphOpen] = useState(false);

const [isCitationOpen, setIsCitationOpen] = useState(false);

const [isSearchOpen, setIsSearchOpen] = useState(false);

const [isReadingMode, setIsReadingMode] = useState(false);

const [theme, setTheme] = useState<'light' | 'dark'>('light');

const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200);
