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
```

**Effect:**
1. Load semua artikel saat mount
2. Deteksi resize layar
3. Deteksi perubahan hash URL
4. Keyboard shortcut Ctrl+K
5. Update SEO dinamis

**Layout:**

```
<header> Navbar </header>
<div 3-kolom>
  <LeftSidebar />
  <main> Artikel </main>
  <aside> Graph + TOC </aside>
</div>
<Modals />
```

**Poin penting:**
- Semua state global di sini
- Komponen anak nerima props & callback
- Layout pakai Bootstrap: `d-flex`, `flex-grow-1`

---

## 2. `LeftSidebar.tsx` — Sidebar Navigasi

**Fungsi:** Menampilkan daftar semua artikel, dikelompokkan per kategori & sub-kategori.

**Fitur:**
- 🔍 Search input untuk filter artikel
- 📁 Collapsible folder per kategori
- 📂 Nested sub-kategori
- 🎯 Highlight artikel aktif
- 📱 Mobile drawer (slide dari kiri)
- 🔢 Badge jumlah backlinks per artikel

**State internal:**

```tsx
const [searchTerm, setSearchTerm] = useState('');
const [selectedTag, setSelectedTag] = useState<string | null>(null);
const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
const [collapsedSubcategories, setCollapsedSubcategories] = useState<Record<string, boolean>>({});
```

**useMemo untuk grouping:**

```tsx
const categories = useMemo(() => {
  const map = {
    Identitas: { directNotes: [], subcategories: {} },
    Akademik: { directNotes: [], subcategories: {} },
    // ...
  };

  allNotes.forEach(note => {
    if (note.slug === 'beranda') return;
    const cat = note.frontmatter.category;
    const sub = note.frontmatter.subcategory;
    if (sub) {
      map[cat].subcategories[sub] = map[cat].subcategories[sub] || [];
      map[cat].subcategories[sub].push(note);
    } else {
      map[cat].directNotes.push(note);
    }
  });

  return map;
}, [allNotes]);
```

**Kenapa useMemo?** Grouping ini berat kalau ada 100+ artikel. Dengan useMemo, cuma dihitung ulang kalau `allNotes` berubah.

**Props:**

```tsx
interface LeftSidebarProps {
  allNotes: NoteItem[];
  currentSlug: string;
  onSelectNote: (slug: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}
```

---

## 3. `WikilinkRenderer.tsx` — Parser Markdown

**Fungsi:** Mengubah teks markdown jadi elemen React, termasuk parsing wikilinks.

**Fitur:**
- Parse heading (`#`, `##`, `###`, `####`)
- Parse wikilink (`[[Target]]`, `[[Target|Label]]`)
- Parse callout (`> [!NOTE]`, `> [!TIP]`)
- Parse blockquote (`> teks`)
- Parse list (`- item`, `1. item`)
- Parse tabel (`| kolom |`)
- Parse gambar (`![alt](url)`)
- Parse formatting inline (`**bold**`, `*italic*`, `` `code` ``)
- Hover preview (desktop)
- Tap preview (mobile)

**Regex wikilink:**

```tsx
const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
```

**Bedah regex:**
- `\[\[` → match literal `[[`
- `([^\]|]+)` → capture group 1: karakter apapun kecuali `]` dan `|`
- `(?:\|([^\]]+))?` → optional: `|` diikuti capture group 2
- `\]\]` → match literal `]]`
- `g` → global (semua match)

**Alur parsing block:**

```
Loop baris demi baris:
├── Baris kosong? → skip
├── Gambar? → render <figure><img></figure>
├── Heading? → render <h1>/<h2>/...
├── Callout? → render <div class="classic-callout">
├── Blockquote? → render <blockquote>
├── Tabel? → render <table>
├── List? → render <ul>/<ol>
└── Sisanya? → render <p> paragraf
```

**Handle hover (desktop):**

```tsx
const handleMouseEnter = (e, targetText) => {
  // Skip di touch device
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const resolved = resolveWikilink(targetText, allNotes);
  if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  hoverTimerRef.current = setTimeout(() => {
    onHoverLink(resolved, { top: rect.bottom, left: rect.left });
  }, 120);  // delay 120ms
};
```

**Handle tap (mobile):**

```tsx
const handleLinkClick = (e, targetText) => {
  e.preventDefault();
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (isTouchDevice) {
    const timeSinceLastTap = Date.now() - lastTapRef.current.time;
    const isSameTarget = lastTapRef.current.target === targetText;

    if (isSameTarget && timeSinceLastTap < 500) {
      // Double tap → buka artikel
      onSelectNote(resolved.slug);
    } else {
      // Single tap → tampilkan preview
      onHoverLink(resolved, { top: rect.bottom, left: rect.left });
    }
  } else {
    // Desktop: klik langsung buka
    onSelectNote(resolved.slug);
  }
};
```

---

## 4. `BacklinksPanel.tsx` — Panel Backlinks

**Fungsi:** Menampilkan artikel mana saja yang menyebut artikel ini.

**Props:**

```tsx
interface BacklinksPanelProps {
  currentTitle: string;
  backlinks: BacklinkMention[];
  onSelectNote: (slug: string) => void;
}
```

**Struktur:**

```tsx
<div className="backlinks-panel mt-5 pt-4 border-top">
  <h5>
    <i className="bi bi-diagram-2"></i>
    Disebutkan di Halaman Lain
    <span className="badge">{backlinks.length} rujukan</span>
  </h5>

  {backlinks.length === 0 ? (
    <div className="text-center">
      Belum ada artikel lain yang menyebutkan...
    </div>
  ) : (
    <div className="row g-3">
      {backlinks.map(item => (
        <div className="col-md-6">
          <div className="card" onClick={() => onSelectNote(item.sourceSlug)}>
            <span className="badge">{item.sourceCategory}</span>
            <h6>{item.sourceTitle}</h6>
            <p>"{item.snippet}"</p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
```

**Grid Bootstrap:**
- `row g-3` → baris dengan gap 3 (16px)
- `col-12 col-md-6` → 1 kolom di mobile, 2 kolom di desktop

---

## 5. `TableOfContents.tsx` — Daftar Isi

**Fungsi:** Menampilkan daftar heading artikel dengan scroll spy.

**Fitur:**
- 📑 List heading H1-H4
- 🎯 Scroll spy — highlight heading aktif saat scroll
- 🎨 Indentasi berdasarkan level heading
- 📊 Card info artikel (kata, waktu baca, tautan)

**Scroll spy:**

```tsx
useEffect(() => {
  const handleScroll = () => {
    const headingElements = headings
      .map(h => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    const scrollPosition = window.scrollY + 120;

    for (let i = headingElements.length - 1; i >= 0; i--) {
      const el = headingElements[i];
      if (el.offsetTop <= scrollPosition) {
        setActiveId(el.id);
        return;
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  return () => window.removeEventListener('scroll', handleScroll);
}, [headings]);
```

**Penjelasan:**
- Loop dari heading terakhir ke pertama
- Cari heading yang `offsetTop <= scrollPosition + 120`
- Set sebagai aktif
- `{ passive: true }` → optimasi performa scroll

---

## 6. `LocalGraphView.tsx` — Graph Kecil

**Fungsi:** Menampilkan graph mini di sidebar kanan.

**Fitur:**
- 🕸️ Canvas 2D
- 🎯 Hanya tampilkan node sekitar (current + tetangga)
- 🖱️ Drag node
- 🔍 Zoom dengan scroll
- 🎨 Tema gelap/terang

**Konsep:**
- Node = artikel
- Edge = wikilink
- Simulasi fisika: Hooke's Law (pegas) + Coulomb Repulsion (tolak-menolak)

Detail lengkap di [07. Graph View](07-graph-view.md).

---

## 7. `GlobalGraphModal.tsx` — Graph Besar

**Fungsi:** Menampilkan seluruh graph dalam modal fullscreen.

**Fitur tambahan:**
- 🔍 Filter kategori
- 🔎 Search node
- 🏷️ Toggle label
- ⏸️ Pause/resume simulasi
- 🎯 Zoom controls (+/-, reset, fit screen)

**Filter:**

```tsx
const [selectedCategory, setSelectedCategory] = useState('all');
const [searchFilter, setSearchFilter] = useState('');
```

**Kategori filter:**
- All, Identitas, Akademik, Riset & Inovasi, Robotika, Kemahasiswaan, Komunitas

---

## 8. `HoverPreviewCard.tsx` — Kartu Preview

**Fungsi:** Kartu yang muncul saat hover wikilink.

**Fitur:**
- 📄 Judul & ringkasan artikel
- 🏷️ Badge kategori
- ⏱️ Waktu baca
- 📊 Jumlah tautan keluar/masuk
- 📱 Responsif (mobile: dengan backdrop)
- 🎯 Position fixed biar gak ke-clip parent

**Positioning:**

```tsx
let top = position.top + 8;
let left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, position.left - 20));

// Kalau overflow bottom, munculkan di atas
if (top + 220 > window.innerHeight) {
  top = Math.max(60, position.top - 210);
}
```

---

## 9. `QuickSearchModal.tsx` — Modal Pencarian

**Fungsi:** Modal pencarian instan (Ctrl+K).

**Fitur:**
- 🔍 Filter judul, summary, tag, alias
- ⬆️⬇️ Navigasi dengan arrow key
- ↵ Enter buka artikel
- ⎋ Esc tutup
- 🎯 Auto-focus input saat dibuka

**Filter:**

```tsx
const filteredNotes = useMemo(() => {
  if (!query.trim()) {
    return allNotes.filter(n => n.frontmatter.featured).slice(0, 7);
  }

  const q = query.toLowerCase();
  return allNotes.filter(n => (
    n.frontmatter.title.toLowerCase().includes(q) ||
    n.frontmatter.summary.toLowerCase().includes(q) ||
    n.frontmatter.category.toLowerCase().includes(q) ||
    n.frontmatter.tags?.some(t => t.toLowerCase().includes(q)) ||
    n.frontmatter.aliases?.some(a => a.toLowerCase().includes(q))
  )).slice(0, 10);
}, [allNotes, query]);
```

**Keyboard navigation:**

```tsx
const handleKeyDown = (e) => {
  if (e.key === 'ArrowDown') {
    setSelectedIndex(prev => (prev + 1) % filteredNotes.length);
  } else if (e.key === 'ArrowUp') {
    setSelectedIndex(prev => (prev - 1 + filteredNotes.length) % filteredNotes.length);
  } else if (e.key === 'Enter') {
    onSelectNote(filteredNotes[selectedIndex].slug);
    onClose();
  } else if (e.key === 'Escape') {
    onClose();
  }
};
```

---

## 10. `CitationModal.tsx` — Modal Sitasi

**Fungsi:** Generate sitasi akademik (APA, IEEE, BibTeX).

**Format:**
- **APA 7th Edition**: `Penulis. (Tahun). Judul. Nama Situs. URL`
- **IEEE**: `[1] Penulis, "Judul," Nama Situs, Tahun. [Online]. Available: URL`
- **BibTeX**: Format untuk LaTeX

**Fitur:**
- 📋 Copy ke clipboard per format
- ✅ Feedback "Tersalin!" setelah copy

---

## 📚 Selanjutnya

- [06. Markdown Parser](06-markdown-parser.md) — Cara kerja parser
- [07. Graph View](07-graph-view.md) — Simulasi fisika

---

[⬅️ Kembali: Konsep React](04-konsep-react.md) | [Selanjutnya: Markdown Parser ➡️](06-markdown-parser.md)
