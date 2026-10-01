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
```

**Penjelasan:**
- Kalau jarak > 62, pegas menarik mereka dekat
- Kalau jarak < 62, pegas mendorong mereka jauh
- `dx / dist` dan `dy / dist` = vektor satuan

#### 2. Coulomb Repulsion (Tolak-Menolak)

**Rumus:** `F = k × (q1 × q2) / r²`

- Semakin dekat, semakin kuat tolak-menolaknya
- Semua node saling tolak biar gak numpuk

**Di kode:**

```tsx
for (let i = 0; i < nodes.length; i++) {
  const n1 = nodes[i];
  for (let j = i + 1; j < nodes.length; j++) {
    const n2 = nodes[j];
    const dx = n1.x - n2.x;
    const dy = n1.y - n2.y;
    const distSq = dx * dx + dy * dy + 35;  // +35 biar gak bagi nol
    const dist = Math.sqrt(distSq);
    const repForce = (800 / distSq) * alpha;

    if (n1 !== isDraggingNodeRef.current) {
      n1.vx += (dx / dist) * repForce;
      n1.vy += (dy / dist) * repForce;
    }
    if (n2 !== isDraggingNodeRef.current) {
      n2.vx -= (dx / dist) * repForce;
      n2.vy -= (dy / dist) * repForce;
    }
  }
}
```

**Penjelasan:**
- Loop nested: setiap pasangan node
- Hitung jarak, terus kasih gaya tolak
- `800 / distSq` = semakin dekat, semakin besar tolakannya

### 3. Center Gravity

Semua node ditarik ke pusat (0, 0) biar gak "kabur":

```tsx
for (const n of nodes) {
  if (n === isDraggingNodeRef.current) continue;

  if (n.isCurrent) {
    // Node utama: spring kuat kembali ke pusat
    n.vx += (0 - n.x) * 0.14;
    n.vy += (0 - n.y) * 0.14;
    n.vx *= 0.82;
    n.vy *= 0.82;
  } else {
    // Node lain: gravity lembut
    n.vx -= n.x * 0.002 * alpha;
    n.vy -= n.y * 0.002 * alpha;
  }
}
```

## ⚙️ Physics Tick

Setiap frame (~60fps), physics tick dijalankan:

```tsx
function physicsTick(width, height, transform) {
  const nodes = nodesRef.current;
  const edges = edgesRef.current;
  const alpha = alphaRef.current;

  // A. Center gravity & anchor
  // B. Charge repulsion
  // C. Elastic springs
  // D. Velocity integration & damping
  // E. Soft boundary containment

  // Decay alpha
  if (isDraggingNodeRef.current) {
    alphaRef.current = Math.max(alphaRef.current, 0.7);
  } else {
    alphaRef.current *= 0.965;
  }

  return maxVel;
}
```

### Velocity Integration

Setelah semua gaya dihitung, update posisi node:

```tsx
for (const n of nodes) {
  if (n === isDraggingNodeRef.current) continue;

  n.vx *= 0.88;   // damping (gesekan)
  n.vy *= 0.88;
  n.x += n.vx;    // update posisi
  n.y += n.vy;
}
```

**Damping (`* 0.88`):** Setiap frame, velocity dikurangi 12%. Ini bikin node gak goyang selamanya.

## 🔋 Alpha Decay — Optimasi Performa

**Masalah:** Kalau simulasi jalan terus, CPU kerja 100% selamanya.

**Solusi:** **Alpha decay** — pelan-pelan kurangi "kekuatan" simulasi.

```tsx
// Setiap frame:
alphaRef.current *= 0.965;  // berkurang 3.5%

// Cek apakah masih perlu simulasi
const shouldSimulate = alphaRef.current > 0.002 || isDraggingNodeRef.current !== null;

if (!shouldSimulate) {
  // Stop animation frame → CPU 0%
  isSimulatingRef.current = false;
  return;
}

// Lanjut simulasi
animFrameIdRef.current = requestAnimationFrame(runLoop);
```

**Proses:**
1. Alpha awal = 1.0
2. Setelah ~200 frame, alpha < 0.002
3. Animasi berhenti → CPU 0%
4. User drag node → alpha = 0.7 → simulasi bangun lagi

## 🎨 Canvas 2D — Menggambar

### Setup Canvas

```tsx
const canvas = canvasRef.current;
const ctx = canvas.getContext('2d');

