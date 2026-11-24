/* =========================================================
   SEBUKET – script.js
   1) KONFIGURASI (ubah data toko & produk di sini)
   2) Fungsi bantu  3) Keranjang  4) Halaman  5) Router
   ========================================================= */

/* ---------- 1) KONFIGURASI ---------- */
const CONFIG = {
  name: 'Sebuket',
  tagline: 'Satu Buket, Satu Cerita',
  wa: '[NOMOR_WA]',          // isi format 628123456789
  ig: '@sebuket.florist',
  igUrl: 'https://www.instagram.com/sebuket.florist?srtk=MWlqc3NiZHdrNTl4eA==',   // tautan Instagram lengkap
  address: '[ALAMAT]',
  maps: 'https://maps.app.goo.gl/iNXADcZZ51TuUvRU9?g_st=ac',
  hours: '[JAM OPERASIONAL]'
};
// Merapikan nomor WA otomatis: "0812-3456-7890" atau "+62 812 3456 7890" => "6281234567890"
(function () {
  let d = CONFIG.wa.replace(/\D/g, '');
  if (d.length >= 8) { if (d.startsWith('0')) d = '62' + d.slice(1); CONFIG.wa = d; }
})();
const MARQUEE_TEXT = 'Sebuket ~ satu buket satu cerita';   // kalimat teks berjalan (ubah di sini & di index.html)
/* REVIEW PELANGGAN: ganti foto, nama, dan teks review di sini (tambah/hapus baris sesuai kebutuhan) */
const REVIEWS = [
  { foto: 'foto/review-1.jpeg', nama: '[NAMA PELANGGAN]', teks: '[Tulis review pelanggan di sini]' },
  { foto: 'foto/review-2.jpeg', nama: '[NAMA PELANGGAN]', teks: '[Tulis review pelanggan di sini]' },
  { foto: 'foto/review-3.jpeg', nama: '[NAMA PELANGGAN]', teks: '[Tulis review pelanggan di sini]' },
  { foto: 'foto/review-4.jpeg', nama: '[NAMA PELANGGAN]', teks: '[Tulis review pelanggan di sini]' }
];
const CATEGORIES = [
  { id: 'fresh', name: 'Fresh Flowers', desc: 'Bunga segar yang dirangkai hari itu juga.', c: ['#FFB5BD', '#B32F4E'] },
  { id: 'artificial', name: 'Artificial Flowers', desc: 'Awet dikenang, cantik selamanya.', c: ['#F4F7CD', '#8D9A2E'] },
  { id: 'money', name: 'Money Bouquet', desc: 'Hadiah istimewa dari lembar demi lembar.', c: ['#FFB5BD', '#8D9A2E'] },
  { id: 'snack', name: 'Snack Bouquet', desc: 'Camilan favorit dalam rangkaian manis.', c: ['#F4F7CD', '#B32F4E'] }
];
const FLOWER_PAL = { pink: ['#F4A6B0', '#D9606F', '#FBD3D8'], yellow: ['#F7E08A', '#E3B93C', '#FCF0BE'], coral: ['#F59A8B', '#D9553F', '#FAC9BF'] };
/* KARTU UCAPAN (gratis): pelanggan memilih 1 dari 3 latar kartu atau "Tanpa kartu" (total 4 pilihan).
   LATAR KARTU = foto JPEG buatanmu. Taruh di folder foto/ dengan nama persis:
   kartu-1.jpeg, kartu-2.jpeg, kartu-3.jpeg  (ukuran 10 x 7 cm, rasio 10 : 7, mis. 1181 x 827 px).
   Jika file belum ada, otomatis tampil latar pink polos.
   Di atas latar ada: 2 teks box (diisi & digaya pelanggan, boleh dihapus SATU saja)
   dan tulisan "Sebuket" (hanya bisa digeser, tidak bisa dihapus). */
const CARD_TEMPLATES = [
  { id: 'k1', name: 'Kartu 1', img: 'foto/kartu-1.jpeg' },
  { id: 'k2', name: 'Kartu 2', img: 'foto/kartu-2.jpeg' },
  { id: 'k3', name: 'Kartu 3', img: 'foto/kartu-3.jpeg' }
];
const CARD_BG_FALLBACK = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 105"><rect width="148" height="105" fill="#FFEEEE"/></svg>');
const cardName = c => { const t = CARD_TEMPLATES[c.t]; return t ? t.name : ''; };
const TEXT_KEYS = ['text1', 'text2'];                    // 2 teks box yang bisa diisi pelanggan
const FIELD_LABELS = { text1: 'Teks 1', text2: 'Teks 2', brand: 'Sebuket' };
const FIELD_MAX = 120;                                    // batas karakter tiap teks box
const BOX_DEF = { text1: { x: 50, y: 34 }, text2: { x: 50, y: 58 }, brand: { x: 50, y: 88 } };   // posisi awal (% lebar / % tinggi kartu)
/* 3 pilihan font untuk isi teks box */
const CARD_FONTS = [
  { id: 'cormorant', name: 'Cormorant Garamond (klasik)', css: "'Cormorant Garamond',serif" },
  { id: 'source', name: 'Source Sans (modern)', css: "'Source Sans 3','Source Sans Pro',sans-serif" },
  { id: 'vibes', name: 'Great Vibes (tulisan tangan)', css: "'Great Vibes',cursive" }
];
const CARD_COLORS = ['#2b2b2b', '#2d3f94', '#B32F4E', '#D9606F', '#5b6420', '#8D9A2E', '#E3B93C', '#FFFFFF'];
const cardFontCss = id => (CARD_FONTS.find(x => x.id === id) || CARD_FONTS[0]).css;
const okSize = n => typeof n === 'number' && n >= .4 && n <= 3;
const okColor = c => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c);
const num = n => (typeof n === 'number' && isFinite(n)) ? Math.round(n * 100) / 100 : 0;
const cardOpts = c => (c && c.v2) ? { f: c.f || {}, pos: c.pos || {}, st: c.st || {}, gone: c.gone || [] } : { f: {}, pos: {}, st: {}, gone: [] };   // data kartu model lama diabaikan
const cardText = c => { const o = cardOpts(c); return TEXT_KEYS.filter(k => !o.gone.includes(k)).map(k => String(o.f[k] || '').trim()).filter(Boolean).join(' · '); };
function cardHTML(ti, o = {}) {   // tampilan kartu: latar foto + 2 teks box + tulisan Sebuket
  const t = CARD_TEMPLATES[ti], z = CARD_SIZE, f = o.f || {}, pos = o.pos || {}, st = o.st || {}, gone = o.gone || [];
  if (!t) return '';
  const at = k => { const p = pos[k]; return p && typeof p.x === 'number' && typeof p.y === 'number' ? p : BOX_DEF[k]; };
  const box = (k, inner, del) => `<span class="tb" data-tb="${k}" style="left:${num(at(k).x)}%;top:${num(at(k).y)}%">${inner}` + (o.ro ? '' :
    `<button type="button" class="mv" tabindex="0" aria-label="Pindahkan: ${FIELD_LABELS[k]} (seret, atau gunakan tombol panah)" title="Seret untuk memindahkan">✥</button>` +
    (del ? `<button type="button" class="dx" aria-label="Hapus: ${FIELD_LABELS[k]}" title="Hapus teks box ini">✕</button>` : '')) + '</span>';
  const ed = k => {
    const s = st[k] || {}, css = (s.font ? `font-family:${cardFontCss(s.font)};` : '') + (okColor(s.color) ? `color:${s.color};` : '') + (okSize(s.size) ? `font-size:${num(6 * s.size)}cqw;` : '');
    return `<span class="ed" data-f="${k}" data-max="${FIELD_MAX}"${o.ro ? '' : ' contenteditable="true" spellcheck="false" role="textbox"'} aria-label="${FIELD_LABELS[k]}" data-ph="Tulis teks di sini..." style="${css}">${esc(f[k] || '')}</span>`;
  };
  return `<div class="gc${o.ro ? ' ro' : ''}" style="aspect-ratio:${z.w}/${z.h}"><img class="gc-bg" src="${t.img}" data-fb="${CARD_BG_FALLBACK}" alt="" draggable="false">` +
    TEXT_KEYS.filter(k => !gone.includes(k)).map(k => box(k, ed(k), true)).join('') +
    box('brand', '<span class="ed fixed brandt">Sebuket</span>', false) + '</div>';
}
/* Foto: ganti array "photos" dengan 3 URL/nama file gambar milikmu.
   Jika kosong, dipakai ilustrasi bawaan. sizes = [label, harga, stok]. */
/* FOTO PRODUK: taruh gambar di folder "foto" dengan nama <id>-1, <id>-2, <id>-3
   contoh: foto/a2-1.jpg, foto/a2-2.jpg, foto/a2-3.jpg  (daftar lengkap ada di foto/BACA-SAYA.txt)
   Ganti FOTO_EXT jika foto Anda berformat lain: 'png' atau 'webp'.
   Jika file foto belum ada, otomatis tampil ilustrasi bunga bawaan (tidak error). */
