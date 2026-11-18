// ============ Pengaturan (silakan ubah) ============
const NAMA = "Rehan Hermawan";           // ganti dengan namamu
const TANGGAL_LAHIR = "2009-11-21"; // ganti dengan tanggal lahirmu, format TAHUN-BULAN-TANGGAL
const VOLUME_LAGU = 0.7;         // 0.0 sampai 1.0

// ============ Elemen ============
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const lagu = $("#lagu");
const gerbang = $("#gerbang");
const btnMusik = $("#btnMusik");
const root = document.documentElement;

$("#namaTujuan").textContent = NAMA;
lagu.volume = VOLUME_LAGU;
document.body.classList.add("terkunci");

// ============ Warna yang "mekar" ============
// Halaman mulai abu-abu (0). Skor naik saat scroll, Aamiin, dan harapan.
let skorAksi = 0; // 0..0.6
let nilaiMekar = 0;
const meterIsi = $("#meterIsi");

function perbaruiMekar() {
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const scroll = maxScroll > 0 ? scrollY / maxScroll : 0;
  const mekar = Math.min(1, scroll * 0.4 + skorAksi);
  nilaiMekar = mekar;
  root.style.setProperty("--mekar", mekar.toFixed(3));
  meterIsi.style.width = Math.round(mekar * 100) + "%";
}
function tambahMekar(n) {
  skorAksi = Math.min(0.6, skorAksi + n);
  perbaruiMekar();
}

// ============ Musik ============
function mainkan() {
  return lagu.play().then(() => setTombolMusik(true)).catch(() => setTombolMusik(false));
}
function setTombolMusik(sedangMain) {
  btnMusik.setAttribute("aria-pressed", String(sedangMain));
  btnMusik.setAttribute("aria-label", sedangMain ? "Jeda musik" : "Putar musik");
}
btnMusik.addEventListener("click", () => {
  if (lagu.paused) mainkan(); else { lagu.pause(); setTombolMusik(false); }
});
setTombolMusik(false);

// Coba putar otomatis. Banyak browser memblokir ini, maka ada tombol gerbang.
lagu.play().then(() => setTombolMusik(true)).catch(() => {});

$("#btnBuka").addEventListener("click", () => {
  mainkan();
  gerbang.classList.add("buka");
  document.body.classList.remove("terkunci");
  setTimeout(() => gerbang.remove(), 1700);
});

// ============ Efek klik: riak pada tombol ============
document.addEventListener("pointerdown", (e) => {
  const tbl = e.target.closest(".tombol, .aamiin");
  if (!tbl) return;
  const r = tbl.getBoundingClientRect();
  const ukuran = Math.max(r.width, r.height) * 2;
  const riak = document.createElement("span");
  riak.className = "riak";
  riak.style.cssText = `width:${ukuran}px;height:${ukuran}px;left:${e.clientX - r.left - ukuran / 2}px;top:${e.clientY - r.top - ukuran / 2}px`;
  tbl.appendChild(riak);
  riak.addEventListener("animationend", () => riak.remove());
});

// ============ Efek klik: percikan cahaya ============
function percikan(x, y, jumlah = 10) {
  for (let i = 0; i < jumlah; i++) {
    const p = document.createElement("span");
    p.className = "percik";
    const sudut = (Math.PI * 2 * i) / jumlah + Math.random() * 0.5;
    const jarak = 40 + Math.random() * 50;
    p.style.left = x - 4 + "px";
    p.style.top = y - 4 + "px";
    p.style.setProperty("--dx", Math.cos(sudut) * jarak + "px");
    p.style.setProperty("--dy", Math.sin(sudut) * jarak + "px");
    document.body.appendChild(p);
    p.addEventListener("animationend", () => p.remove());
  }
}

// ============ Judul: huruf menyala saat disentuh ============
["judulHuruf", "judulHuruf2"].forEach((id) => {
  const el = document.getElementById(id);
  const teks = el.textContent;
  el.textContent = "";
  [...teks].forEach((h) => {
    const s = document.createElement("span");
    s.className = "huruf";
    s.textContent = h;
    s.addEventListener("click", (e) => {
      s.classList.toggle("nyala");
      percikan(e.clientX, e.clientY, 6);
      tambahMekar(0.01);
    });
    el.appendChild(s);
  });
});

// ============ Doa: tombol Aamiin ============
const KUNCI_AAMIIN = "aamiin-doa";
let dataAamiin = {};
try { dataAamiin = JSON.parse(localStorage.getItem(KUNCI_AAMIIN)) || {}; } catch {}