// Setup DPR (device pixel ratio) untuk layar retina
const dpr = window.devicePixelRatio || 1;
canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);
```

### Draw Canvas

```tsx
function drawCanvas() {
  const ctx = canvas.getContext('2d');

  // Clear
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = isDark ? '#141419' : '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // Terapkan transform (pan & zoom)
  ctx.save();
  ctx.translate(width / 2 + transform.x, height / 2 + transform.y);
  ctx.scale(transform.k, transform.k);

  // Draw edges
  for (const e of edges) {
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 1.7 / transform.k;
    ctx.stroke();
  }

  // Draw nodes
  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
    ctx.fillStyle = n.isCurrent ? '#7c3aed' : '#94a3b8';
    ctx.fill();
  }

  ctx.restore();
}
```

**Kunci:**
- `ctx.save()` / `ctx.restore()` → simpan & restore transform
- `ctx.translate()` → geser origin
- `ctx.scale()` → zoom

## 🖱️ Interaksi User

### Drag Node

```tsx
function handlePointerDown(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;

  const hitNode = findNodeAtScreen(sx, sy);

  if (hitNode) {
    isDraggingNodeRef.current = hitNode;
    hitNode.vx = 0;
    hitNode.vy = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  } else {
    isDraggingCanvasRef.current = true;  // pan canvas
  }
}

function handlePointerMove(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;

  if (isDraggingNodeRef.current) {
    const node = isDraggingNodeRef.current;
    const { x: wx, y: wy } = screenToWorld(sx, sy);
    node.x = wx;
    node.y = wy;
    alphaRef.current = 0.7;  // bangunkan simulasi
  } else if (isDraggingCanvasRef.current) {
    transformRef.current.x = dragStartRef.current.panX + (sx - dragStartRef.current.x);
    transformRef.current.y = dragStartRef.current.panY + (sy - dragStartRef.current.y);
    drawCanvas();
  }
}
```

### Zoom dengan Scroll

```tsx
function handleWheel(e) {
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;  // scroll atas = zoom in
  const newK = Math.max(0.35, Math.min(4.0, transformRef.current.k * zoomFactor));

  // Pivot zoom di posisi kursor
  const wx = (mouseX - (width / 2 + transformRef.current.x)) / transformRef.current.k;
  const wy = (mouseY - (height / 2 + transformRef.current.y)) / transformRef.current.k;

  transformRef.current.k = newK;
  transformRef.current.x = mouseX - width / 2 - wx * newK;
  transformRef.current.y = mouseY - height / 2 - wy * newK;

  drawCanvas();
}
```

### Hover Node

```tsx
function handlePointerMove(e) {
  if (!isDraggingCanvasRef.current && !isDraggingNodeRef.current) {
    const hit = findNodeAtScreen(sx, sy);
    const hitId = hit ? hit.id : null;

    if (hitId !== hoveredNodeIdRef.current) {
      hoveredNodeIdRef.current = hitId;
      canvas.style.cursor = hit ? 'grab' : 'default';
      drawCanvas();  // redraw dengan highlight
    }
  }
}
```

**Kunci:** Hover **tidak** mengubah posisi node — hanya redraw dengan highlight.

## 🎨 Palet Warna

```tsx
const baseNodeColor = isDark ? '#71717a' : '#94a3b8';    // zinc/slate
const activeNodeColor = isDark ? '#8b5cf6' : '#7c3aed';  // Obsidian Purple
const hoveredNodeColor = isDark ? '#c084fc' : '#9333ea';
```

- **Base**: Abu-abu (netral)
- **Active**: Ungu (artikel aktif)
- **Hovered**: Ungu terang

## 📊 Statistik

Dari 100+ artikel PENS Wiki:
- **Nodes**: ~100 artikel
- **Edges**: ~500 wikilinks
- **Kategori**: 7 (Identitas, Akademik, Riset, Robotika, Kemahasiswaan, Komunitas)
- **Settle time**: ~3 detik
- **CPU usage saat idle**: 0%
- **CPU usage saat simulasi**: ~15%

## 📚 Selanjutnya

- [08. Theming](08-theming.md) — Sistem tema
- [09. Menulis Artikel](09-menulis-artikel.md) — Panduan kontribusi

---

[⬅️ Kembali: Markdown Parser](06-markdown-parser.md) | [Selanjutnya: Theming ➡️](08-theming.md)