const FOTO_EXT = 'jpeg';   // format utama; jika tidak ada, otomatis dicoba: jpg, png, webp
const EXT_LIST = [FOTO_EXT, ...['jpeg', 'jpg', 'png', 'webp'].filter(e => e !== FOTO_EXT)];
// FOTO LAIN (taruh di folder "foto"; jika belum ada, otomatis tampil ilustrasi):
//   Header/hero Home  -> foto/hero.jpeg
//   Pilihan kategori  -> foto/kategori-fresh.jpeg, kategori-artificial.jpeg, kategori-money.jpeg, kategori-snack.jpeg
//   Review pelanggan  -> foto/review-1.jpeg ... review-4.jpeg  (atur di REVIEWS di bawah)
const HERO_FOTO = 'foto/hero.' + FOTO_EXT;
const catImg = c => `src="foto/kategori-${c.id}.${FOTO_EXT}" data-fb="${art(c.c[0], c.c[1], 1)}"`;
const art = (a, b, k) => {
  let f = '';
  for (let i = 0; i < 5; i++) {
    const x = 60 + i * 45 + k * 8, y = 90 + (i % 2) * 25;
    f += `<path d="M${x} ${y}Q${x + (k - 1) * 12} 200 150 250" stroke="#8D9A2E" stroke-width="3" fill="none"/><g transform="translate(${x} ${y})">` +
      [0, 72, 144, 216, 288].map(r => `<ellipse cy="-16" rx="9" ry="16" fill="${i % 2 ? a : b}" transform="rotate(${r})"/>`).join('') + `<circle r="6" fill="#F4F7CD"/></g>`;
  }
  return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="${k == 1 ? '#F4F7CD' : '#FFEEEE'}"/>${f}<path d="M105 235L150 300L195 235Z" fill="#fff" opacity=".85"/></svg>`);
};
const P = (id, cat, name, colors, flowers, orders, date, est, sizes, ca, cb, desc, foto) => ({
  id, cat, name, colors, flowers, orders, date, est, sizes: sizes.map(([label, price, stock]) => ({ label, price, stock })),
  desc, keys: name + ' ' + cat, photos: foto && foto.length ? foto : [1, 2, 3].map(n => `foto/${id}-${n}.${FOTO_EXT}`),   // opsional: isi parameter 'foto' dengan 3 nama file khusus
  art: [art(ca, cb, 0), art(ca, cb, 1), art(cb, ca, 2)]   // ilustrasi cadangan bila foto belum ada
});
const PRODUCTS = [
  P('f1', 'fresh', 'Rose Blush', ['Pink'], 'Mawar pink', 40, '2026-10-01', '1–2 hari', [['S', 120000, 5], ['M', 180000, 3], ['L', 260000, 0]], '#FFB5BD', '#B32F4E', 'Rangkaian mawar pink lembut dengan daun hijau segar.'),
  P('f2', 'fresh', 'Tulip Morning', ['Kuning', 'Putih'], 'Tulip', 25, '2026-10-20', '1–2 hari', [['S', 95000, 4], ['M', 150000, 2]], '#F4F7CD', '#8D9A2E', 'Tulip ceria untuk membuka hari yang manis.'),
  P('f3', 'fresh', 'Peony Dream', ['Pink', 'Putih'], 'Peony', 60, '2026-09-12', '2 hari', [['M', 220000, 2], ['L', 320000, 1]], '#FFB5BD', '#fff', 'Peony mewah dengan nuansa romantis.'),
  P('a1', 'artificial', 'Everlasting Daisy', ['Putih', 'Kuning'], 'Daisy artifisial', 18, '2026-10-25', '1 hari', [['S', 45000, 10], ['M', 85000, 6]], '#fff', '#F4F7CD', 'Daisy yang awet dan tahan lama.'),
  P('a2', 'artificial', 'Pink Satin Rose', ['Pink'], 'Mawar satin', 33, '2026-08-30', '1–2 hari', [['S', 65000, 7], ['M', 110000, 4]], '#FFB5BD', '#B32F4E', 'Mawar satin lembut seperti asli.'),
  P('a3', 'artificial', 'Lavender Whisper', ['Ungu'], 'Lavender artifisial', 12, '2026-10-30', '1 hari', [['S', 40000, 0], ['M', 75000, 0]], '#d8c4f0', '#8D9A2E', 'Lavender kering buatan yang menenangkan.'),
  P('m1', 'money', 'Golden Wish', ['Merah', 'Kuning'], 'Uang kertas + mawar', 50, '2026-10-10', '2–3 hari', [['S', 150000, 5], ['M', 300000, 3]], '#B32F4E', '#F4F7CD', 'Buket uang untuk selebrasi spesial (nominal sesuai ukuran).'),
  P('m2', 'money', 'Money Bloom', ['Pink'], 'Uang kertas + bunga', 22, '2026-09-25', '2–3 hari', [['M', 250000, 2], ['L', 500000, 1]], '#FFB5BD', '#8D9A2E', 'Lembaran uang dirangkai seperti bunga mekar.'),
  P('m3', 'money', 'Mini Cash Rose', ['Merah'], 'Uang kertas', 9, '2026-11-02', '2 hari', [['S', 100000, 4]], '#B32F4E', '#FFB5BD', 'Versi mungil, cocok untuk kado sederhana.'),
  P('s1', 'snack', 'Sweet Crunch', ['Pink', 'Kuning'], 'Camilan + bunga', 44, '2026-10-05', '1 hari', [['S', 48000, 8], ['M', 90000, 5], ['L', 140000, 2]], '#FFB5BD', '#F4F7CD', 'Aneka snack manis dengan sentuhan bunga.'),
  P('s2', 'snack', 'Choco Garden', ['Putih', 'Pink'], 'Cokelat + bunga', 36, '2026-10-28', '1–2 hari', [['S', 55000, 6], ['M', 105000, 3]], '#fff', '#B32F4E', 'Cokelat favorit dalam rangkaian cantik.'),
  P('s3', 'snack', 'Munch Meadow', ['Kuning'], 'Camilan asin', 15, '2026-09-01', '1 hari', [['M', 95000, 0], ['L', 150000, 0]], '#F4F7CD', '#8D9A2E', 'Camilan gurih untuk si pecinta snack.')
];
const FAQ = [
  ['Bagaimana cara memesan buket?', 'Pilih buket, tentukan ukuran, jumlah, dan kartu ucapan, lalu masukkan ke keranjang atau pilih Beli Langsung. Lanjutkan ke checkout, pilih pembayaran, dan pesananmu langsung tercatat di Cek Pesanan (simulasi).'],
  ['Bagaimana metode pembayaran?', 'Tersedia transfer bank (BCA, BNI, Mandiri), QRIS, dan tunai saat pengambilan. Seluruh pembayaran di website ini hanya simulasi.'],
  ['Bagaimana sistem pengiriman atau pengambilan pesanan?', 'Pilih Ambil Sendiri (Rp0) atau Pengiriman (Rp15.000) saat checkout, lalu tentukan jam pengambilan atau pengantaran.'],
  ['Berapa lama estimasi pengerjaan buket?', 'Setiap produk punya estimasi pengerjaan di halaman detailnya. Ini hanya informasi, bukan sistem pre-order.'],
  ['Bagaimana kebijakan voucher?', 'Jika kamu mengirim pesan pertama pada jam operasional dan tidak dibalas lebih dari 2 jam, kamu berhak voucher 2,5%. Pesan di luar jam operasional tidak dihitung. Ini kebijakan pelayanan (bukan voucher otomatis); masa berlaku dan ketentuan pemakaian diatur pemilik toko.']
];
const STEPS = ['Pilih buket yang kamu suka.', 'Tentukan ukuran dan card yang diinginkan.', 'Masukkan ke keranjang atau Beli Langsung.', 'Checkout, pilih pembayaran, lalu pantau di Cek Pesanan.'];

/* ---------- 2) FUNGSI BANTU ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rp = n => 'Rp' + n.toLocaleString('id-ID');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getP = id => PRODUCTS.find(p => p.id === id);
const catOf = id => CATEGORIES.find(c => c.id === id);
const minPrice = p => Math.min(...p.sizes.map(s => s.price));
const soldOut = p => p.sizes.every(s => s.stock <= 0);
const jget = (st, k, d) => { try { return JSON.parse(st.getItem(k)) ?? d; } catch { return d; } };
const jset = (st, k, v) => { try { st.setItem(k, JSON.stringify(v)); } catch { } };
const waReady = () => /^\d{8,}$/.test(CONFIG.wa);
const igReady = () => /^@[\w.]+$/.test(CONFIG.ig) && !CONFIG.ig.includes('[');
const igUrl = () => CONFIG.igUrl || 'https://instagram.com/' + CONFIG.ig.replace('@', '');
const filled = v => v && !v.includes('[');
const ICON = {
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  cart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
  flower: '<svg viewBox="0 0 100 100"><g transform="translate(50 50)" fill="#FFB5BD">' + [0, 72, 144, 216, 288].map(r => `<ellipse cy="-20" rx="11" ry="20" transform="rotate(${r})"/>`).join('') + '<circle r="9" fill="#F4F7CD"/></g></svg>'
};
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}
/* Fuzzy sederhana: cocok jika kata ada, atau beda maksimal 1 huruf */
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function matchQuery(p, q) {
  const hay = (p.name + ' ' + p.keys + ' ' + p.flowers + ' ' + p.colors.join(' ')).toLowerCase();
  const words = hay.split(/\s+/);
  return q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w) || words.some(t => Math.abs(t.length - w.length) <= 1 && lev(t, w) <= 1));
}
function observeReveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  $$('.reveal:not(.in)').forEach(el => io.observe(el));
}

/* ---------- 3) KERANJANG (localStorage) ---------- */
const loadCart = () => jget(localStorage, 'sebuket_cart', []);
const saveCart = c => { jset(localStorage, 'sebuket_cart', c); updateBadge(); };
const stockOf = (p, size) => (p.sizes.find(s => s.label === size) || { stock: 0 }).stock;
const priceOf = (p, size) => (p.sizes.find(s => s.label === size) || { price: 0 }).price;
function updateBadge() {
  const n = loadCart().length, b = $('#badge');   // jumlah BARIS, bukan unit
  b.textContent = n; b.hidden = n === 0;
}
const sameItem = (i, id, size, varian) => i.id === id && i.size === size && (i.varian || '') === (varian || '');
const itemKey = i => [i.id, i.size, i.varian || ''].join('|');
function addToCart(id, size, card, checkOnlyThis, qty = 1, varian = '') {
  const cart = loadCart(), p = getP(id), max = Math.max(stockOf(p, size), 1);
  let it = cart.find(i => sameItem(i, id, size, varian));
  if (it) { it.qty = Math.min(it.qty + qty, max); it.card = card; it.checked = true; }
  else cart.push({ id, size, varian, qty: Math.min(qty, max), checked: true, card, price: priceOf(p, size) });
  if (checkOnlyThis) cart.forEach(i => i.checked = sameItem(i, id, size, varian));
  saveCart(cart);
}
const eligible = (i, p) => i.checked && stockOf(p, i.size) > 0 && i.qty <= stockOf(p, i.size);
/* ---------- 4) HALAMAN ---------- */
const app = $('#app');
const catName = id => (catOf(id) || { name: id }).name;
function productCard(p, home) {
  return `<article class="card reveal" data-id="${p.id}" tabindex="0" aria-label="${esc(p.name)}">
    <div class="ph"><img loading="lazy" src="${p.photos[0]}" alt="${esc(p.name)}">
    ${!home && soldOut(p) ? '<span class="tag">Sold Out</span>' : ''}</div>
    <div class="cb"><small>${esc(catName(p.cat))}</small><h3>${esc(p.name)}</h3><p class="pr">Mulai ${rp(minPrice(p))}</p>
    ${home ? '' : '<button class="btn sm" type="button">Lihat Detail</button>'}</div></article>`;
}
/* Home */
function pageHome() {
  // urutan acak dibuat sekali per sesi => tidak berubah saat pindah halaman internal
  let order = jget(sessionStorage, 'sebuket_order', null);
  if (!order) { order = PRODUCTS.map(p => p.id).sort(() => Math.random() - .5); jset(sessionStorage, 'sebuket_order', order); }
  const rv = jget(localStorage, 'sebuket_rv', {});
  const rvIds = Object.keys(rv).filter(id => getP(id) && !soldOut(getP(id))).sort((a, b) => rv[b] - rv[a]).slice(0, 3);
  const rest = order.filter(id => !rvIds.includes(id) && !soldOut(getP(id))).slice(0, Math.max(10 - rvIds.length, 8 - rvIds.length));
  const a = rest.slice(0, 4), b = rest.slice(4);
  const grid = a.map(id => productCard(getP(id), true)).join('') +
    (rvIds.length ? rvIds.map(id => productCard(getP(id), true)).join('') : '') +
    b.map(id => productCard(getP(id), true)).join('');
  const faqPrev = FAQ.slice(0, 3).map(f => `<div class="step"><b>?</b><strong>${f[0]}</strong></div>`).join('');
  const link = (ok, href, txt) => ok ? `<a href="${href}" target="_blank" rel="noopener">${txt}</a>` : `<a class="off" aria-disabled="true">${txt}</a>`;
  return `<div class="wrap page">
  <section class="hero"><video class="hero-video" src="video/hero.mp4" poster="video/hero-poster.jpeg" autoplay muted loop playsinline preload="auto"></video><div class="hero-in"><span class="script">${CONFIG.tagline}</span><h1>Buket cantik untuk setiap cerita</h1>
  <p>Rangkaian bunga, uang, dan snack dengan sentuhan taman bunga yang hangat dan romantis.</p></div></section>
  <section><h2>Pilih Kategori</h2><div class="tiles">${CATEGORIES.map(c => `<a class="tile reveal" href="#/katalog/${c.id}"><span class="tile-ic"><img ${catImg(c)} alt=""></span><span>${c.name}</span></a>`).join('')}</div></section>
  <section><div class="sec-head"><h2>Pilihan Buket</h2><a href="#/katalog">Lihat Semua</a></div><div class="grid">${grid}</div></section>
  <section><div class="sec-head"><h2>Momen yang Berarti</h2>${igReady() ? `<a href="${igUrl()}" target="_blank" rel="noopener">Lihat Lebih Banyak</a>` : ''}</div>
  <div class="revs">${REVIEWS.map(r => `<figure class="rev reveal"><div class="ph"><img loading="lazy" src="${r.foto}" data-fb="${art('#FFB5BD', '#8D9A2E', 2)}" alt="Foto review ${esc(r.nama)}"></div><figcaption><p>${esc(r.teks)}</p><small>${esc(r.nama)}</small></figcaption></figure>`).join('')}</div></section>
  <section><h2>Cara Pemesanan</h2><div class="steps">${STEPS.map((s, i) => `<div class="step reveal"><b>${i + 1}</b>${s}</div>`).join('')}</div></section>
  <section><h2>Pertanyaan Populer</h2><div class="steps">${faqPrev}</div><br><a class="btn alt" href="#/faq">Lihat FAQ</a></section></div>
  <footer><div class="in"><div><span class="logo">Sebuket</span><p>${CONFIG.tagline}</p></div>
  <div><strong>Alamat</strong><br>${filled(CONFIG.address) ? `<a href="${CONFIG.maps}" target="_blank" rel="noopener">${esc(CONFIG.address)}</a>` : link(!!CONFIG.maps, CONFIG.maps, esc(CONFIG.address))}
  <br><strong>Jam operasional</strong><br>${esc(CONFIG.hours)}</div>
  <div><strong>Instagram</strong><br>${link(igReady(), igUrl(), esc(CONFIG.ig))}
  <br><strong>WhatsApp</strong><br>${link(waReady(), 'https://wa.me/' + CONFIG.wa, esc(CONFIG.wa))}</div></div></footer>`;
}
/* Katalog utama */
function pageCatalog() {
  return `<div class="wrap page"><h2>Katalog</h2><p>Pilih kategori buket favoritmu.</p><br><div class="cats">` +
    CATEGORIES.map(c => {
      const n = PRODUCTS.filter(p => p.cat === c.id).length;
      return `<a class="card reveal" href="#/katalog/${c.id}" style="text-decoration:none"><div class="ph cat-ph"><img ${catImg(c)} alt="${c.name}"></div>
      <div class="cb"><h3>${c.name}</h3><p>${c.desc}</p><p class="pr">${n} produk →</p></div></a>`;
    }).join('') + '</div></div>';
}
/* Halaman kategori: state (cari/filter/sort) disimpan di sessionStorage per kategori */
const BUDGETS = { low: [0, 49999], mid: [50000, 100000], high: [100001, Infinity] };
function pageCategory(catId) {
  const cat = catOf(catId);
  if (!cat) return `<div class="wrap page empty"><h2>Kategori tidak ditemukan</h2><a class="btn" href="#/katalog">Ke Katalog</a></div>`;
  const key = 'sebuket_f_' + catId;
  const st = Object.assign({ q: '', budget: '', colors: [], sort: 'new', open: false }, jget(sessionStorage, key, {}));
  const all = PRODUCTS.filter(p => p.cat === catId);
  const colors = [...new Set(all.flatMap(p => p.colors))];
  setTimeout(() => {
    const list = $('#list'), panel = $('#panel');
    function draw() {
      jset(sessionStorage, key, st);
      let r = all.filter(p => (!st.q || matchQuery(p, st.q)) &&
        (!st.budget || (minPrice(p) >= BUDGETS[st.budget][0] && minPrice(p) <= BUDGETS[st.budget][1])) &&
        (!st.colors.length || p.colors.some(c => st.colors.includes(c))));
      const s = { new: (a, b) => b.date.localeCompare(a.date), low: (a, b) => minPrice(a) - minPrice(b), high: (a, b) => minPrice(b) - minPrice(a), pop: (a, b) => b.orders - a.orders }[st.sort];
      r.sort(s);
      list.innerHTML = !all.length ? '<div class="empty">Belum ada produk di kategori ini. Segera hadir ya!</div>' :
        r.length ? r.map(p => productCard(p, false)).join('') :
          '<div class="empty" style="grid-column:1/-1"><p>Produk tidak ditemukan.</p><br><button class="btn" id="clr">Hapus Pencarian & Filter</button></div>';
      const clr = $('#clr'); if (clr) clr.onclick = reset;
      observeReveal();
    }
    function reset() {
      Object.assign(st, { q: '', budget: '', colors: [], sort: 'new' });
      $('#q').value = ''; $('#sort').value = 'new';
      $$('#panel input').forEach(i => i.checked = false); draw();
    }
    $('#sform').onsubmit = e => { e.preventDefault(); st.q = $('#q').value.trim(); draw(); };   // cari hanya saat Enter/tombol
    $('#fbtn').onclick = () => { st.open = !st.open; panel.classList.toggle('open', st.open); };
    $('#apply').onclick = () => {
      st.budget = ($('input[name=bud]:checked') || {}).value || '';
      st.colors = $$('input[name=col]:checked').map(i => i.value);
      st.open = false; panel.classList.remove('open'); draw(); toast('Filter diterapkan');
    };
    $('#reset').onclick = reset; $('#rbtn').onclick = reset;
    $('#sort').onchange = e => { st.sort = e.target.value; draw(); };
    draw();
  });
  return `<div class="wrap page"><h2>${cat.name}</h2><p>${cat.desc}</p>
  <div class="bar"><form id="sform"><input type="search" id="q" placeholder="Cari buket..." value="${esc(st.q)}" aria-label="Cari"><button class="btn" type="submit">Cari</button></form>
  <button class="btn alt" id="fbtn" type="button">Filter</button>
  <select id="sort" aria-label="Urutkan">${[['new', 'Terbaru'], ['low', 'Harga terendah'], ['high', 'Harga tertinggi'], ['pop', 'Terpopuler']].map(o => `<option value="${o[0]}" ${st.sort === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select>
  <button class="btn alt" id="rbtn" type="button">Reset</button></div>
  <div class="panel ${st.open ? 'open' : ''}" id="panel"><fieldset><legend>Budget</legend>
  ${[['low', 'Di bawah Rp50.000'], ['mid', 'Rp50.000–Rp100.000'], ['high', 'Di atas Rp100.000']].map(b => `<label><input type="radio" name="bud" value="${b[0]}" ${st.budget === b[0] ? 'checked' : ''}> ${b[1]}</label>`).join('')}</fieldset>
  <fieldset><legend>Warna</legend>${colors.map(c => `<label><input type="checkbox" name="col" value="${c}" ${st.colors.includes(c) ? 'checked' : ''}> ${c}</label>`).join('')}</fieldset>
  <button class="btn" id="apply" type="button">Terapkan</button> <button class="btn alt" id="reset" type="button">Reset</button></div>
  <div class="grid" id="list"></div>
  <p style="margin-top:1.2rem">Kategori lain: ${CATEGORIES.filter(c => c.id !== catId).map(c => `<a href="#/katalog/${c.id}" style="color:var(--rasp);font-weight:700">${c.name}</a>`).join(' · ')}</p></div>`;
}
/* Detail produk */
function pageDetail(id) {
  const p = getP(id);
  if (!p) return `<div class="wrap page empty"><h2>Produk tidak ditemukan</h2><a class="btn" href="#/katalog">Ke Katalog</a></div>`;
  startTrack(id);
  const S = { size: null, card: -1, f: {}, pos: {}, st: {}, gone: [], sel: null, qty: 1, varian: '' };
  setTimeout(() => {
    const out = soldOut(p);
    const upd = () => {
      const sz = p.sizes.find(s => s.label === S.size);
      $('#price').textContent = sz ? rp(sz.price) : 'Mulai ' + rp(minPrice(p));
      $('#stock').textContent = out ? 'Sold Out' : sz ? (sz.stock > 0 ? `Stok: ${sz.stock}` : 'Sold Out') : 'Pilih ukuran untuk melihat stok';
      $$('#sizes .chip').forEach(b => b.classList.toggle('on', b.dataset.s === S.size));
      $$('.ctpl').forEach(b => b.classList.toggle('on', +b.dataset.t === S.card));
      const g = $('#gcard'); g.style.display = S.card >= 0 ? 'block' : 'none';
      g.innerHTML = S.card >= 0 ? cardHTML(S.card, { f: S.f, pos: S.pos, st: S.st, gone: S.gone }) : '';
      if (S.card >= 0 && S.sel && !$(`.tb[data-tb="${S.sel}"]`, g)) S.sel = null;
      markSel(); syncTools(); $('#crestore').hidden = !S.gone.length;
      $('#chint').style.display = S.card >= 0 ? 'block' : 'none'; $('#ctools').style.display = S.card >= 0 ? 'grid' : 'none';
      const mx = sz ? Math.max(stockOf(p, S.size), 1) : 99; if (S.qty > mx) S.qty = mx;
      $('#qtyv').textContent = S.qty; $('#qtym').disabled = S.qty <= 1; $('#qtyp').disabled = out || S.qty >= mx;
      $('#dlwrap').style.display = S.card >= 0 ? 'block' : 'none';
    };
    $('#qtym').onclick = () => { if (S.qty > 1) { S.qty--; upd(); } };
    $('#qtyp').onclick = () => { S.qty++; upd(); };
    $('#sizes').onclick = e => { const b = e.target.closest('.chip'); if (b && !b.disabled) { S.size = b.dataset.s; upd(); } };
    $('.thumbs').onclick = e => { const b = e.target.closest('button'); if (!b) return; $('#mainph').src = p.photos[+b.dataset.i]; $$('.thumbs button').forEach(x => x.classList.toggle('on', x === b)); };
    $('#ctpls').onclick = e => { const b = e.target.closest('.ctpl'); if (b) { S.card = +b.dataset.t; S.sel = null; upd(); } };   // teks & posisi tetap terjaga saat ganti latar
    const g = $('#gcard');   // mengetik langsung di kartu
    g.addEventListener('input', e => {
      const el = e.target.closest('[data-f]'); if (!el) return;
      let v = el.textContent.replace(/\n/g, ' '); const max = +el.dataset.max;
      if (v.length > max) { v = v.slice(0, max); el.textContent = v; const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
      S.f[el.dataset.f] = v;
    });
    g.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.closest('.ed')) e.preventDefault(); });
    g.addEventListener('paste', e => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData.getData('text') || '').replace(/\s+/g, ' ')); });
    ['dragstart', 'drop', 'dragover'].forEach(ev => g.addEventListener(ev, e => e.preventDefault()));   // teks tidak bisa dipindah
    /* ----- editor kartu: pilih tulisan, pindah (seret / panah), hapus (maks. 1 teks box), font, warna ----- */
    const gcEl = () => $('.gc', g), labelOf = k => FIELD_LABELS[k] || k;
    const markSel = () => $$('.tb', g).forEach(b => b.classList.toggle('sel', b.dataset.tb === S.sel));
    const hex = c => { const m = String(c).match(/\d+(\.\d+)?/g); return m ? '#' + m.slice(0, 3).map(n => Math.round(+n).toString(16).padStart(2, '0')).join('') : '#2b2b2b'; };
    const edEl = k => $(`.ed[data-f="${k}"]`, g);
    const posOf = k => { const p = S.pos[k]; return p && typeof p.x === 'number' ? p : BOX_DEF[k]; };
    const syncTools = () => {
      const has = !!S.sel && S.card >= 0, on = has && S.sel !== 'brand', sf = $('#cfont'), sc = $('#ccol');   // "Sebuket" hanya bisa digeser
      [sf, sc, $('#csz'), $('#cszm'), $('#cszp')].forEach(x => x.disabled = !on);
      $$('#ccols button').forEach(b => b.disabled = !on);
      $('#creset').disabled = !has;
      $('#ctsel').textContent = !has ? 'Ketuk salah satu tulisan di kartu dulu' : S.sel === 'brand' ? 'Tulisan "Sebuket" hanya bisa digeser' : 'Tulisan terpilih: ' + labelOf(S.sel);
      if (!on) { sf.value = CARD_FONTS[0].id; $('#csz').value = 100; $('#cszv').textContent = '100%'; return; }
      const s0 = S.st[S.sel] || {}; sf.value = s0.font || CARD_FONTS[0].id; const pc = Math.round((okSize(s0.size) ? s0.size : 1) * 100); $('#csz').value = pc; $('#cszv').textContent = pc + '%';
      const el = edEl(S.sel); sc.value = okColor(s0.color) ? s0.color : (el ? hex(getComputedStyle(el).color) : '#2b2b2b');
      $$('#ccols button').forEach(b => b.classList.toggle('on', okColor(s0.color) && b.dataset.c.toLowerCase() === s0.color.toLowerCase()));
    };
    const select = k => { if (S.sel === k) return; S.sel = k; markSel(); syncTools(); };
    const setStyle = (k, key, val) => {
      const s0 = S.st[k] = S.st[k] || {}; if (val) s0[key] = val; else delete s0[key]; if (!Object.keys(s0).length) delete S.st[k];
      const el = edEl(k); if (!el) return; const c = key === 'font' ? cardFontCss(val) : val;
      if (key === 'font') el.style.fontFamily = c || ''; else if (key === 'size') { el.style.fontSize = val ? num(6 * val) + 'cqw' : ''; const p = posOf(k); place(k, p.x, p.y); } else el.style.color = c || '';
      syncTools();
    };
    $('#cfont').onchange = e => { if (S.sel) setStyle(S.sel, 'font', e.target.value); };
    const setSize = pc => { if (!S.sel || S.sel === 'brand') return; pc = Math.max(50, Math.min(250, pc)); setStyle(S.sel, 'size', pc === 100 ? '' : pc / 100); };
    $('#csz').oninput = e => setSize(+e.target.value);
    $('#cszm').onclick = () => setSize(Math.round(+$('#csz').value / 5) * 5 - 10);
    $('#cszp').onclick = () => setSize(Math.round(+$('#csz').value / 5) * 5 + 10);
    $('#ccol').oninput = e => { if (S.sel) setStyle(S.sel, 'color', e.target.value); };
    $('#ccols').onclick = e => { const b = e.target.closest('button[data-c]'); if (b && S.sel) setStyle(S.sel, 'color', b.dataset.c); };
    $('#creset').onclick = () => {   // kembalikan posisi (dan gaya, kecuali "Sebuket") ke bawaan
      if (!S.sel) return; const k = S.sel; delete S.st[k]; delete S.pos[k];
      const el = edEl(k), tb = $(`.tb[data-tb="${k}"]`, g);
      if (el) { el.style.fontFamily = ''; el.style.color = ''; el.style.fontSize = ''; }
      if (tb) { tb.style.left = BOX_DEF[k].x + '%'; tb.style.top = BOX_DEF[k].y + '%'; }
      syncTools();
    };
    const delBox = k => {   // hanya SATU teks box yang boleh dihapus
      if (S.gone.includes(k)) return;
      if (S.gone.length >= 1) { alert('Teks box hanya dapat dihapus satu saja.'); return; }
      S.gone.push(k); if (S.sel === k) S.sel = null; upd();
    };
    $('#crestore').onclick = () => { S.gone = []; upd(); toast('Teks box dikembalikan'); };
    const place = (k, x, y) => {   // geser kotak teks, tetap di dalam kartu; posisi = titik tengah kotak dalam % lebar & % tinggi kartu
      const tb = $(`.tb[data-tb="${k}"]`, g), gc = gcEl(), ed = tb && $('.ed', tb); if (!tb || !gc || !ed) return;
      tb.style.left = x + '%'; tb.style.top = y + '%';
      const a = gc.getBoundingClientRect(), r = ed.getBoundingClientRect(), pad = 14;   // sisakan ruang untuk ikon ✥ dan ✕
      if (r.left < a.left + pad) x += (a.left + pad - r.left) / a.width * 100; else if (r.right > a.right - pad) x -= (r.right - a.right + pad) / a.width * 100;
      if (r.top < a.top + pad) y += (a.top + pad - r.top) / a.height * 100; else if (r.bottom > a.bottom) y -= (r.bottom - a.bottom) / a.height * 100;
      x = num(x); y = num(y); tb.style.left = x + '%'; tb.style.top = y + '%'; S.pos[k] = { x, y };
    };
    let drag = null;
    g.addEventListener('pointerdown', e => {
      const h = e.target.closest('.mv'); if (!h) return; const tb = h.closest('.tb'), k = tb.dataset.tb, gc = gcEl();
      e.preventDefault(); select(k); h.setPointerCapture(e.pointerId); const p0 = posOf(k), r = gc.getBoundingClientRect();
      drag = { k, id: e.pointerId, sx: e.clientX, sy: e.clientY, x: p0.x, y: p0.y, W: r.width, H: r.height }; tb.classList.add('drag');
    });
    g.addEventListener('pointermove', e => { if (drag && e.pointerId === drag.id) place(drag.k, drag.x + (e.clientX - drag.sx) / drag.W * 100, drag.y + (e.clientY - drag.sy) / drag.H * 100); });
    const endDrag = e => { if (drag && e.pointerId === drag.id) { const tb = $(`.tb[data-tb="${drag.k}"]`, g); if (tb) tb.classList.remove('drag'); drag = null; } };
    g.addEventListener('pointerup', endDrag); g.addEventListener('pointercancel', endDrag);
    g.addEventListener('keydown', e => {   // pindah lewat papan ketik: fokus di ikon ✥ lalu tekan panah
      const h = e.target.closest('.mv'); if (!h || !e.key.startsWith('Arrow')) return;
      e.preventDefault(); const k = h.closest('.tb').dataset.tb, st = e.shiftKey ? 3 : 1, p0 = posOf(k);
      place(k, p0.x + (e.key === 'ArrowRight' ? st : e.key === 'ArrowLeft' ? -st : 0), p0.y + (e.key === 'ArrowDown' ? st : e.key === 'ArrowUp' ? -st : 0));
    });
    g.addEventListener('focusin', e => { const tb = e.target.closest('.tb'); if (tb) select(tb.dataset.tb); });
    g.addEventListener('click', e => {
      const d = e.target.closest('.dx'); if (d) { delBox(d.closest('.tb').dataset.tb); return; }
      const tb = e.target.closest('.tb'); if (tb) select(tb.dataset.tb);
    });
    const clone = o => JSON.parse(JSON.stringify(o));
    const cardData = () => S.card < 0 ? { t: -1 } : { t: S.card, v2: true, f: Object.fromEntries(TEXT_KEYS.map(k => [k, String(S.f[k] || '').trim()])), pos: clone(S.pos), st: clone(S.st), gone: [...S.gone] };
    const check = () => { if (!S.size) { toast('Pilih ukuran terlebih dahulu'); return false; } return stockOf(p, S.size) > 0; };
    $('#add').onclick = () => { if (check()) { addToCart(id, S.size, cardData(), false, S.qty, S.varian); toast('Berhasil dimasukkan ke keranjang 🌸'); } };
    $('#buy').onclick = () => {   // Beli Langsung: masukkan ke keranjang (hanya produk ini terpilih) lalu ke checkout
      if (!check()) return;
      addToCart(id, S.size, cardData(), true, S.qty, S.varian); location.hash = '#/checkout';
    };
    $('#dlcard').onclick = async () => {   // simpan hasil kartu sebagai PNG
      const b = $('#dlcard'); b.disabled = true;
      try {
        const url = await renderCardImg(cardData()), a = document.createElement('a');
        a.href = url; a.download = `kartu-sebuket-${CARD_TEMPLATES[S.card].id}.jpg`; document.body.appendChild(a); a.click(); a.remove();
        toast('Kartu disimpan sebagai gambar');
      } catch (e) { toast('Gagal membuat gambar kartu. Buka website lewat hosting/server (bukan klik dua kali file) agar foto latar bisa diunduh.'); }
      b.disabled = false;
    };
    upd();
  });
  return `<div class="wrap page"><div class="detail"><div><img class="main-ph" id="mainph" src="${p.photos[0]}" alt="${esc(p.name)}">
  <div class="thumbs">${p.photos.map((ph, i) => `<button data-i="${i}" class="${i ? '' : 'on'}" aria-label="Foto ${i + 1}"><img src="${ph}" alt=""></button>`).join('')}</div></div>
  <div class="info"><small>${esc(catName(p.cat))}</small><h1>${esc(p.name)} ${soldOut(p) ? '<span class="tag" style="position:static">Sold Out</span>' : ''}</h1>
  <div class="price" id="price"></div><div id="stock" class="warn" style="color:var(--olive)"></div>
  <p>${esc(p.desc)}</p>
  <div class="meta">⏱ Estimasi pengerjaan: ${esc(p.est)}<br>🌸 Jenis: ${esc(p.flowers)}<br>🎨 Warna: ${esc(p.colors.join(', '))}</div>
  <strong>Ukuran</strong><div class="chips" id="sizes">${p.sizes.map(s => `<button class="chip" data-s="${s.label}" ${s.stock <= 0 ? 'disabled' : ''}>${s.label}</button>`).join('')}</div>
  <strong>Jumlah</strong><div class="qty qty-d"><button id="qtym" aria-label="Kurangi jumlah">−</button><b id="qtyv">1</b><button id="qtyp" aria-label="Tambah jumlah">+</button></div><br>
  <strong>Kartu Ucapan (gratis)</strong><div class="chips" id="ctpls"><button class="chip ctpl on" data-t="-1">Tanpa kartu</button>${CARD_TEMPLATES.map((c, i) => `<button class="chip ctpl" data-t="${i}">${c.name}</button>`).join('')}</div>
  <small id="chint" style="display:none">Ketuk teks box di kartu untuk mengisi (maks. 120 karakter). Seret ikon ✥ untuk memindahkan, dan atur ukuran tulisan dengan penggeser di bawah kartu. Ikon ✕ menghapus teks box, tetapi hanya satu teks box yang boleh dihapus. Tulisan "Sebuket" hanya bisa digeser. Atur font dan warna di bawah kartu.</small>
  <div id="gcard" style="display:none"></div>
  <div id="ctools" class="ctools" style="display:none"><strong>Gaya Tulisan</strong><span id="ctsel" class="muted"></span>
    <label>Font <select id="cfont">${CARD_FONTS.map(x => `<option value="${x.id}">${x.name}</option>`).join('')}</select></label>
    <label class="szrow">Ukuran tulisan <span class="szctl"><button type="button" id="cszm" aria-label="Perkecil tulisan">−</button><input type="range" id="csz" min="50" max="250" step="5" value="100"><button type="button" id="cszp" aria-label="Perbesar tulisan">+</button><b id="cszv">100%</b></span></label>
    <div class="cwrow"><span>Warna</span><div id="ccols" class="cswatch">${CARD_COLORS.map(c => `<button type="button" data-c="${c}" style="background:${c}" aria-label="Warna ${c}"></button>`).join('')}</div><input type="color" id="ccol" aria-label="Pilih warna lain" value="#2b2b2b"></div>
    <button type="button" class="btn alt sm" id="creset">Kembalikan tulisan ini ke bawaan</button>
    <button type="button" class="btn alt sm" id="crestore" hidden>Kembalikan teks box yang dihapus</button></div>
  <div id="dlwrap" style="display:none"><button class="btn alt sm" id="dlcard" type="button">Unduh Kartu</button></div><br>
  <div class="chips"><button class="btn" id="add" ${soldOut(p) ? 'disabled' : ''}>${ICON.cart} Masukkan Keranjang</button><button class="btn alt" id="buy" ${soldOut(p) ? 'disabled' : ''}>Beli Langsung</button></div></div></div></div>`;
}
/* Keranjang */
function pageCart() {
  const cart = loadCart(), notes = [];
  if (!cart.length) return `<div class="wrap page"><div class="empty">${ICON.cart.replace('stroke-width="2"', 'stroke-width="1.2"')}<h2>Keranjangmu Masih Kosong</h2><p>Yuk, temukan buket yang pas untuk ceritamu hari ini.</p><br><a class="btn" href="#/katalog">Cari Buket Yuk!</a></div></div>`;
  let total = 0, rows = '';
  cart.forEach((i, idx) => {
    const p = getP(i.id); if (!p) return;
    const stock = stockOf(p, i.size), price = priceOf(p, i.size), sold = stock <= 0, over = !sold && i.qty > stock;
    if (i.price !== undefined && i.price !== price) { notes.push(`Harga ${p.name} (${i.size}) telah diperbarui.`); i.price = price; }
    if (eligible(i, p)) total += price * i.qty;
    rows += `<div class="row"><input type="checkbox" data-c="${idx}" ${i.checked && !sold ? 'checked' : ''} ${sold ? 'disabled' : ''} aria-label="Pilih">
    <img src="${p.photos[0]}" alt="${esc(p.name)}"><div><strong>${esc(p.name)}</strong> · Ukuran ${i.size}${i.varian ? ' · ' + esc(i.varian) : ''} ${sold ? '<span class="tag" style="position:static">Sold Out</span>' : ''}
    <div>${rp(price)}</div>${i.card && i.card.t >= 0 ? `<small>Kartu: ${cardName(i.card)} · ${cardSizeInfo().cm} (Rp0)${cardText(i.card) ? ' – "' + esc(cardText(i.card)) + '"' : ''}</small>` : ''}
    ${over ? `<div class="warn">Jumlah melebihi stok terbaru (${stock}). Kurangi jumlahnya.</div>` : ''}
    <div class="qty"><button data-m="${idx}" aria-label="Kurangi">−</button><b>${i.qty}</b><button data-p="${idx}" aria-label="Tambah" ${i.qty >= stock ? 'disabled' : ''}>+</button><button class="del" data-d="${idx}">Hapus</button></div></div></div>`;
  });
  saveCart(cart);
  const any = cart.some(i => getP(i.id) && eligible(i, getP(i.id)));
  return `<div class="wrap page"><h2>Keranjang</h2>${notes.map(n => `<p class="warn">ℹ ${esc(n)}</p>`).join('')}${rows}
  <div class="total"><div>Total<br><b>${rp(total)}</b></div><div class="tot-btns"><button class="btn" id="checkout" ${any ? '' : 'aria-disabled="true"'}>Checkout</button></div></div></div>`;
}
function bindCart() {
  app.onclick = e => {
    const t = e.target, cart = loadCart(); let ch = true;
    if (t.dataset.c !== undefined) cart[+t.dataset.c].checked = t.checked;
    else if (t.dataset.p !== undefined) { const i = cart[+t.dataset.p]; if (i.qty < stockOf(getP(i.id), i.size)) i.qty++; }
    else if (t.dataset.m !== undefined) { const i = cart[+t.dataset.m]; if (i.qty > 1) i.qty--; }
    else if (t.dataset.d !== undefined) cart.splice(+t.dataset.d, 1);
    else if (t.id === 'checkout') {
      if (!cart.some(i => getP(i.id) && eligible(i, getP(i.id)))) toast('Centang minimal satu produk yang tersedia');
      else location.hash = '#/checkout';
      ch = false;
    } else ch = false;
    if (ch) { saveCart(cart); const y = scrollY; app.innerHTML = pageCart(); scrollTo(0, y); }
  };
}
/* FAQ */
function pageFaq() {
  setTimeout(() => app.onclick = e => {
    const q = e.target.closest('.faq-q'); if (!q) return;
    const item = q.parentElement, was = item.classList.contains('open');
    $$('.faq-item').forEach(i => { i.classList.remove('open'); $('.faq-q', i).setAttribute('aria-expanded', 'false'); });   // hanya satu terbuka
    if (!was) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
  });
  return `<div class="wrap page"><h2>FAQ</h2>${FAQ.map(f => `<div class="faq-item"><button class="faq-q" aria-expanded="false">${f[0]}<i>+</i></button><div class="faq-a"><div>${f[1]}</div></div></div>`).join('')}</div>`;
}

