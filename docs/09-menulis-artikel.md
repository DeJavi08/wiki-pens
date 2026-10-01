# 09. Panduan Menulis Artikel

> **Tujuan dokumen ini:** Panduan lengkap untuk menulis artikel baru di PENS Wiki.

## 📝 Struktur Artikel

Setiap artikel adalah **file `.md`** di folder `src/content/notes/`, dengan struktur:

```markdown
---
title: "Judul Artikel"
slug: "judul-artikel"
category: "Kategori"
subcategory: "Sub Kategori"
tags: ["tag1", "tag2"]
aliases: ["Alias 1", "Alias 2"]
updated: "2026-09-30"
summary: "Ringkasan singkat artikel."
icon: "bi-journal-code"
featured: false
---

# Judul Artikel

Isi artikel dalam format Markdown standar.
```

## 📂 Struktur Folder

```
src/content/notes/
├── 00-index/              → MOC & Beranda
├── 01-identitas/          → Profil & kelembagaan
├── 02-akademik/           → Departemen, peraturan, layanan
│   ├── internasional/
│   ├── layanan/
│   └── peraturan/
├── 03-kemahasiswaan/      → HIMA, UKM, KM PENS
│   ├── tata-kelola/
│   ├── ukm-kerohanian/
│   ├── ukm-olahraga/
│   ├── ukm-penalaran/
│   └── ukm-seni/
├── 04-komunitas/          → Komunitas
│   ├── minat-khusus/
│   └── teknologi/
├── 05-robotika/           → Tim robot
│   ├── dirgantara/
│   └── maritim/
└── 06-riset-inovasi/      → Riset & inovasi
```

**Kategori → Folder:**

| Category | Folder |
| :--- | :--- |
| `Identitas` | `01-identitas/` |
| `Akademik` | `02-akademik/` |
| `Kemahasiswaan` | `03-kemahasiswaan/` |
| `Komunitas` | `04-komunitas/` |
| `Robotika` | `05-robotika/` |
| `Riset & Inovasi` | `06-riset-inovasi/` |

## 🎨 Frontmatter YAML

Frontmatter adalah bagian di antara `---` di atas file. Wajib ada.

### Field Wajib

```yaml
---
title: "Judul Artikel"
slug: "slug-unik"
category: "Akademik"
updated: "2026-09-30"
summary: "Ringkasan eksekutif 1-2 kalimat."
---
```

| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `title` | String | Judul yang tampil di UI |
| `slug` | String | ID unik untuk URL (lowercase, pakai dash) |
| `category` | String | Salah satu dari: Identitas, Akademik, Kemahasiswaan, Komunitas, Robotika, Riset & Inovasi |
| `updated` | String | Tanggal update format `YYYY-MM-DD` |
| `summary` | String | Ringkasan 1-2 kalimat untuk hover preview |

### Field Opsional

```yaml
subcategory: "Departemen & Vokasi"
tags: ["PENS", "Vokasi", "Teknologi"]
aliases: ["DTE", "Departemen Elektro"]
author: "Tim Ensiklopedia PENS"
icon: "bi-lightning-charge"
featured: false
```

| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `subcategory` | String | Sub-kategori untuk grouping di sidebar |
| `tags` | Array | Tag untuk pencarian |
| `aliases` | Array | Nama lain untuk wikilink |
| `author` | String | Penulis artikel |
| `icon` | String | Bootstrap icon class |
| `featured` | Boolean | Tampil di quick search? |

### Tips Frontmatter

**Slug:**
- ✅ `sejarah-pendirian`, `departemen-dte`, `tim-eros`
- ❌ `Sejarah_Pendirian`, `departemen dte`, `TimEros`

**Aliases:**
Semakin banyak alias, semakin mudah di-link:
```yaml
aliases: ["DTE", "Departemen Elektro", "Teknik Elektro", "Electrical Engineering"]
```

**Tags:**
Gunakan tag yang deskriptif:
```yaml
tags: ["Departemen", "DTE", "Elektronika", "Telekomunikasi"]
```