$$(".doa").forEach((kartu, i) => {
  const btn = $("[data-aamiin]", kartu);
  const jumlah = $("[data-jumlah]", kartu);
  jumlah.textContent = dataAamiin[i] || 0;
  if (dataAamiin[i]) kartu.classList.add("diamini");

  btn.addEventListener("click", (e) => {
    dataAamiin[i] = (dataAamiin[i] || 0) + 1;
    jumlah.textContent = dataAamiin[i];
    jumlah.classList.remove("naik");
    void jumlah.offsetWidth; // mulai ulang animasi
    jumlah.classList.add("naik");
    kartu.classList.add("diamini");
    percikan(e.clientX, e.clientY);
    tambahMekar(0.08);
    try { localStorage.setItem(KUNCI_AAMIIN, JSON.stringify(dataAamiin)); } catch {}
  });
});

// ============ Harapan ============
const KUNCI_HARAPAN = "daftar-harapan";
const form = $("#formHarapan");
const input = $("#inputHarapan");
const daftar = $("#daftarHarapan");
const kosong = $("#kosongHarapan");
let harapan = [];
try { harapan = JSON.parse(localStorage.getItem(KUNCI_HARAPAN)) || []; } catch {}

function simpanHarapan() {
  try { localStorage.setItem(KUNCI_HARAPAN, JSON.stringify(harapan)); } catch {}
  kosong.hidden = harapan.length > 0;
}

function buatItem(teks) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = teks;
  const x = document.createElement("button");
  x.type = "button";
  x.className = "hapus";
  x.setAttribute("aria-label", "Hapus harapan: " + teks);
  x.textContent = "×";
  x.addEventListener("click", () => {
    li.classList.add("hilang");
    setTimeout(() => {
      harapan = harapan.filter((h) => h !== teks);
      li.remove();
      simpanHarapan();
    }, 300);
  });
  li.append(span, x);
  return li;
}

harapan.forEach((h) => daftar.appendChild(buatItem(h)));
simpanHarapan();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const teks = input.value.trim();
  if (!teks) return;
  harapan.push(teks);
  daftar.appendChild(buatItem(teks));
  simpanHarapan();
  input.value = "";
  const r = form.querySelector("button").getBoundingClientRect();
  percikan(r.left + r.width / 2, r.top + r.height / 2, 12);
  tambahMekar(0.06);
});

// ============ Linimasa ============
const linimasa = $("#linimasaList");
$$(".momen", linimasa).forEach((momen) => {
  const btn = $(".momen__btn", momen);
  btn.addEventListener("click", (e) => {
    const buka = !momen.classList.contains("aktif");
    momen.classList.toggle("aktif", buka);
    btn.setAttribute("aria-expanded", String(buka));
    if (buka) { percikan(e.clientX, e.clientY, 7); tambahMekar(0.03); }
  });
});

// garis linimasa terisi mengikuti scroll
function perbaruiGarisLinimasa() {
  const r = linimasa.getBoundingClientRect();
  const titikBaca = innerHeight * 0.6;
  const isi = Math.max(0, Math.min(r.height, titikBaca - r.top));
  linimasa.style.setProperty("--progres", isi + "px");
}

// ============ Scroll ============
let menunggu = false;
addEventListener("scroll", () => {
  if (menunggu) return;
  menunggu = true;
  requestAnimationFrame(() => {
    perbaruiMekar();
    perbaruiGarisLinimasa();
    menunggu = false;
  });
}, { passive: true });
addEventListener("resize", () => { perbaruiMekar(); perbaruiGarisLinimasa(); });

perbaruiMekar();
perbaruiGarisLinimasa();


// ============ Konfeti ============
function konfeti(jumlah = 70) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const hue = [38, 200, 340, 150, 270, 12];
  for (let i = 0; i < jumlah; i++) {
    const k = document.createElement("span");
    k.className = "konfeti";
    k.style.left = Math.random() * 100 + "vw";
    k.style.background = `hsl(${hue[i % hue.length]} 85% 58%)`;
    k.style.setProperty("--geser", (Math.random() * 240 - 120) + "px");
    k.style.setProperty("--putar", (Math.random() * 900 - 450) + "deg");
    k.style.setProperty("--durasi", (2 + Math.random() * 1.8) + "s");
    k.style.animationDelay = Math.random() * 0.5 + "s";
    document.body.appendChild(k);
    k.addEventListener("animationend", () => k.remove());
  }
}