/* ---------- Recently Viewed: hitung durasi aktif di Detail ---------- */
let trk = null;
const tick = () => { if (trk && trk.last) { trk.acc += Date.now() - trk.last; trk.last = Date.now(); } };
function startTrack(id) { endTrack(); trk = { id, acc: 0, last: document.hidden ? null : Date.now() }; }
function endTrack() {
  if (!trk) return; tick();
  if (trk.acc >= 5000) { const rv = jget(localStorage, 'sebuket_rv', {}); rv[trk.id] = (rv[trk.id] || 0) + trk.acc / 1000; jset(localStorage, 'sebuket_rv', rv); }   // < 5 detik diabaikan
  trk = null;
}
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('paused', document.hidden);
  if (document.hidden) { tick(); if (trk) trk.last = null; } else if (trk) trk.last = Date.now();
});
addEventListener('pagehide', endTrack);

/* =========================================================
   6) PEMESANAN LANGSUNG (simulasi): checkout, pembayaran,
      bukti pemesanan, riwayat, status, kartu ucapan PNG
   ========================================================= */
const SHIPPING_FEE = 15000;   // biaya pengiriman; Ambil Sendiri = Rp0
/* UKURAN CARD (kartu ucapan, landscape). Harga kartu tetap gratis untuk semua ukuran. */
const CARD_SIZE = { id: '10x7', w: 100, h: 70, cm: '10 × 7 cm' };   // ukuran kartu tetap 10 x 7 cm (rasio 10 : 7), ditentukan dari foto JPEG latar
const cardSizeInfo = () => CARD_SIZE;
const PAY_METHODS = [
  { id: 'bca', name: 'BCA', bank: true, prefix: '39' },
  { id: 'bni', name: 'BNI', bank: true, prefix: '98' },
  { id: 'mandiri', name: 'Mandiri', bank: true, prefix: '88' },
  { id: 'qris', name: 'QRIS' },
  { id: 'cash', name: 'Tunai saat Pengambilan', pickupOnly: true }
];
const payName = id => { const m = PAY_METHODS.find(x => x.id === id); return m ? (m.bank ? 'Transfer Bank ' + m.name : m.name) : '-'; };
const ORDER_FLOW = ['wait', 'proc', 'prep', 'ready', 'done'];
const orderLabel = o => ({ wait: 'Menunggu Konfirmasi', proc: 'Diproses', prep: 'Sedang Disiapkan', ready: o.method === 'delivery' ? 'Dalam Pengiriman' : 'Siap Diambil', done: 'Selesai', cancel: 'Dibatalkan' }[o.status] || o.status);
const PAY_LABEL = { unpaid: 'Menunggu Pembayaran', verify: 'Menunggu Verifikasi (Simulasi)', paid: 'Lunas (Simulasi)', cod: 'Bayar saat Pengambilan' };
const ORDERS_KEY = 'sebuket_orders', DRAFT_KEY = 'sebuket_co_draft', IMG_PREFIX = 'sebuket_img_';

