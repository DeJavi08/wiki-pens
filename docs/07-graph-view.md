# 07. Graph View & Simulasi Fisika

> **Tujuan dokumen ini:** Memahami cara kerja graph view dan simulasi fisika di baliknya.

## 🕸️ Apa itu Graph View?

**Graph View** adalah visualisasi jaringan yang menampilkan:

- **Node** (titik) = artikel

- **Edge** (garis) = wikilink antar artikel

Graph View membantu user melihat **hubungan antar artikel** secara visual. Ini fitur khas aplikasi seperti **Obsidian**, **Roam Research**, dan **Logseq**.

## 🎯 Dua Jenis Graph

### 1. Local Graph View

- **Lokasi:** Sidebar kanan

- **Fungsi:** Menampilkan artikel aktif + tetangga terdekatnya

- **Ukuran:** Kecil (220px height)

- **Tujuan:** Konteks lokal artikel

### 2. Global Graph Modal

- **Lokasi:** Modal fullscreen (bisa dibuka dari Local Graph)

- **Fungsi:** Menampilkan seluruh artikel & hubungannya

- **Ukuran:** Besar (70vh height)

- **Fitur:** Filter kategori, search, zoom controls

## 🎨 Konsep Simulasi Fisika

### Kenapa Perlu Simulasi?

Kalau kita taruh node di posisi acak:

- Node bisa numpuk

- Garis bisa kusut

- Susah dibaca

Solusi: **simulasi fisika** yang atur posisi otomatis, mirip **force-directed graph**.

### Dua Gaya Utama

#### 1. Hooke's Law (Pegas)

**Rumus:** `F = -k × x`

- `F` = gaya pegas

- `k` = konstanta pegas (kekakuan)

- `x` = perpindahan dari posisi setimbang

**Analogi:** Bayangkan edge adalah pegas. Kalau dua node terhubung, mereka ditarik mendekat sampai jarak tertentu (jarak ideal).

**Di kode:**

```tsx

for (const edge of edges) {

  const s = nodes.find(n => n.id === edge.source);

  const t = nodes.find(n => n.id === edge.target);

  if (s && t) {

    const dx = t.x - s.x;

    const dy = t.y - s.y;

    const dist = Math.hypot(dx, dy) || 1;

    const targetDist = 62;  // jarak ideal

    const displacement = dist - targetDist;

    const springStrength = 0.055;

    const force = displacement * springStrength * Math.max(0.35, alpha);

    // Tarik source ke arah target

    if (s !== isDraggingNodeRef.current) {

      s.vx += (dx / dist) * force;

      s.vy += (dy / dist) * force;

    }

    // Tarik target ke arah source

    if (t !== isDraggingNodeRef.current) {

      t.vx -= (dx / dist) * force;

      t.vy -= (dy / dist) * force;

    }

  }

}
