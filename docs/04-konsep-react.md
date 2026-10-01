# 04. Konsep React dari Nol

> **Tujuan dokumen ini:** Memahami konsep dasar React yang dipakai di PENS Wiki. Cocok untuk yang belum pernah ngoding React.

## 🤔 Apa itu React?

**React** adalah library JavaScript untuk membuat user interface (UI). Dibuat oleh Facebook (Meta) pada 2013, sekarang jadi salah satu library UI paling populer di dunia.

### Masalah yang React Selesaikan

Bayangkan kamu bikin website dengan HTML + JavaScript biasa:

```html
<div id="artikel-1">
  <h1>Sejarah PENS</h1>
  <p>PENS didirikan...</p>
</div>

<div id="artikel-2" style="display: none;">
  <h1>Departemen DTE</h1>
  <p>DTE adalah...</p>
</div>
```

Kalau user klik link ke artikel 2, kamu harus:
1. Sembunyikan artikel 1: `document.getElementById('artikel-1').style.display = 'none'`
2. Tampilkan artikel 2: `document.getElementById('artikel-2').style.display = 'block'`
3. Update judul tab: `document.title = 'Departemen DTE | PENS Wiki'`
4. Update breadcrumb
5. Update daftar isi
6. Update backlinks
7. Update graph
8. ... dan seterusnya

**Ribet banget!** Bayangkan ada 100 artikel — kode kamu jadi kacau.

### Solusi React

Dengan React, kamu cukup bilang:

```jsx
<Artikel data={artikelAktif} />
```

Setiap kali `artikelAktif` berubah, React otomatis update semua UI yang berhubungan. Kamu gak perlu manual manipulasi DOM.

**Ini yang disebut "reactive programming".**

## 🧱 Konsep Dasar React

### 1. Komponen (Component)

**Komponen** = potongan UI yang bisa dipakai ulang. Ibarat LEGO, website disusun dari banyak komponen kecil.

```jsx
// Komponen paling sederhana
function Halo() {
  return <h1>Halo Dunia!</h1>;
}

// Komponen lain
function Kartu({ judul, isi }) {
  return (
    <div className="card">
      <h3>{judul}</h3>
      <p>{isi}</p>
    </div>
  );
}

// Komponen utama yang menyusun keduanya
function App() {
  return (
    <div>
      <Halo />
      <Kartu judul="Sejarah PENS" isi="PENS didirikan pada..." />
      <Kartu judul="DTE" isi="DTE adalah departemen..." />
    </div>
  );
}
```

**Aturan penting:**
- Nama komponen **WAJIB huruf kapital** (`Halo`, bukan `halo`)
- Return harus **satu elemen induk** (bungkus dengan `<div>` atau `<>...</>`)

### 2. JSX

**JSX** = sintaks yang mirip HTML tapi di dalam JavaScript.

```jsx
const nama = "Budi";
const umur = 20;

const elemen = (
  <div className="card">
    <h1>Halo, {nama}!</h1>
    <p>Umur: {umur} tahun</p>
  </div>
);
```

**Perbedaan JSX vs HTML:**

| HTML | JSX | Alasan |
| :--- | :--- | :--- |
| `class="..."` | `className="..."` | `class` keyword reserved JS |
| `onclick="..."` | `onClick={...}` | camelCase untuk event |
| `for="..."` | `htmlFor="..."` | `for` keyword reserved JS |
| `<img src="...">` | `<img src="..." />` | Wajib self-close |
| `<br>` | `<br />` | Wajib self-close |

**Ekspresi JavaScript di JSX:**

```jsx
const nama = "Budi";
const umur = 20;

<div>
  <p>Nama: {nama}</p>                      {/* Variabel */}
  <p>Umur: {umur} tahun</p>                {/* Ekspresi */}
  <p>Tahun depan: {umur + 1}</p>           {/* Perhitungan */}
  <p>Status: {umur >= 18 ? "Dewasa" : "Anak"}</p>  {/* Ternary */}
</div>
```

### 3. Props

**Props** = data yang dikirim dari parent ke child component. Mirip parameter fungsi.