const fmtTime = s => String(s || '').replace(':', '.');   // "14:30" -> "14.30"
const okTime = v => /^\d{2}:\d{2}$/.test(v || '');

/* ----- kartu ucapan => gambar PNG (digambar ulang dari tata letak kartu asli) ----- */
const CARD_REF_W = 480;
async function loadCardFonts() {
  try {
    if (!document.fonts) return;
    await Promise.race([Promise.all(['500 16px "Cormorant Garamond"', '600 16px "Cormorant Garamond"', 'italic 500 16px "Cormorant Garamond"', '600 16px "Source Sans 3"', '400 16px "Great Vibes"', '400 16px "The Nautigal"', '700 16px "The Nautigal"', '400 16px "Source Sans 3"'].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 1500))]);
  } catch (e) { }
}
function loadImg(src) { return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
async function loadCardBg(ti) {   // foto latar kartu (coba jpeg, jpg, png, webp)
  const t = CARD_TEMPLATES[ti]; if (!t) return null;
  const base = t.img.replace(/\.\w+$/, '');
  for (const e of EXT_LIST) { const im = await loadImg(`${base}.${e}`); if (im) return im; }
  return null;
}
async function renderCardImg(card, scale = 1) {   // hasil: gambar JPEG (data URL). Gagal bila browser memblokir foto latar (buka lewat hosting/server).
  await loadCardFonts();
  const o = cardOpts(card), info = cardSizeInfo(card.size), host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-99999px;top:0;width:${CARD_REF_W}px;pointer-events:none`;
  host.innerHTML = cardHTML(card.t, { ...o });
  document.body.appendChild(host);
  try {
    const gc = host.querySelector('.gc'); gc.style.margin = '0'; gc.style.boxShadow = 'none'; gc.style.width = '100%'; gc.style.minWidth = '0';
    host.querySelectorAll('.mv,.dx,.gc-bg').forEach(b => b.remove());
    const g = gc.getBoundingClientRect(), outW = Math.round(info.w * 10 * scale), k = outW / g.width, outH = Math.round(g.height * k);
    const bg = await loadCardBg(card.t);
    const cv = document.createElement('canvas'); cv.width = outW; cv.height = outH;
    const ctx = cv.getContext('2d'); ctx.scale(k, k);
    ctx.fillStyle = '#FFEEEE'; ctx.fillRect(0, 0, g.width, g.height);
    if (bg) {   // foto latar: isi penuh kartu (seperti object-fit: cover)
      const s = Math.max(g.width / bg.naturalWidth, g.height / bg.naturalHeight), w = bg.naturalWidth * s, h = bg.naturalHeight * s;
      ctx.drawImage(bg, (g.width - w) / 2, (g.height - h) / 2, w, h);
    }
    ctx.textBaseline = 'alphabetic';
    for (const ed of host.querySelectorAll('.ed')) {   // tulisan: posisi tiap huruf diambil dari tata letak asli
      const node = ed.firstChild; if (!node || node.nodeType !== 3 || !node.textContent.trim()) continue;
      const cs = getComputedStyle(ed);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; ctx.fillStyle = cs.color;
      const asc = ctx.measureText('M').fontBoundingBoxAscent ?? parseFloat(cs.fontSize) * .8;
      const rg = document.createRange(); let i = 0;
      for (const ch of node.textContent) {
        if (ch.trim()) { rg.setStart(node, i); rg.setEnd(node, i + ch.length); const r = rg.getBoundingClientRect(); ctx.fillText(ch, r.left - g.left, r.top - g.top + asc); }
        i += ch.length;
      }
    }
    return cv.toDataURL('image/jpeg', .92);
  } finally { host.remove(); }
}
const cardRO = c => cardHTML(c.t, { ...cardOpts(c), ro: true });   // cadangan: kartu tampil sebagai HTML bila gambar gagal dibuat

/* ----- penyimpanan pesanan (localStorage) ----- */
function loadOrders() {
  let raw; try { raw = localStorage.getItem(ORDERS_KEY); } catch (e) { return { list: [], error: true }; }
  if (!raw) return { list: [], error: false };
  try {
    const a = JSON.parse(raw); if (!Array.isArray(a)) throw 0;
    return { list: a.filter(o => o && o.id && Array.isArray(o.items) && o.customer), error: false };
  } catch (e) { return { list: [], error: true }; }
}
function saveOrders(list) { try { localStorage.setItem(ORDERS_KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
const putImg = (k, d) => { try { localStorage.setItem(IMG_PREFIX + k, d); return true; } catch (e) { return false; } };
const getImg = k => { try { return k ? localStorage.getItem(IMG_PREFIX + k) : null; } catch (e) { return null; } };
const delImg = k => { try { localStorage.removeItem(IMG_PREFIX + k); } catch (e) { } };
function newOrderId(list) {
  const d = new Date(), ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  let id; do { id = `SBK-${ymd}-${String(Math.floor(Math.random() * 9000) + 1000)}`; } while (list.some(o => o.id === id));
  return id;
}
const fmtDate = iso => { const d = new Date(iso); return isNaN(d) ? '-' : d.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':'); };
const orderTimeLabel = o => o.method === 'delivery' ? 'Jam Pengantaran' : 'Jam Pengambilan';
const methodLabel = o => o.method === 'delivery' ? 'Pengiriman' : 'Ambil Sendiri';
const itemMeta = i => `Ukuran ${esc(i.size)}${i.varian ? ' · ' + esc(i.varian) : ''}`;

/* ----- pembayaran simulasi ----- */
function makeVA(m) { let s = m.prefix; while (s.length < 15) s += Math.floor(Math.random() * 10); return s; }
function qrisSVG(seed) {   // gambar dekoratif (acak), BUKAN kode QR yang valid
  let h = 7; for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => { h |= 0; h = h + 0x6D2B79F5 | 0; let t = Math.imul(h ^ h >>> 15, 1 | h); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const N = 29, fin = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#3b2b2f"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#3b2b2f"/>`;
  let r = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if ((x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9) || (x > 10 && x < 18 && y > 10 && y < 18)) continue;
    if (rnd() > .5) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  return `<svg class="qris" viewBox="-2 -2 33 33" role="img" aria-label="Gambar QRIS dekoratif (simulasi, tidak dapat dipindai)"><rect x="-2" y="-2" width="33" height="33" rx="2" fill="#fff"/><g fill="#3b2b2f">${r}</g>${fin(0, 0)}${fin(N - 7, 0)}${fin(0, N - 7)}<rect x="11" y="11" width="7" height="7" rx="1.5" fill="#B32F4E"/><text x="14.5" y="15.6" text-anchor="middle" font-size="2.6" font-weight="700" fill="#fff" font-family="sans-serif">QRIS</text></svg>`;
}
function payInfoHTML(pay, total, va, seed) {
  const m = PAY_METHODS.find(x => x.id === pay);
  if (!m) return '<p class="muted">Pilih metode pembayaran untuk melihat instruksi.</p>';
  if (m.bank) return `<div class="payinfo"><strong>Transfer ${m.name} – Virtual Account (Simulasi)</strong><div class="va" aria-label="Nomor Virtual Account">${esc(String(va || '').replace(/(\d{4})(?=\d)/g, '$1 '))}</div>
    <p>Jumlah transfer: <b>${rp(total)}</b></p><ol><li>Buka aplikasi atau ATM ${m.name}.</li><li>Pilih Transfer › Virtual Account, lalu masukkan nomor di atas.</li><li>Periksa nominal, lalu konfirmasi pembayaran.</li></ol>
    <p class="sim">Nomor Virtual Account ini palsu untuk simulasi dan tidak dapat digunakan untuk transfer sungguhan.</p></div>`;
  if (m.id === 'qris') return `<div class="payinfo qr"><strong>QRIS (Simulasi)</strong>${qrisSVG(seed)}<p>Jumlah pembayaran: <b>${rp(total)}</b></p>
    <p class="sim">Gambar QRIS ini hanya dekorasi. Pembayaran hanya simulasi dan tidak dapat dipindai.</p></div>`;
  return `<div class="payinfo"><strong>Tunai saat Pengambilan</strong><p>Siapkan uang tunai sebesar <b>${rp(total)}</b> dan bayar langsung di toko saat mengambil pesananmu. Tidak ada pembayaran online.</p></div>`;
}

/* ----- halaman Checkout ----- */
const checkoutRows = () => loadCart().map(i => ({ i, p: getP(i.id) })).filter(x => x.p && eligible(x.i, x.p));
const newToken = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
function pageCheckout() {
  const rows = checkoutRows();
  if (!rows.length) return `<div class="wrap page"><div class="empty">${ICON.cart.replace('stroke-width="2"', 'stroke-width="1.2"')}<h2>Belum Ada Produk yang Dipilih</h2><p>Pilih produk di keranjang atau gunakan Beli Langsung untuk melanjutkan.</p><br><a class="btn" href="#/keranjang">Ke Keranjang</a> <a class="btn alt" href="#/katalog">Ke Katalog</a></div></div>`;
  const d = Object.assign({ name: '', phone: '', address: '', method: 'pickup', pickTime: '', delTime: '', pay: '', token: '', va: {} }, jget(sessionStorage, DRAFT_KEY, {}));
  if (!d.token) d.token = newToken();
  const tv = v => okTime(v) ? v : '';
  const cards = rows.map((r, n) => ({ r, n })).filter(x => x.r.i.card && x.r.i.card.t >= 0);
  setTimeout(() => bindCheckout(d, rows));
  return `<div class="wrap page co-page"><h2>Checkout</h2><div class="co"><div class="co-main">
  <section class="box"><h3>Data Pemesan</h3>
    <label class="fld">Nama lengkap<input id="f-name" type="text" autocomplete="name" maxlength="60" value="${esc(d.name)}"><small class="err" id="e-name"></small></label>
    <label class="fld">Nomor telepon<input id="f-phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="18" placeholder="contoh: 081234567890" value="${esc(d.phone)}"><small class="err" id="e-phone"></small></label></section>
  <section class="box"><h3>Pengambilan / Pengiriman</h3>
    <div class="opts" role="radiogroup" aria-label="Metode pengambilan">
      <label class="opt"><input type="radio" name="method" value="pickup"><span><b>Ambil Sendiri</b><small>Biaya ${rp(0)}</small></span></label>
      <label class="opt"><input type="radio" name="method" value="delivery"><span><b>Pengiriman</b><small>Biaya ${rp(SHIPPING_FEE)}</small></span></label></div>
    <div id="boxPickup"><label class="fld">Jam Pengambilan<input id="f-pick" type="time" value="${tv(d.pickTime)}"><small class="err" id="e-pick"></small></label></div>
    <div id="boxDeliv"><label class="fld">Alamat Pengiriman<textarea id="f-addr" rows="3" maxlength="250" placeholder="Jalan, nomor rumah, kecamatan, kota">${esc(d.address)}</textarea><small class="err" id="e-addr"></small></label>
    <label class="fld">Jam Pengantaran<input id="f-del" type="time" value="${tv(d.delTime)}"><small class="err" id="e-del"></small></label></div></section>
  ${cards.length ? `<section class="box"><h3>Kartu Ucapan</h3>${cards.map(({ r, n }) => `<div class="cardrow" data-n="${n}"><div class="cardprev"><img alt="Hasil kartu ucapan ${esc(r.p.name)}" hidden><small class="muted">Membuat pratinjau…</small></div>
    <div><b>${esc(r.p.name)}</b><br><small>${esc(cardName(r.i.card))}</small></div></div>`).join('')}</section>` : ''}
  <section class="box"><h3>Metode Pembayaran</h3><div class="opts" id="payOpts" role="radiogroup" aria-label="Metode pembayaran">
    <p class="grp">Transfer Bank</p>${PAY_METHODS.filter(m => m.bank).map(m => `<label class="opt"><input type="radio" name="pay" value="${m.id}"><span><b>${m.name}</b><small>Virtual Account</small></span></label>`).join('')}
    <p class="grp">Lainnya</p><label class="opt"><input type="radio" name="pay" value="qris"><span><b>QRIS</b><small>Simulasi</small></span></label>
    <label class="opt" id="optCash"><input type="radio" name="pay" value="cash"><span><b>Tunai saat Pengambilan</b><small>Hanya untuk Ambil Sendiri</small></span></label></div>
    <small class="err" id="e-pay"></small><div id="payInfo" aria-live="polite"></div></section></div>
  <section class="box co-total"><h3>Total Pembayaran</h3><div class="sumtot"><div><span>Subtotal</span><span id="sSub"></span></div><div><span>Biaya pengiriman</span><span id="sShip"></span></div><div class="g"><span>Total</span><b id="sTot"></b></div></div>
    <button class="btn" id="confirm" type="button">Konfirmasi Pesanan</button><small class="muted">Simulasi pemesanan: tidak ada transaksi sungguhan.</small></section></div></div>`;
}
function bindCheckout(d, rows) {
  const $i = id => document.getElementById(id);
  if (!$i('f-name')) return;
  let busy = false; const save = () => jset(sessionStorage, DRAFT_KEY, d);
  const sub = () => rows.reduce((s, r) => s + priceOf(r.p, r.i.size) * r.i.qty, 0);
  const fee = () => d.method === 'delivery' ? SHIPPING_FEE : 0;
  const timeVal = () => d.method === 'delivery' ? d.delTime : d.pickTime;
  function render() {
    const del = d.method === 'delivery';
    $i('boxPickup').hidden = del; $i('boxDeliv').hidden = !del; $i('optCash').hidden = del;
    if (del && d.pay === 'cash') d.pay = '';
    $$('input[name=method]').forEach(r => r.checked = r.value === d.method);
    $$('input[name=pay]').forEach(r => r.checked = r.value === d.pay);
    $$('.co .opt').forEach(o => o.classList.toggle('on', o.querySelector('input').checked));
    const m = PAY_METHODS.find(x => x.id === d.pay); if (m && m.bank && !d.va[m.id]) d.va[m.id] = makeVA(m);
    const total = sub() + fee();
    $i('payInfo').innerHTML = payInfoHTML(d.pay, total, d.va[d.pay], d.token);
    $i('sSub').textContent = rp(sub()); $i('sShip').textContent = rp(fee()); $i('sTot').textContent = rp(total);
    save();
  }
  const err = (id, msg) => { const e = $i('e-' + id); if (e) e.textContent = msg || ''; const f = { name: 'f-name', phone: 'f-phone', pick: 'f-pick', addr: 'f-addr', del: 'f-del' }[id]; if (f) $i(f).setAttribute('aria-invalid', msg ? 'true' : 'false'); };
  $i('f-name').oninput = e => { d.name = e.target.value; err('name'); render(); };
  $i('f-phone').oninput = e => { d.phone = e.target.value; err('phone'); render(); };
  $i('f-addr').oninput = e => { d.address = e.target.value; err('addr'); render(); };
  ['input', 'change'].forEach(ev => {
    $i('f-pick').addEventListener(ev, e => { d.pickTime = e.target.value; err('pick'); render(); });
    $i('f-del').addEventListener(ev, e => { d.delTime = e.target.value; err('del'); render(); });
  });
  $$('input[name=method]').forEach(r => r.onchange = () => { d.method = r.value; render(); });
  $$('input[name=pay]').forEach(r => r.onchange = () => { d.pay = r.value; err('pay'); render(); });
  /* hasil akhir kartu ucapan (tanpa pilihan ukuran) */
  const prev = n => {
    const r = rows[n], box = $(`.cardrow[data-n="${n}"]`); if (!box) return;
    const img = $('img', box), note = $('.cardprev small', box);
    renderCardImg(r.i.card, .7).then(u => { img.src = u; img.hidden = false; note.hidden = true; })
      .catch(() => { $('.cardprev', box).innerHTML = cardRO(r.i.card); });
  };
  $$('.cardrow').forEach(box => prev(+box.dataset.n));
  /* validasi & konfirmasi */
  function validate() {
    let first = null; const bad = (id, msg, f) => { err(id, msg); if (!first) first = $i(f); };
    ['name', 'phone', 'pick', 'addr', 'del', 'pay'].forEach(k => err(k));
    if (d.name.trim().length < 2) bad('name', 'Nama wajib diisi.', 'f-name');
    const ph = d.phone.replace(/[\s\-().]/g, '');
    if (!ph) bad('phone', 'Nomor telepon wajib diisi.', 'f-phone');
    else if (!/^(\+?62|0)\d{8,13}$/.test(ph)) bad('phone', 'Nomor telepon tidak valid. Contoh: 081234567890.', 'f-phone');
    if (d.method === 'delivery') {
      if (d.address.trim().length < 10) bad('addr', 'Alamat pengiriman wajib diisi lengkap.', 'f-addr');
      if (!okTime(d.delTime)) bad('del', 'Isi jam pengantaran.', 'f-del');
    } else if (!okTime(d.pickTime)) bad('pick', 'Isi jam pengambilan.', 'f-pick');
    if (!d.pay || (d.pay === 'cash' && d.method === 'delivery')) { err('pay', 'Pilih metode pembayaran.'); if (!first) first = $i('payOpts'); }
    if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (first.focus) first.focus({ preventScroll: true }); toast('Lengkapi data yang masih kosong'); return false; }
    return true;
  }
  $i('confirm').onclick = async () => {
    if (busy) return;
    if (!validate()) return;
    busy = true; const btn = $i('confirm'); btn.disabled = true; btn.textContent = 'Memproses…';
    const unbusy = () => { busy = false; btn.disabled = false; btn.textContent = 'Konfirmasi Pesanan'; };
    try {
      const cur = checkoutRows();   // cek ulang stok & pilihan keranjang
      if (!cur.length || cur.length !== rows.length || cur.some((c, k) => itemKey(c.i) !== itemKey(rows[k].i) || c.i.qty !== rows[k].i.qty)) { toast('Isi keranjang berubah, silakan periksa kembali'); location.hash = '#/keranjang'; return; }
      const { list, error } = loadOrders();
      const dup = list.find(o => o.token === d.token);   // tombol ditekan lebih dari sekali
      if (dup) { location.replace('#/berhasil/' + dup.id); return; }
      if (error) { try { localStorage.setItem(ORDERS_KEY + '_rusak', localStorage.getItem(ORDERS_KEY) || ''); } catch (e) { } }
      const id = newOrderId(list), del = d.method === 'delivery', saved = [];
      let imgFail = false;
      const items = [];
      for (let n = 0; n < rows.length; n++) {
        const r = rows[n], pr = priceOf(r.p, r.i.size), it = { id: r.p.id, name: r.p.name, cat: r.p.cat, size: r.i.size, varian: r.i.varian || '', qty: r.i.qty, price: pr, sub: pr * r.i.qty, photo: r.p.photos[0], card: null };
        if (r.i.card && r.i.card.t >= 0) {
          const c = { t: r.i.card.t, v2: true, ...cardOpts(r.i.card), size: CARD_SIZE.id, name: cardName(r.i.card), img: null };
          let png = null;
          try { png = await renderCardImg(c); } catch (e) { }
          if (png) {
            const key = `${id}_${n}`;
            if (putImg(key, png)) { c.img = key; saved.push(key); }
            else { try { png = await renderCardImg(c, .5); } catch (e) { png = null; } if (png && putImg(key, png)) { c.img = key; saved.push(key); } else imgFail = true; }
          } else imgFail = true;
          it.card = c;
        }
        items.push(it);
      }
      const subtotal = items.reduce((s, x) => s + x.sub, 0), shipping = del ? SHIPPING_FEE : 0;
      const order = {
        id, token: d.token, createdAt: new Date().toISOString(),
        customer: { name: d.name.trim(), phone: d.phone.trim(), address: del ? d.address.trim() : '' },
        method: d.method, time: fmtTime(del ? d.delTime : d.pickTime), shipping, subtotal, total: subtotal + shipping,
        pay: d.pay, va: (PAY_METHODS.find(x => x.id === d.pay) || {}).bank ? d.va[d.pay] : '', status: 'wait', payStatus: d.pay === 'cash' ? 'cod' : 'unpaid', items
      };
      if (!saveOrders([order, ...list])) { saved.forEach(delImg); toast('Penyimpanan penuh, pesanan belum tersimpan. Hapus data browser lalu coba lagi.'); unbusy(); return; }
      const keys = new Set(rows.map(r => itemKey(r.i)));   // hanya produk yang dipesan dihapus dari keranjang
      saveCart(loadCart().filter(i => !keys.has(itemKey(i))));
      try { sessionStorage.removeItem(DRAFT_KEY); } catch (e) { }
      if (imgFail) toast('Pesanan tersimpan. Gambar kartu akan dibuat ulang saat dibuka.');
      location.replace('#/berhasil/' + id);
    } catch (e) { toast('Terjadi kesalahan, silakan coba lagi'); unbusy(); }
  };
  render();
}

