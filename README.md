# Sebuket

Website katalog dan pemesanan **Sebuket – Satu Buket, Satu Cerita** (buket bunga fresh, artificial, uang, dan snack).
Dibuat dengan HTML, CSS, dan JavaScript biasa, **tanpa framework dan tanpa build**. Cukup satu folder statis.

## Fitur
- Katalog per kategori dengan pencarian, filter, dan urutan produk
- Halaman produk: pilih ukuran, jumlah, dan kartu ucapan
- Kartu ucapan: latar foto buatan sendiri, 2 teks box yang bisa diisi, digeser, diperbesar/diperkecil, diganti font dan warna (boleh dihapus satu saja), plus tulisan "Sebuket" yang hanya bisa digeser
- Keranjang, checkout (ambil sendiri / pengiriman, jam bebas dipilih pelanggan), dan riwayat pesanan
- FAQ dan review pelanggan

> Pembayaran dan pesanan masih **simulasi**: tidak ada transaksi sungguhan dan tidak ada server.
> Keranjang dan riwayat pesanan disimpan di browser pelanggan (localStorage), bukan di server.

## Struktur folder
```
sebuket/
├── index.html      kerangka halaman
├── style.css       seluruh tampilan
├── script.js       data toko & produk, logika keranjang, checkout, halaman
├── foto/           foto produk, kategori, review, dan latar kartu ucapan
├── video/          video & poster hero
├── robots.txt      aturan crawler mesin pencari & AI
├── sitemap.xml     peta situs untuk mesin pencari
├── llms.txt        ringkasan situs untuk AI/LLM
├── vercel.json     pengaturan hosting di Vercel
└── .gitignore      daftar file yang tidak ikut ke Git
```

## SEO (robots.txt, sitemap.xml, llms.txt)
Domain di ketiga file masih memakai `https://sebuket.vercel.app`. Jika kamu memakai domain lain, ganti semua kemunculannya. Perbarui juga harga/produk di `llms.txt` bila katalog berubah.

## Menjalankan di komputer
Cara cepat: klik dua kali `index.html`. Tampilan dan keranjang berfungsi, tetapi tombol **Unduh Kartu** dan gambar kartu di bukti pesanan butuh server karena browser memblokir foto latar pada file lokal.

Cara yang disarankan (semua fitur jalan):
```bash
python3 -m http.server 8000
```
lalu buka `http://localhost:8000`.

## Yang perlu kamu isi
1. **Data toko** di bagian `CONFIG` pada `script.js`: nomor WhatsApp, alamat, jam operasional, Instagram, dan tautan peta. Yang masih berbentuk `[...]` wajib diganti.
2. **Review pelanggan**: ubah `REVIEWS` di `script.js`.
3. **Foto produk**: nama file dan ukurannya ada di `foto/BACA-SAYA.txt`. Foto yang belum ada diganti ilustrasi bunga otomatis.
4. **Latar kartu ucapan**: taruh 3 foto JPEG di `foto/` dengan nama `kartu-1.jpeg`, `kartu-2.jpeg`, `kartu-3.jpeg`. Ukuran tetap **10 × 7 cm** (rasio 10 : 7, contoh 1181 × 827 px). Beri ruang kosong di desain untuk teks. Selain 3 kartu itu, pelanggan juga punya pilihan "Tanpa kartu".
5. **Produk baru**: salin satu baris `P(...)` di `script.js`, beri ID unik, lalu siapkan fotonya.

## Deploy ke Vercel
1. Unggah isi folder ini ke repositori GitHub (file `index.html` harus ada di akar repositori).
2. Di [vercel.com](https://vercel.com) pilih **Add New → Project**, lalu impor repositori tersebut.
3. Framework Preset: **Other**. Kosongkan Build Command dan Output Directory.
4. Klik **Deploy**. Setiap `git push` berikutnya otomatis memperbarui website.

Setelah online lewat Vercel, tombol unduh kartu berfungsi normal.
