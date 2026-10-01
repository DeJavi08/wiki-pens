# 06. Markdown Parser & Wikilinks

> **Tujuan dokumen ini:** Memahami cara kerja parser markdown dan sistem wikilinks.

## 📖 Apa itu Markdown?

**Markdown** adalah bahasa markup ringan untuk menulis dokumen dengan format tertentu.

```markdown
# Heading 1
## Heading 2

Ini paragraf biasa.

- Item list
- Item lain

**Bold** dan *italic*.

[Link](https://example.com)

> Blockquote
```

## 🎯 Fitur Parser PENS Wiki

Parser PENS Wiki mendukung:

| Fitur | Sintaks | Output |
| :--- | :--- | :--- |
| Heading | `# H1`, `## H2` | `<h1>`, `<h2>` |
| Bold | `**teks**` | `<strong>teks</strong>` |
| Italic | `*teks*` | `<em>teks</em>` |
| Code | `` `teks` `` | `<code>teks</code>` |
| Link | `[teks](url)` | `<a href="url">teks</a>` |
| Wikilink | `[[Target]]` | `<a>Target</a>` |
| Gambar | `![alt](url)` | `<img src="url" alt="alt">` |
| Blockquote | `> teks` | `<blockquote>teks</blockquote>` |
| Callout | `> [!NOTE]` | `<div class="callout">` |
| List | `- item`, `1. item` | `<ul>`, `<ol>` |
| Tabel | `\| kolom \|` | `<table>` |
| Horizontal Rule | `---` | `<hr>` |

## 📄 Frontmatter YAML

Setiap artikel markdown diawali dengan **frontmatter YAML** di antara `---`:

```markdown
---
title: "Sejarah Pendirian PENS"
slug: "sejarah-pendirian"
category: "Identitas"
subcategory: "Profil & Kelembagaan"
tags: ["Sejarah", "JICA", "Tokyo Tech"]
aliases: ["Sejarah PENS", "PET", "PES"]
updated: "2026-09-30"
summary: "Monografi historis perjalanan PENS..."
icon: "bi-hourglass-split"
featured: false
---

# Sejarah Pendirian PENS

Isi artikel...
```

**Field frontmatter:**

| Field | Tipe | Wajib | Keterangan |
| :--- | :--- | :--- | :--- |
| `title` | String | ✅ | Judul artikel |
| `slug` | String | ✅ | ID unik untuk URL |
| `category` | String | ✅ | Kategori (untuk sidebar) |
| `subcategory` | String | ❌ | Sub-kategori |
| `tags` | Array | ❌ | Tag pencarian |
| `aliases` | Array | ❌ | Nama lain (untuk wikilink) |
| `updated` | String | ❌ | Tanggal update |
| `summary` | String | ❌ | Ringkasan (untuk preview) |
| `author` | String | ❌ | Penulis |
| `icon` | String | ❌ | Bootstrap icon class |
| `featured` | Boolean | ❌ | Tampil di search? |

## 🔗 Wikilinks

### Format Dasar

```
[[Target]]              → Tautan langsung
[[Target|Label]]        → Tautan dengan label kustom
[[slug-artikel]]        → Tautan via slug
```

### Cara Kerja

1. Parser scan teks, cari pola `[[...]]` pakai regex
2. Untuk setiap match:
   - Extract `target` dan `alias`
   - Cari artikel dengan:
     - Slug yang cocok
     - Judul yang cocok
     - Alias yang cocok
3. Render sebagai `<a>` dengan styling khusus

### Resolusi Wikilink

```tsx
export function resolveWikilink(target: string, allNotes: NoteItem[]): NoteItem | null {
  const normalizedTarget = target.toLowerCase().trim();

  // 1. Cari berdasarkan slug
  let found = allNotes.find(n => n.slug.toLowerCase() === normalizedTarget);
  if (found) return found;

  // 2. Cari berdasarkan judul
  found = allNotes.find(n => n.frontmatter.title.toLowerCase() === normalizedTarget);
  if (found) return found;

  // 3. Cari berdasarkan alias
  for (const note of allNotes) {
    if (note.frontmatter.aliases?.some(a => a.toLowerCase() === normalizedTarget)) {
      return note;
    }
  }

  // 4. Cari berdasarkan partial match
  found = allNotes.find(n =>
    n.frontmatter.title.toLowerCase().includes(normalizedTarget) ||
    n.slug.toLowerCase().includes(normalizedTarget)
  );

  return found || null;
}
```

### Contoh Resolusi

Artikel:
```markdown
---
title: "Pusat Riset Robotika ER2C"
slug: "er2c"
aliases: ["ER2C", "Pusat Robotika"]
---
```

Semua wikilink ini resolve ke artikel yang sama:
- `[[er2c]]` → cocok slug
- `[[Pusat Riset Robotika ER2C]]` → cocok judul
- `[[ER2C]]` → cocok alias
- `[[Pusat Robotika]]` → cocok alias

## 🧩 Parsing Block

### Alur Parse

```tsx
function parseBlocks(raw: string): React.ReactNode[] {
  const lines = raw.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Cek berbagai pola...
    // (heading, callout, table, list, paragraph)

    i++;
  }

  return blocks;
}
```