// ============ Ulang tahun ============
(function ulangTahun() {
  const lahir = new Date(TANGGAL_LAHIR + "T00:00:00");
  const sekarang = new Date();
  const hariIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());
  const MS = 86400000;

  let umur = hariIni.getFullYear() - lahir.getFullYear();
  let berikut = new Date(hariIni.getFullYear(), lahir.getMonth(), lahir.getDate());
  const ultahHariIni = berikut.getTime() === hariIni.getTime();
  if (berikut < hariIni) { umur += 0; berikut = new Date(hariIni.getFullYear() + 1, lahir.getMonth(), lahir.getDate()); }
  else if (!ultahHariIni) { umur -= 1; }

  const totalHari = Math.floor((hariIni - lahir) / MS);
  const sisaHari = Math.round((berikut - hariIni) / MS);

  // angka naik pelan-pelan
  function hitungNaik(el, target) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = target.toLocaleString("id-ID"); return; }
    const mulai = performance.now(), durasi = 1400;
    (function langkah(t) {
      const p = Math.min(1, (t - mulai) / durasi);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("id-ID");
      if (p < 1) requestAnimationFrame(langkah);
    })(mulai);
  }

  let sudahTampil = false;
  const target = $("#ultah");
  const io = new IntersectionObserver((entri) => {
    if (!entri[0].isIntersecting || sudahTampil) return;
    sudahTampil = true;
    hitungNaik($("#umur"), umur);
    hitungNaik($("#hari"), totalHari);
    if (ultahHariIni) {
      $("#hitung").textContent = "Hari ini";
      $("#hitungLabel").textContent = "adalah ulang tahunku";
      $("#ultahKet").textContent = "Hari ini milikku. Selamat ulang tahun!";
      konfeti(90);
    } else {
      hitungNaik($("#hitung"), sisaHari);
    }
  }, { threshold: 0.35 });
  io.observe(target);

  // tiup lilin
  const kue = $("#kue");
  const btnLilin = $("#btnLilin");
  const pesan = $("#pesanLilin");
  btnLilin.addEventListener("click", (e) => {
    const padam = kue.classList.toggle("padam");
    if (padam) {
      btnLilin.textContent = "Nyalakan lagi";
      pesan.textContent = "Semoga permintaanku didengar dan dikabulkan.";
      konfeti(80);
      percikan(e.clientX, e.clientY, 14);
      tambahMekar(0.1);
    } else {
      btnLilin.textContent = "Tiup lilin";
      pesan.textContent = "Buat satu permintaan dulu, lalu tiup.";
    }
  });
})();

// ============ Latar teknologi: jaringan titik ============
(function latar() {
  const canvas = $("#latarTeknologi");
  const ctx = canvas.getContext("2d");
  const kurangiGerak = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w, h, dpr, titik = [];
  const mouse = { x: -999, y: -999 };

  function ukur() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    const jumlah = Math.min(90, Math.floor((innerWidth * innerHeight) / 16000));
    titik = Array.from({ length: jumlah }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35 * dpr, vy: (Math.random() - 0.5) * 0.35 * dpr,
      r: (1 + Math.random() * 1.6) * dpr,
    }));
  }

  function gambar() {
    ctx.clearRect(0, 0, w, h);
    const sat = nilaiMekar * 85;
    const jarak = 150 * dpr;
    for (const p of titik) {
      if (!kurangiGerak) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
    }
    for (let i = 0; i < titik.length; i++) {
      const a = titik[i];
      for (let j = i + 1; j < titik.length; j++) {
        const b = titik[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < jarak) {
          ctx.strokeStyle = `hsla(38, ${sat}%, 45%, ${(1 - d / jarak) * 0.28})`;
          ctx.lineWidth = dpr;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // garis ke kursor
      const dm = Math.hypot(a.x - mouse.x * dpr, a.y - mouse.y * dpr);
      if (dm < jarak * 1.3) {
        ctx.strokeStyle = `hsla(38, ${Math.max(sat, 40)}%, 50%, ${(1 - dm / (jarak * 1.3)) * 0.55})`;
        ctx.lineWidth = dpr;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x * dpr, mouse.y * dpr); ctx.stroke();
      }
      ctx.fillStyle = `hsla(38, ${sat}%, 40%, .55)`;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    if (!kurangiGerak) requestAnimationFrame(gambar);
  }

  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener("resize", () => { ukur(); if (kurangiGerak) gambar(); });
  ukur();
  gambar();
})();