```jsx
// Komponen anak
function KartuArtikel({ judul, penulis, tanggal }) {
  return (
    <div className="card">
      <h3>{judul}</h3>
      <p>oleh {penulis}</p>
      <small>{tanggal}</small>
    </div>
  );
}

// Komponen induk
function App() {
  return (
    <div>
      <KartuArtikel
        judul="Sejarah PENS"
        penulis="Budi"
        tanggal="2026-09-30"
      />
      <KartuArtikel
        judul="Departemen DTE"
        penulis="Ani"
        tanggal="2026-09-29"
      />
    </div>
  );
}
```

**Aturan props:**
- Props **read-only** — anak gak boleh ubah props
- Kalau anak butuh ubah data, kirim **callback function** sebagai props

```jsx
function Tombol({ onClick, label }) {
  return <button onClick={onClick}>{label}</button>;
}

function App() {
  const handleClick = () => alert('Diklik!');
  return <Tombol onClick={handleClick} label="Klik Aku" />;
}
```

### 4. State (useState)

**State** = data yang bisa berubah dan bikin UI re-render.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  // count = nilai sekarang (0)
  // setCount = fungsi buat ubah nilai
  // 0 = nilai awal

  return (
    <div>
      <p>Nilai: {count}</p>
      <button onClick={() => setCount(count + 1)}>Tambah</button>
      <button onClick={() => setCount(count - 1)}>Kurang</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

**Kunci utama React:**
> Setiap kali `setCount` dipanggil, React **otomatis re-render** komponen ini. UI di-update tanpa reload halaman.

**Contoh di PENS Wiki:**

```tsx
const [currentSlug, setCurrentSlug] = useState<string>('beranda');
// currentSlug: artikel yang sedang dibuka
// setCurrentSlug: fungsi buat ganti artikel

// Saat user klik wikilink:
setCurrentSlug('er2c');  // → React re-render dengan artikel ER2C
```

### 5. useEffect

**useEffect** = hook buat "efek samping" — kode yang jalan setelah render.

**Kapan pakai useEffect?**
- Ambil data dari server (fetch API)
- Pasang event listener (scroll, resize, keyboard)
- Update DOM manual
- Set timer/interval

```jsx
import { useEffect } from 'react';

function Contoh() {
  useEffect(() => {
    console.log('Komponen muncul!');

    // Cleanup function
    return () => {
      console.log('Komponen hilang!');
    };
  }, []);  // [] = jalan SEKALI saat mount

  return <div>Contoh</div>;
}
```

**Dependency array:**
- `[]` → jalan **sekali** saat mount
- `[count]` → jalan tiap `count` berubah
- Tanpa array → jalan **setiap render** (hati-hati infinite loop!)

**Contoh di PENS Wiki:**

```tsx
// Load semua artikel saat App pertama mount
useEffect(() => {
  const loaded = loadAllNotes();
  setAllNotes(loaded);
}, []);  // ← jalan sekali

// Update SEO setiap currentNote berubah
useEffect(() => {
  document.title = `${currentNote.frontmatter.title} | PENS Wiki`;
}, [currentNote]);  // ← jalan tiap currentNote berubah
```

### 6. useMemo & useCallback

**Untuk optimasi performa** — cache hasil perhitungan/fungsi biar gak diulang.

```jsx
import { useMemo, useCallback } from 'react';

function Contoh({ items }) {
  // useMemo: cache HASIL perhitungan
  const totalHarga = useMemo(() => {
    console.log('Menghitung total...');
    return items.reduce((sum, item) => sum + item.harga, 0);
  }, [items]);  // hitung ulang cuma kalau items berubah

  // useCallback: cache FUNGSI
  const handleClick = useCallback(() => {
    console.log('Diklik!');
  }, []);  // fungsi sama terus, gak dibuat ulang tiap render

  return <div>Total: {totalHarga}</div>;
}
```

**Kapan pakai?**
- `useMemo`: perhitungan berat, filtering array besar, sorting
- `useCallback`: fungsi yang dikirim ke child component sebagai props

### 7. useRef

**useRef** = referensi ke DOM element atau value yang gak bikin re-render.

```jsx
import { useRef } from 'react';

function Contoh() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={focusInput}>Fokus Input</button>
    </div>
  );
}
```

**Beda useState vs useRef:**
- `useState` → ubah nilai → re-render
- `useRef` → ubah nilai → **TIDAK** re-render

## 🎯 Konsep Lanjutan

### Conditional Rendering

Tampilkan komponen berdasarkan kondisi:

```jsx
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      {isLoggedIn ? <Dashboard /> : <LoginPage />}
    </div>
  );
}
```

**Tiga cara conditional rendering:**

```jsx
// 1. Ternary (if-else)
{isLoggedIn ? <Dashboard /> : <Login />}

// 2. Logical AND (tampilkan kalau true)
{isLoggedIn && <Dashboard />}

// 3. Variabel
let content;
if (isLoggedIn) {
  content = <Dashboard />;
} else {
  content = <Login />;
}
return <div>{content}</div>;
```

**Contoh di PENS Wiki:**

```tsx
// Tampilkan sidebar hanya kalau bukan reading mode
{!isReadingMode && (
  <LeftSidebar ... />
)}

// Tampilkan backlinks hanya kalau ada
{backlinks.length > 0 && (
  <BacklinksPanel backlinks={backlinks} />
)}
```

### List Rendering

Render array jadi list:

```jsx
function DaftarArtikel({ articles }) {
  return (
    <ul>
      {articles.map((article) => (
        <li key={article.id}>
          {article.title}
        </li>
      ))}
    </ul>
  );
}
```

**Aturan penting:**
- Setiap item **WAJIB punya `key`** — biasanya pakai `id` unik
- `key` bantu React optimize re-render

### Event Handling

```jsx
function Tombol() {
  const handleClick = (e) => {
    e.preventDefault();  // cegah default behavior
    console.log('Diklik!');
  };

  return <button onClick={handleClick}>Klik</button>;
}
```

**Event umum:**
- `onClick` → klik
- `onChange` → input berubah
- `onSubmit` → form submit
- `onMouseEnter` / `onMouseLeave` → hover
- `onKeyDown` → keyboard

### Lifting State Up

Kalau dua komponen butuh state yang sama, **angkat state ke parent terdekat**.

```jsx
// ❌ Salah: state di masing-masing
function KomponenA() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}

function KomponenB() {
  const [value, setValue] = useState('');  // state terpisah!
  return <p>{value}</p>;
}

// ✅ Benar: state di parent
function Parent() {
  const [value, setValue] = useState('');
  return (
    <>
      <KomponenA value={value} onChange={setValue} />
      <KomponenB value={value} />
    </>
  );
}
```

**Contoh di PENS Wiki:**

Semua state global (`allNotes`, `currentSlug`, `theme`) ditaruh di `App.tsx`. Komponen anak tinggal nerima props.

## 🚫 Kesalahan Umum Pemula

### 1. Lupa Return

```jsx
// ❌ Salah
function Komponen() {
  <div>Hello</div>;  // gak di-return
}

// ✅ Benar
function Komponen() {
  return <div>Hello</div>;
}
```

### 2. Pakai `class` bukan `className`

```jsx
// ❌ Salah
<div class="card">

// ✅ Benar
<div className="card">
```

### 3. Ubah State Langsung

```jsx
// ❌ Salah
const [items, setItems] = useState([1, 2, 3]);
items.push(4);  // gak trigger re-render!

// ✅ Benar
setItems([...items, 4]);  // bikin array baru
```

### 4. Loop di JSX Tanpa Key

```jsx
// ❌ Salah
{items.map(item => <li>{item.name}</li>)}

// ✅ Benar
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

### 5. useEffect Tanpa Dependency Array

```jsx
// ❌ Salah — infinite loop!
useEffect(() => {
  setCount(count + 1);
});  // ← gak ada []

// ✅ Benar
useEffect(() => {
  setCount(count + 1);
}, []);  // ← jalan sekali
```

## 📚 Selanjutnya

- [05. Komponen](05-komponen.md) — Bedah setiap komponen PENS Wiki

---

[⬅️ Kembali: Arsitektur](03-arsitektur.md) | [Selanjutnya: Komponen ➡️](05-komponen.md)
