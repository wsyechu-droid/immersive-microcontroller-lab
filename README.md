# Immersive Microcontroller Lab

Prototipe media pembelajaran untuk mata kuliah **Mikrokontroler dan Antarmuka**. Topik: Arduino Uno, LED, resistor 220 ohm, dan sensor ultrasonik HC-SR04.

## Fitur yang tersedia

- Laboratorium 3D interaktif menggunakan Three.js: putar, zoom, dan pilih komponen.
- Mode AR berbasis WebXR hit-test: tempatkan model laboratorium pada permukaan nyata di perangkat yang mendukung.
- Mode VR berbasis WebXR: eksplorasi laboratorium melalui headset/browser yang kompatibel.
- Tiga interaksi praktik: eksplorasi komponen, kendali LED, dan simulasi pembacaan jarak.
- Panduan belajar mandiri 4 tahap dengan estimasi total 15-20 menit.
- AI Practice Studio yang menghasilkan variasi soal pilihan ganda melalui OpenAI Responses API pada backend.
- Kearifan/konteks lokal: skenario monitoring tempat penampungan air di lingkungan sekolah Sumatera Utara.
- Jika API belum dikonfigurasi, aplikasi memakai latihan lokal berbasis template dan memberi label bahwa itu bukan hasil GenAI.

## Menjalankan aplikasi di Windows

1. Instal **Node.js 20 atau lebih baru** dari https://nodejs.org/.
2. Ekstrak folder proyek.
3. Buka Command Prompt atau PowerShell pada folder `immersive_microcontroller_lab`.
4. Jalankan:

   ```bash
   npm install
   ```

5. Jalankan server:

   ```bash
   npm start
   ```

6. Buka browser ke `http://localhost:4173`.

Jangan membuka `index.html` dengan klik ganda (`file://`). Jalankan melalui server agar modul JavaScript dapat dimuat.

## Mengaktifkan GenAI sungguhan

1. Dapatkan API key dari akun OpenAI API yang memiliki akses dan billing aktif.
2. Salin `.env.example` menjadi file bernama `.env` pada folder proyek.
3. Isi `OPENAI_API_KEY` dengan API key milik sendiri. Jangan masukkan key ke `app.js` atau `index.html` dan jangan unggah `.env` ke GitHub.
4. Bila model bawaan tidak tersedia pada akun, ubah `OPENAI_MODEL` ke model teks yang tersedia pada akun API.
5. Restart server (`Ctrl+C`, lalu `npm start`).
6. Buka menu **AI Practice Studio**, pilih topik, kesulitan, dan konteks, lalu tekan **Generate variasi latihan**.

Backend menyimpan API key di server dan mengirim permintaan ke Responses API. Tanpa API key, latihan lokal tetap tersedia untuk demonstrasi UI, tetapi jangan dilaporkan sebagai GenAI aktif.

## Menguji AR dan VR

- WebXR umumnya mensyaratkan origin aman (HTTPS; `localhost` untuk uji lokal) serta browser dan perangkat yang mendukung fitur yang diminta.
- Mode AR membutuhkan dukungan `immersive-ar` dan hit-test. Perangkat Android yang kompatibel lebih sesuai untuk uji AR web. Dukungan pada iPhone/browser tertentu tidak merata.
- Mode VR membutuhkan dukungan `immersive-vr` dan perangkat/headset yang kompatibel.
- Untuk uji di smartphone lain melalui jaringan lokal atau internet, host aplikasi pada layanan HTTPS. Server contoh ini ditujukan untuk uji lokal; untuk hosting publik, siapkan server Node.js terpisah agar API key tetap berada di server.
- Jika AR/VR tidak didukung, gunakan 3D desktop sebagai mode fallback. Jangan menyatakan bahwa perangkat yang belum diuji berhasil menjalankan AR/VR.

## Struktur berkas

- `index.html` - struktur halaman dan komponen antarmuka.
- `styles.css` - desain responsif.
- `app.js` - scene Three.js, objek 3D, kontrol AR/VR, interaksi, dan kuis.
- `server.js` - backend Express dan integrasi Responses API.
- `.env.example` - contoh konfigurasi rahasia API.
- `REPORT.md` - laporan analisis singkat.

## Catatan akademik dan validasi

Model 3D pada prototipe ini adalah model edukatif berbasis geometri Three.js, bukan model CAD resmi produk Arduino atau HC-SR04. Simulasi LED dan jarak merupakan simulasi visual, bukan simulasi rangkaian listrik atau pembacaan sensor fisik. Validasi akhir perlu dilakukan dengan membandingkan pinout dan prinsip kerja dengan datasheet/lembar data resmi serta uji pengguna.

## Cara paling mudah di Windows

Setelah Node.js terpasang, klik dua kali `MULAI-WINDOWS.bat`. Skrip akan memasang dependensi jika diperlukan, membuat `.env` bila belum ada, membuka browser, lalu menjalankan server. Untuk GenAI sungguhan, edit `.env` terlebih dahulu dan isi API key; setelah itu jalankan ulang skrip.