**Kunci:** Setiap iterasi **WAJIB increment `i`**, biar gak infinite loop.

### Parse Heading

```tsx
const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
if (headerMatch) {
  const level = headerMatch[1].length;  // jumlah #
  const text = headerMatch[2].trim();

  // Generate id unik untuk anchor
  const id = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Render sesuai level
  if (level === 1) blocks.push(<h1 id={id}>{text}</h1>);
  else if (level === 2) blocks.push(<h2 id={id}>{text}</h2>);
  // ...
  i++;
  continue;
}
```

### Parse Callout

```tsx
const calloutMatch = line.match(/^>\s*\[!([A-Z]+)\]\s*(.*)$/);
if (calloutMatch) {
  const calloutType = calloutMatch[1].toLowerCase();  // note, tip, warning
  const calloutCustomTitle = calloutMatch[2].trim();

  // Baca baris selanjutnya yang masih bagian callout
  const calloutLines = [];
  i++;
  while (i < lines.length && lines[i].startsWith('>')) {
    calloutLines.push(lines[i].replace(/^>\s?/, ''));
    i++;
  }

  blocks.push(
    <div className={`classic-callout classic-callout-${calloutType}`}>
      <div className="classic-callout-title">
        <i className={iconClass}></i>
        <span>{calloutCustomTitle || calloutType}</span>
      </div>
      <div>
        {calloutLines.map((l, idx) => <p key={idx}>{l}</p>)}
      </div>
    </div>
  );
  continue;
}
```

### Parse Tabel

```tsx
if (line.includes('|') && lines[i + 1]?.includes('|') && /^\s*\|?\s*:?-+:?\s*\|/.test(lines[i + 1])) {
  const tableLines = [];
  while (i < lines.length && lines[i].includes('|')) {
    tableLines.push(lines[i]);
    i++;
  }

  const headerRow = tableLines[0].split('|').map(c => c.trim()).filter(Boolean);
  const dataRows = tableLines.slice(2).map(r =>
    r.split('|').map(c => c.trim()).filter(Boolean)
  );

  blocks.push(
    <div className="markdown-table-wrapper">
      <table className="markdown-table">
        <thead>
          <tr>{headerRow.map((h, idx) => <th key={idx}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => <td key={cIdx}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  continue;
}
```

## 🎨 Parsing Inline

Setelah block di-parse, tiap baris di-parse lagi untuk formatting inline:

```tsx
function renderFormatting(text: string, keyPrefix: string): React.ReactNode {
  // 1. Split kode `...`
  const parts = text.split(/(`[^`]+`)/);

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code>{part.slice(1, -1)}</code>;
    }

    // 2. Split bold **...**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return <strong>{bPart.slice(2, -2)}</strong>;
      }

      // 3. Split italic *...*
      const italicParts = bPart.split(/(\*[^*]+\*)/);
      return italicParts.map((itPart, itIdx) => {
        if (itPart.startsWith('*') && itPart.endsWith('*')) {
          return <em>{itPart.slice(1, -1)}</em>;
        }
        return itPart;
      });
    });
  });
}
```

## 🔗 Backlinks System

### Cara Kerja

1. Setelah semua artikel di-parse, kita punya daftar `outboundLinks` untuk masing-masing
2. Untuk setiap artikel, kita cari artikel lain yang `outboundLinks`-nya menyebut artikel ini
3. Setiap mention disimpan dengan snippet konteks

```tsx
function buildBacklinks(notes: NoteItem[]): void {
  // Reset backlinks
  notes.forEach(n => n.backlinks = []);

  for (const source of notes) {
    for (const targetSlug of source.outboundLinks) {
      const target = notes.find(n => n.slug === targetSlug);
      if (target) {
        // Extract snippet sekitar wikilink
        const snippet = extractSnippet(source.content, target.frontmatter.title);

        target.backlinks.push({
          sourceSlug: source.slug,
          sourceTitle: source.frontmatter.title,
          sourceCategory: source.frontmatter.category,
          snippet: snippet,
        });
      }
    }
  }
}
```

### Extract Snippet

```tsx
function extractSnippet(content: string, targetTitle: string, maxLength = 150): string {
  const escaped = targetTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`.{0,60}\\[\\[${escaped}[^\\]]*\\]\\].{0,60}`, 'i');
  const match = content.match(regex);

  if (match) {
    return match[0].replace(/\[\[|\]\]/g, '').trim();
  }

  return '';
}
```

**Hasil:** Di artikel ER2C, muncul panel:
```
Disebutkan di Halaman Lain (12 rujukan)

┌─────────────────────────────────────┐
│ [Akademik] Departemen DTE           │
│ "...bekerja sama dengan Pusat Riset │
│ Robotika ER2C untuk..."             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [Robotika] Tim EROS                 │
│ "...bermarkas di ER2C dan..."       │
└─────────────────────────────────────┘
```

## 📚 Selanjutnya

- [07. Graph View](07-graph-view.md) — Simulasi fisika graph
- [09. Menulis Artikel](09-menulis-artikel.md) — Panduan kontribusi

---

[⬅️ Kembali: Komponen](05-komponen.md) | [Selanjutnya: Graph View ➡️](07-graph-view.md)