**Icon:**
Ambil dari [Bootstrap Icons](https://icons.getbootstrap.com/):
```yaml
icon: "bi-lightning-charge"  # ⚡
icon: "bi-robot"             # 🤖
icon: "bi-people"            # 👥
```

## ✍️ Menulis Konten

### Heading

```markdown
# Heading 1 (biasanya judul artikel — sudah ada di frontmatter)
## Heading 2 (section utama)
### Heading 3 (subsection)
#### Heading 4 (sub-subsection)
```

**Aturan:**
- H1 cuma sekali (judul utama)
- Gunakan H2 untuk section utama
- H3 untuk subsection
- H4 untuk detail

**ID otomatis:** Parser generate id dari heading text untuk anchor link:
```
## Sejarah Pendirian → id="sejarah-pendirian"
```

### Paragraf

```markdown
Ini paragraf biasa. Bisa ada **bold**, *italic*, dan `inline code`.

Paragraf kedua dipisah dengan baris kosong.
```

### List

**Unordered:**
```markdown
- Item 1
- Item 2
- Item 3
```

**Ordered:**
```markdown
1. Langkah pertama
2. Langkah kedua
3. Langkah ketiga
```

### Wikilinks

**Format:**
```markdown
[[Target]]              → Tautan langsung
[[Target|Label]]        → Tautan dengan label kustom
[[slug-artikel]]        → Tautan via slug
```

**Contoh:**
```markdown
PENS didirikan pada 1988 dengan bantuan [[JICA]].

Lihat juga [[Departemen Teknik Elektro (DTE)|DTE]] untuk info lebih lanjut.

Tim robotika [[ER2C]] telah memenangkan berbagai kompetisi.
```

**Tips:**
- Gunakan nama artikel persis (dengan kapital)
- Kalau nama panjang, pakai label kustom: `[[Nama Panjang|Label Pendek]]`
- Alias juga bisa dipakai: `[[DTE]]` (kalau ada alias "DTE")

### Callout Boxes

**Format:**
```markdown
> [!NOTE]
> Ini catatan penting.

> [!TIP]
> Ini tips berguna.

> [!WARNING]
> Ini peringatan.
```

**Tipe callout:**
- `[!NOTE]` → Catatan (biru)
- `[!INFO]` → Info (biru muda)
- `[!TIP]` → Tips (hijau)
- `[!WARNING]` → Peringatan (oranye)
- `[!QUOTE]` → Kutipan (abu-abu)

**Contoh:**
```markdown
> [!INFO]
> **Status Kelembagaan**:
> - SK Pendirian: 29 Mei 1986
> - Serah Terima JICA: 15 Maret 1988
> - Peresmian: 2 Juni 1988
```

### Blockquote

```markdown
> Ini kutipan biasa tanpa tipe.
> Bisa multi-baris.
```

### Tabel

```markdown
| Kolom 1 | Kolom 2 | Kolom 3 |
| :--- | :--- | :--- |
| Data 1 | Data 2 | Data 3 |
| Data 4 | Data 5 | Data 6 |
```

**Alignment:**
- `:---` → left
- `:---:` → center
- `---:` → right

**Contoh:**
```markdown
| Periode | Nama | Capaian |
| :--- | :--- | :--- |
| 1988–1997 | Ir. Susanto | Perintisan operasional kampus |
| 1997–2002 | Prof. Dr. Ir. Mohammad Nuh | Penerimaan JICA Award |
```

### Gambar

```markdown
![Alt text](https://example.com/image.png)
```

**Local image:**
```markdown
![Logo PENS](/images/logo-pens.png)
```

Letakkan file di `public/images/`.

### Horizontal Rule

```markdown
---
```

### Code

**Inline:**
```markdown
Gunakan `npm install` untuk install.
```

**Block:**
````markdown
```bash
npm install
npm run dev
```
````

## 🎯 Contoh Artikel Lengkap

```markdown
---
title: "Pusat Riset Robotika ER2C"
slug: "er2c"
category: "Riset & Inovasi"
subcategory: "Pusat Riset"
tags: ["Robotika", "ER2C", "KRI", "Riset"]
aliases: ["ER2C", "Pusat Robotika", "Electronics Research and Development Center"]
updated: "2026-09-30"
summary: "Pusat riset robotika terpadu PENS yang menaungi 15 tim robotika legendaris yang mendominasi Kontes Robot Indonesia (KRI) dan kompetisi internasional."
icon: "bi-robot"
featured: true
---

# Pusat Riset Robotika ER2C

**ER2C** (Electronics Research and Development Center) adalah pusat riset robotika terpadu di [[Politeknik Elektronika Negeri Surabaya (PENS)|PENS]] yang menaungi 15 tim robotika legendaris.

> [!INFO]
> ER2C didirikan pada tahun 2009 sebagai pusat riset dan pengembangan robotika untuk mendukung persiapan Kontes Robot Indonesia (KRI).

## 🏛️ Divisi & Tim

ER2C menaungi berbagai divisi robotika:

### Divisi Darat
- [[Tim EROS]] — ERM Robot Soccer
- [[Tim ERSOW]] — Robot Sepak Bola Beroda
- [[Tim ERISA]] — KRCI / KRAI
- [[Tim EIRA]] — Robot Pemadam Api

### Divisi Udara
- [[Tim Dirgantara]] — Wahana terbang otonom
- [[Tim Bamantara EEPISAT]] — Satelit Nano

### Divisi Maritim
- [[Tim EMOSVER]] — Wahana laut tanpa awak

## 🏆 Pencapaian

| Tahun | Kompetisi | Pencapaian |
| :--- | :--- | :--- |
| 2024 | Kontes Robot Indonesia | Juara 1 KRAI |
| 2023 | RoboCup Asia-Pacific | Finalist |
| 2022 | Kontes Robot Indonesia | Juara 1 KRCI |

## 🔗 Tautan Terkait

- Profil institusi: [[Identitas Kelembagaan PENS]]
- Departemen terkait: [[Departemen Teknik Elektro (DTE)]], [[Departemen Teknik Informatika dan Komputer (DTIK)]]
- Fasilitas: [[Infrastruktur Kampus & Laboratorium Riset]]
```

## ✅ Checklist Sebelum Submit

- [ ] Frontmatter lengkap (title, slug, category, updated, summary)
- [ ] Slug unik (gak bentrok dengan artikel lain)
- [ ] Kategori valid (salah satu dari 6 kategori)
- [ ] Summary deskriptif (1-2 kalimat)
- [ ] Heading struktur benar (H1 → H2 → H3)
- [ ] Wikilink format benar (`[[Target]]`)
- [ ] Tabel format benar (pakai `|`)
- [ ] Callout format benar (`> [!NOTE]`)
- [ ] Tidak ada typo di frontmatter
- [ ] Test di local (`npm run dev`)

## 🎯 Tips Menulis

### 1. Mulai dari Outline

Sebelum menulis, buat outline:
```
# Judul
## Section 1
### Subsection 1.1
### Subsection 1.2
## Section 2
## Tautan Terkait
```

### 2. Link ke Artikel Lain

Semakin banyak wikilink, semakin kaya graph view:
```markdown
Lihat juga [[Departemen Teknik Elektro (DTE)]] dan [[Pusat Riset ER2C]].
```

### 3. Gunakan Tabel untuk Data Terstruktur

Tabel lebih enak dibaca daripada list panjang.

### 4. Callout untuk Highlight

Gunakan callout untuk info penting:
```markdown
> [!WARNING]
> Deadline pendaftaran SKEM adalah 1 tahun setelah kegiatan.
```

### 5. Konsisten dengan Format

Kalau artikel lain pakai "##" untuk section, kamu juga pakai "##".

## 📚 Selanjutnya

- [10. FAQ](10-faq.md) — Pertanyaan umum

---

[⬅️ Kembali: Theming](08-theming.md) | [Selanjutnya: FAQ ➡️](10-faq.md)
