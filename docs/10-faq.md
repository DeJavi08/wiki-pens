\# 10. FAQ (Frequently Asked Questions)



> \*\*Tujuan dokumen ini:\*\* Jawaban untuk pertanyaan yang sering diajukan.



\## 🚀 Instalasi \& Setup



\### Q: Node.js versi berapa yang dibutuhkan?



\*\*A:\*\* Minimal Node.js 18.x. Versi LTS direkomendasikan. Cek dengan `node --version`.



\### Q: Kenapa `npm install` error?



\*\*A:\*\* Coba langkah berikut:

```bash

# 1. Bersihkan cache

npm cache clean --force



# 2. Hapus node_modules

rm -rf node_modules package-lock.json



# 3. Install ulang

npm install