/* ----- Riwayat pesanan & bukti pemesanan ----- */
const statusBadges = o => `<span class="bdg st-${o.status}">${orderLabel(o)}</span><span class="bdg pay-${o.payStatus}">${PAY_LABEL[o.payStatus] || o.payStatus}</span>`;
function ordersProblem(error) {
  return `<div class="wrap page"><div class="empty"><h2>Data Pesanan Tidak Dapat Dibaca</h2><p>${error ? 'Data pesanan di browser ini rusak atau tidak dapat diakses.' : 'Pesanan tidak ditemukan.'}</p><br>
  <a class="btn" href="#/pesanan">Riwayat Pesanan</a> <a class="btn alt" href="#/katalog">Ke Katalog</a>${error ? '<br><br><button class="btn alt" id="resetOrders">Reset Data Pesanan</button>' : ''}</div></div>`;
}
const itemPhoto = i => i.photo || ((getP(i.id) || { photos: [''] }).photos[0]);   // foto dari data pesanan; cadangan: data produk
function pageHistory() {
  const { list, error } = loadOrders();
  setTimeout(() => { const b = $('#resetOrders'); if (b) b.onclick = () => { if (confirm('Hapus data pesanan yang rusak di browser ini?')) { try { localStorage.setItem(ORDERS_KEY + '_rusak', localStorage.getItem(ORDERS_KEY) || ''); localStorage.removeItem(ORDERS_KEY); } catch (e) { } route(); } }; });
  if (error) return ordersProblem(true);
  if (!list.length) return `<div class="wrap page"><div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PKG}</svg><h2>Belum Ada Pesanan</h2><p>Pesanan yang kamu buat akan muncul di sini. Yuk, pilih buket pertamamu!</p><br><a class="btn" href="#/katalog">Lihat Katalog</a></div></div>`;
  return `<div class="wrap page"><h2>Riwayat Pesanan</h2>${list.map(o => `<article class="box ord">
    <div class="ord-h"><div><b>${esc(o.id)}</b><br><small class="muted">${fmtDate(o.createdAt)}</small></div><div class="bdgs">${statusBadges(o)}</div></div>
    <ul class="ord-items">${o.items.map(i => `<li class="ord-li"><img class="ord-th" src="${esc(itemPhoto(i))}" alt="${esc(i.name)}" loading="lazy" width="56" height="56"><span>${esc(i.name)} · ${itemMeta(i)} × ${i.qty}</span></li>`).join('')}</ul>
    <dl class="kv"><div><dt>Total</dt><dd><b>${rp(o.total)}</b></dd></div><div><dt>Pembayaran</dt><dd>${esc(payName(o.pay))}</dd></div><div><dt>${methodLabel(o)}</dt><dd>${orderTimeLabel(o)}: ${esc(o.time)}</dd></div></dl>
    <a class="btn sm" href="#/pesanan/${encodeURIComponent(o.id)}">Lihat Detail &amp; Bukti Pesanan</a></article>`).join('')}</div>`;
}
function updateOrder(id, fn) {
  const { list, error } = loadOrders(); const o = list.find(x => x.id === id);
  if (error || !o) return false; fn(o); return saveOrders(list);
}
function pageOrder(id) {
  const { list, error } = loadOrders(), o = list.find(x => x.id === id);
  if (error || !o) return ordersProblem(error);
  const del = o.method === 'delivery';
  const kv = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
  setTimeout(() => bindOrder(o));
  return `<div class="wrap page receipt"><h2>Bukti Pemesanan</h2>
  <section class="box"><div class="ord-h"><div><small class="muted">Nomor pesanan</small><br><b class="ordno">${esc(o.id)}</b><br><small class="muted">${fmtDate(o.createdAt)}</small></div></div></section>
  <section class="box"><h3>Informasi Pelanggan</h3><dl class="kv">${kv('Nama', esc(o.customer.name))}${kv('Telepon', esc(o.customer.phone))}</dl></section>
  <section class="box"><h3>${methodLabel(o)}</h3><dl class="kv">${kv('Metode', methodLabel(o))}${del ? kv('Alamat pengiriman', esc(o.customer.address)) : ''}${kv(orderTimeLabel(o), esc(o.time))}</dl></section>
  <section class="box"><h3>Ringkasan Pesanan</h3>${o.items.map((i, n) => `<div class="oitem"><img src="${esc(i.photo)}" alt="${esc(i.name)}"><div><b>${esc(i.name)}</b><br><small>${itemMeta(i)} · ${i.qty} × ${rp(i.price)} = <b>${rp(i.sub)}</b></small>
    ${i.card ? `<div class="ocard"><small>Kartu ucapan: ${esc(i.card.name)}<br>Ukuran card: ${CARD_SIZE.cm}${cardText(i.card) ? '<br>Pesan: “' + esc(cardText(i.card)) + '”' : ''}</small>
    <img class="cardpng" data-i="${n}" alt="Gambar kartu ucapan ${esc(i.name)}" hidden><div class="cardhtml" hidden></div><small class="muted cardnote">Memuat gambar kartu…</small><a class="btn alt sm dl" data-i="${n}" hidden>Unduh Kartu</a></div>` : '<br><small class="muted">Tanpa kartu ucapan</small>'}</div></div>`).join('')}</section>
  <section class="box"><h3>Rincian Harga</h3><div class="sumtot"><div><span>Subtotal produk</span><span>${rp(o.subtotal)}</span></div><div><span>Biaya pengiriman</span><span>${rp(o.shipping)}</span></div><div class="g"><span>Total pembayaran</span><b>${rp(o.total)}</b></div></div></section>
  <section class="box"><h3>Pembayaran: ${esc(payName(o.pay))}</h3>${payInfoHTML(o.pay, o.total, o.va, o.token || o.id)}</section>
  <div class="chips"><button class="btn alt" id="cancelOrder" type="button">Batalkan Pesanan</button></div>
  <div class="chips"><a class="btn" href="#/pesanan">Lihat Riwayat Pesanan</a><a class="btn alt" href="#/katalog">Kembali ke Katalog</a></div></div>`;
}
/* Halaman setelah checkout berhasil */
function pageSuccess(id) {
  const { list, error } = loadOrders(), o = list.find(x => x.id === id);
  if (error || !o) return ordersProblem(error);
  return `<div class="wrap page done-pg"><div class="done" role="status">
    <svg class="done-ic" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#FFEEEE" stroke="#B32F4E" stroke-width="3"/><path d="M19 33l9 9 17-19" fill="none" stroke="#8D9A2E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <h2>Pesanan Berhasil!</h2><p>Pesananmu sudah berhasil dibuat. Nomor pesanan: <b>${esc(o.id)}</b></p>
    <div class="chips"><a class="btn" href="#/pesanan/${encodeURIComponent(o.id)}">Lihat Ringkasan Pesanan</a><a class="btn alt" href="#/katalog">Kembali ke Katalog</a></div></div></div>`;
}
function bindOrder(o) {
  const cb = $('#cancelOrder');
  if (cb) cb.onclick = () => {
    if (!confirm('Batalkan pesanan ' + o.id + '? Pesanan akan dihapus dari Riwayat Pesanan dan tidak dapat dikembalikan.')) return;
    const { list, error } = loadOrders(); if (error) { toast('Data pesanan tidak dapat dibaca'); return; }
    const cur = list.find(x => x.id === o.id);
    if (!saveOrders(list.filter(x => x.id !== o.id))) { toast('Gagal membatalkan pesanan, coba lagi'); return; }
    (cur ? cur.items : o.items).forEach(it => { if (it.card && it.card.img) delImg(it.card.img); });
    toast('Pesanan dibatalkan');
    location.hash = '#/pesanan';
  };
  $$('.cardpng').forEach(async img => {   // gambar kartu: dari penyimpanan, atau digambar ulang bila hilang
    const par = img.parentElement, it = o.items[+img.dataset.i], note = par.querySelector('.cardnote'), dl = par.querySelector('.dl'), alt = par.querySelector('.cardhtml');
    let src = getImg(it.card.img);
    if (!src) { try { src = await renderCardImg(it.card); } catch (e) { src = null; } }
    if (!src) { alt.innerHTML = cardRO(it.card); alt.hidden = false; note.hidden = true; return; }   // cadangan: tampil sebagai HTML
    img.src = src; img.hidden = false; note.hidden = true; dl.href = src; dl.download = `kartu-${o.id}-${+img.dataset.i + 1}.jpg`; dl.hidden = false;
  });
}
const ICON_PKG = '<path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="M16.5 9.4 7.5 4.21"/><path d="m3.29 7 8.7 5 8.71-5"/><path d="M12 22V12"/><circle cx="18.5" cy="15.5" r="2.5"/><path d="M20.27 17.27 22 19"/>';

/* ---------- 5) ROUTER ---------- */
let prevHash = '', fromHash = '';
let navCount = 0;
function route() {
  endTrack();
  const h = location.hash.slice(1) || '/home', [, pg, arg] = h.split('/');
  if (pg === 'produk') fromHash = prevHash && !prevHash.startsWith('/produk') ? prevHash : '';
  app.onclick = null;
  let html, nav = pg;
  if (pg === 'katalog') html = arg ? pageCategory(arg) : pageCatalog();
  else if (pg === 'produk') { html = pageDetail(arg); nav = 'katalog'; }
  else if (pg === 'keranjang') { html = pageCart(); setTimeout(bindCart); }
  else if (pg === 'faq') html = pageFaq();
  else if (pg === 'checkout') { html = pageCheckout(); nav = 'keranjang'; }
  else if (pg === 'berhasil') { html = pageSuccess(decodeURIComponent(arg || '')); nav = 'pesanan'; }
  else if (pg === 'pesanan') { html = arg ? pageOrder(decodeURIComponent(arg)) : pageHistory(); nav = 'pesanan'; }
  else { html = pageHome(); nav = 'home'; }
  app.innerHTML = html;
  navCount++;
  if (['katalog', 'produk', 'keranjang', 'faq', 'checkout', 'pesanan'].includes(pg)) {
    $('.wrap', app).insertAdjacentHTML('afterbegin', '<button class="back" id="gback">← Kembali</button>');
    $('#gback').onclick = () => {
      if (pg === 'katalog' && arg) location.hash = '#/katalog';              // kategori -> Katalog
      else if (pg === 'produk') fromHash ? history.back() : (location.hash = '#/katalog' + (getP(arg) ? '/' + getP(arg).cat : ''));
      else if (pg === 'checkout') location.hash = '#/keranjang';
      else if (pg === 'pesanan' && arg) location.hash = '#/pesanan';
      else navCount > 1 ? history.back() : (location.hash = '#/home');
    };
  }
  $$('header a[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === nav));
  $('#nav').classList.remove('open'); $('#burger').setAttribute('aria-expanded', 'false');
  // pulihkan scroll jika kembali dari Detail Produk
  const back = prevHash.startsWith('/produk') && !h.startsWith('/produk');
  scrollTo(0, back ? jget(sessionStorage, 'sebuket_scroll_' + h, 0) : 0);
  prevHash = h; observeReveal();
}
addEventListener('hashchange', () => { jset(sessionStorage, 'sebuket_scroll_' + prevHash, window.__lastScroll || 0); route(); });
addEventListener('scroll', () => { window.__lastScroll = scrollY; }, { passive: true });
document.addEventListener('click', e => {   // klik kartu produk => buka detail (satu navigasi saja)
  const c = e.target.closest('.card[data-id]'); if (c) { jset(sessionStorage, 'sebuket_scroll_' + prevHash, scrollY); location.hash = '#/produk/' + c.dataset.id; }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.card[data-id]')) e.target.click(); });
$('#burger').onclick = () => { const o = $('#nav').classList.toggle('open'); $('#burger').setAttribute('aria-expanded', o); };
// Tombol WhatsApp mengambang => buka WhatsApp toko (nomor dari CONFIG.wa)
const waBtn = $('#waFloat');
if (waReady()) waBtn.href = 'https://wa.me/' + CONFIG.wa;
else { waBtn.removeAttribute('target'); waBtn.onclick = e => { e.preventDefault(); toast('Nomor WhatsApp belum diisi di script.js'); }; }
// Dropdown menu Katalog: daftar kategori dibuat dari CATEGORIES
const hasSub = $('.has-sub');   // menu Katalog menutup setelah diklik, muncul lagi saat kursor datang kembali
hasSub.addEventListener('click', e => { if (e.target.closest('a')) { hasSub.classList.add('closed'); if (document.activeElement) document.activeElement.blur(); } });
hasSub.addEventListener('mouseleave', () => hasSub.classList.remove('closed'));
$('#catSub').innerHTML = '<a href="#/katalog">Semua Kategori</a>' + CATEGORIES.map(c => `<a href="#/katalog/${c.id}">${c.name}</a>`).join('');

/* ---------- INTRO BUNGA MEKAR (pengaturan ada di sini) ---------- */
const INTRO = {
  total: 6500, bloomStart: 800, bloomEnd: 4500, nameAt: 3500, swayAt: 4500, dissolveAt: 5500,   // milidetik
  countMobile: 165, countDesktop: 270,      // jumlah bunga (dikurangi 30% di perangkat lambat)
  title: 'Sebuket', tagline: 'Satu buket, satu cerita',
  about: 'Buket bunga yang dirangkai hangat untuk setiap momen.'
};
const ORANGE = '#E8832A';
const ring = (n, f, off = 0) => Array.from({ length: n }, (_, i) => `<g transform="rotate(${off + i * 360 / n} 50 50)">${f}</g>`).join('');
const PETAL = 'M50 50C33 38 37 9 50 3C63 9 67 38 50 50Z';
const sym = (id, body) => `<symbol id="fl-${id}" viewBox="0 0 100 100">${body}</symbol>`;
// Tiap jenis bunga didefinisikan SEKALI sebagai <symbol>, lalu dipakai berulang dengan <use>
const SYMBOLS = `<defs>
<radialGradient id="gPk" cx=".5" cy=".9" r=".9"><stop offset="0" stop-color="#B32F4E"/><stop offset=".5" stop-color="#FFB5BD"/><stop offset="1" stop-color="#FFEEEE"/></radialGradient>
<radialGradient id="gTu" cx=".5" cy=".85" r=".95"><stop offset="0" stop-color="#FFB5BD"/><stop offset=".65" stop-color="#FFB5BD"/><stop offset="1" stop-color="#8D9A2E"/></radialGradient>
<radialGradient id="gWh" cx=".5" cy=".9" r=".9"><stop offset="0" stop-color="#FFB5BD"/><stop offset=".45" stop-color="#fff"/><stop offset="1" stop-color="#FFEEEE"/></radialGradient></defs>` +
  sym('lily', ring(6, `<path d="${PETAL}" fill="url(#gPk)" stroke="#B32F4E" stroke-opacity=".35" stroke-width=".6"/><circle cx="47" cy="30" r="1.4" fill="#B32F4E"/><circle cx="53" cy="24" r="1.2" fill="#B32F4E"/><circle cx="50" cy="36" r="1.1" fill="#B32F4E"/><path d="M50 50V33" stroke="#B32F4E" stroke-width=".7"/><circle cx="50" cy="32" r="2" fill="${ORANGE}"/>`) + '<circle cx="50" cy="50" r="4" fill="#F4F7CD"/>') +
  sym('tulip', ring(5, '<path d="M50 50C34 40 36 16 50 10C64 16 66 40 50 50Z" fill="#FFB5BD" opacity=".8"/>', 36) + ring(5, '<path d="M50 50C30 40 32 12 50 5C68 12 70 40 50 50Z" fill="url(#gTu)" stroke="#B32F4E" stroke-opacity=".3" stroke-width=".6"/>')) +
  sym('orchid', ring(5, '<ellipse cx="50" cy="27" rx="14" ry="22" fill="url(#gWh)" stroke="#FFB5BD" stroke-width=".8"/><circle cx="46" cy="22" r="1.2" fill="#D4546F"/><circle cx="54" cy="30" r="1.2" fill="#D4546F"/><circle cx="50" cy="15" r="1" fill="#D4546F"/>') + `<circle cx="50" cy="50" r="8" fill="#FFB5BD"/><circle cx="50" cy="50" r="4" fill="#B32F4E"/><circle cx="50" cy="50" r="2" fill="${ORANGE}"/>`) +
  sym('gerbera', ring(18, '<ellipse cx="50" cy="19" rx="4.6" ry="17" fill="url(#gPk)"/>') + `<circle cx="50" cy="50" r="11" fill="#B32F4E"/><circle cx="50" cy="50" r="7" fill="${ORANGE}"/><circle cx="50" cy="50" r="3" fill="#F4F7CD"/>`) +
  sym('rose', [[46, '#B32F4E'], [38, '#D4546F'], [30, '#FFB5BD'], [22, '#B32F4E'], [14, '#FFB5BD'], [7, '#B32F4E']].map(([r, c]) => `<circle cx="50" cy="50" r="${r}" fill="${c}" stroke="#FFEEEE" stroke-opacity=".55"/>`).join('') + ring(6, '<path d="M50 8C60 20 60 30 50 34" stroke="#FFEEEE" stroke-opacity=".6" fill="none" stroke-width="1.2"/>')) +
  sym('peony', ring(8, '<ellipse cx="50" cy="22" rx="17" ry="21" fill="url(#gPk)" stroke="#B32F4E" stroke-opacity=".25" stroke-width=".6"/>') + ring(8, '<ellipse cx="50" cy="32" rx="12" ry="15" fill="#FFB5BD" fill-opacity=".9" stroke="#FFEEEE" stroke-width=".8"/>', 22.5) + '<circle cx="50" cy="50" r="9" fill="#FFEEEE"/><circle cx="50" cy="50" r="4" fill="#B32F4E"/>') +
  sym('leafA', '<path d="M50 96C18 70 18 30 50 4C82 30 82 70 50 96Z" fill="#8D9A2E"/><path d="M50 92V10" stroke="#F4F7CD" stroke-width="1.5"/>') +
  sym('leafB', '<path d="M50 96C18 70 18 30 50 4C82 30 82 70 50 96Z" fill="#F4F7CD" stroke="#8D9A2E" stroke-width="1"/><path d="M50 92V10" stroke="#8D9A2E" stroke-width="1.5"/>');

/* Susun bunga: grid berjitter + bunga besar di tepi/sudut + lapisan dasar => tidak ada celah */
function buildIntro() {
  const W = innerWidth, H = innerHeight, R = Math.random;
  let n = W < 700 ? INTRO.countMobile : INTRO.countDesktop;
  if ((navigator.hardwareConcurrency || 8) <= 4) n = Math.round(n * .7);
  const g = Math.round(n * .8), cols = Math.ceil(Math.sqrt(g * W / H)), rows = Math.ceil(g / cols);
  const cw = W / cols, ch = H / rows, cell = Math.max(cw, ch), types = ['lily', 'tulip', 'orchid', 'gerbera', 'rose', 'peony'];
  const base = [], items = [];
  const mk = (t, cx, cy, s, leaf) => ({ t, cx, cy, s, r: leaf ? Math.round(R() * 360 - 180) : Math.round(R() * 50 - 25) });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) base.push(mk((i + j) % 2 ? 'peony' : 'rose', W * i / 2, H * j / 2, Math.max(W, H) * .55));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = (c + .5) * cw + (R() - .5) * cw * .5, cy = (r + .5) * ch + (R() - .5) * ch * .5;
    items.push(mk(types[(R() * 6) | 0], cx, cy, cell * (1.5 + R() * .9)));
    if (R() < .4) items.push(mk(R() < .5 ? 'leafA' : 'leafB', cx + (R() - .5) * cw, cy + (R() - .5) * ch, cell * (.9 + R() * .6), true));
  }
  for (let c = 0; c <= cols; c++) [0, H].forEach(y => items.push(mk(types[(R() * 6) | 0], c * cw, y, cell * 2.2)));
  for (let r = 0; r <= rows; r++) [0, W].forEach(x => items.push(mk(types[(R() * 6) | 0], x, r * ch, cell * 2.2)));
  [[0, 0], [W, 0], [0, H], [W, H]].forEach(([x, y]) => items.push(mk('peony', x, y, cell * 3)));
  const half = Math.hypot(W / 2, H / 2);
  [...base, ...items].forEach(o => {   // jeda bunga berdasarkan jarak dari pusat
    const d = Math.min(1, Math.hypot(o.cx - W / 2, o.cy - H / 2) / half);
    o.d = (INTRO.bloomStart + Math.pow(d, .85) * (INTRO.bloomEnd - INTRO.bloomStart - 950) + R() * 120) / 1000;
    o.dist = d;
  });
  items.sort((a, b) => b.dist - a.dist);   // yang di tengah digambar paling atas
  const draw = o => `<g class="fl" style="--r:${o.r}deg;transform-origin:${o.cx.toFixed(0)}px ${o.cy.toFixed(0)}px;animation-delay:${o.d.toFixed(2)}s"><use href="#fl-${o.t}" x="${(o.cx - o.s / 2).toFixed(0)}" y="${(o.cy - o.s / 2).toFixed(0)}" width="${o.s.toFixed(0)}" height="${o.s.toFixed(0)}"/></g>`;
  const el = document.createElement('div');
  el.id = 'intro'; el.setAttribute('aria-label', 'Intro Sebuket');
  el.innerHTML = `<div class="i-flowers"><div class="i-floor"></div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${SYMBOLS}${[...base, ...items].map(draw).join('')}</svg></div>
  <div class="i-bud"></div><div class="i-panel"><h1 class="i-name">${INTRO.title}</h1><p class="i-tag">${INTRO.tagline}</p><p class="i-about">${INTRO.about}</p></div>
  <button class="i-skip" type="button">Lewati</button>`;
  return el;
}
function runIntro() {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // hormati reduced motion
    if (sessionStorage.getItem('sebuket_intro')) return;                 // sekali per sesi
    sessionStorage.setItem('sebuket_intro', '1');
  } catch (e) { }
  let el, done = false; const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const finish = () => {   // kondisi akhir: intro dihapus, scroll pulih, di bagian atas
    if (done) return; done = true; timers.forEach(clearTimeout);
    if (el) el.remove();
    document.documentElement.classList.remove('intro-lock'); scrollTo(0, 0);
    setTimeout(() => document.body.classList.remove('site-in'), 1500);
  };
  try {
    el = buildIntro(); document.body.appendChild(el);
    document.documentElement.classList.add('intro-lock');
    const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 1000))]);
    Promise.all([fonts, new Promise(r => at(INTRO.nameAt, r))]).then(() => { if (!done) el.classList.add('name-in'); });
    at(INTRO.swayAt, () => el.classList.add('sway'));
    at(INTRO.dissolveAt, () => { el.classList.add('dissolve'); document.body.classList.add('site-in'); });
    at(INTRO.total, finish);
    $('.i-skip', el).onclick = finish;
  } catch (e) { finish(); }   // bila gagal, website tetap terbuka
}
/* Bila foto produk belum ada / gagal dimuat => pakai ilustrasi cadangan */
document.addEventListener('error', e => {
  const img = e.target; if (!img || img.tagName !== 'IMG') return;
  const src = img.getAttribute('src'), m = src.match(/^(foto\/.+)\.(\w+)$/), base = m ? m[1] : src;
  if (m) { const k = EXT_LIST.indexOf(m[2]); if (k > -1 && k < EXT_LIST.length - 1) { img.src = `${base}.${EXT_LIST[k + 1]}`; return; } }   // coba format lain
  if (img.dataset.fb) { img.src = img.dataset.fb; return; }   // hero, kategori, review => ilustrasi cadangan
  for (const p of PRODUCTS) { const i = p.photos.findIndex(x => x.replace(/\.\w+$/, '') === base); if (i > -1) { img.src = p.art[i]; return; } }
}, true);
function buildMarquee() {   // 2 grup identik => putaran tanpa putus
  const track = $('.mq-track'); if (!track) return;
  const grp = (hid) => `<div class="mq-group"${hid ? ' aria-hidden="true"' : ''}>` + `<span class="mq-item">${esc(MARQUEE_TEXT)}</span><span class="mq-sep" aria-hidden="true">✿</span>`.repeat(12) + '</div>';
  track.innerHTML = grp(false) + grp(true);
}
buildMarquee(); updateBadge(); route(); runIntro();
