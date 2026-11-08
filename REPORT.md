# LAPORAN ANALISIS SINGKAT
## Pengembangan Media Pembelajaran Interaktif Berbasis AR/VR dan Generative AI
### Immersive Microcontroller Lab: Arduino Uno, LED, Resistor, dan Sensor Ultrasonik

**Mata kuliah:** Mikrokontroler dan Antarmuka  
**Program studi:** D-III Teknik Komputer  
**Jenis proyek:** Mini project individual  

## 1. Latar Belakang dan Masalah Pembelajaran

Materi mikrokontroler dan antarmuka memuat konsep yang tidak selalu mudah dipahami melalui penjelasan verbal atau gambar dua dimensi. Mahasiswa perlu mengenali bentuk komponen, memahami fungsi pin, menelusuri hubungan input-output, dan menghubungkan perubahan masukan dengan respons keluaran. Pada praktikum awal, mahasiswa juga dapat mengalami kesulitan membedakan fungsi board mikrokontroler, LED, resistor pembatas arus, serta sensor ultrasonik.

Media **Immersive Microcontroller Lab** dikembangkan untuk membantu mahasiswa mempelajari hubungan tersebut melalui objek 3D, eksplorasi interaktif, simulasi sederhana, dan latihan adaptif. Skenario penerapan dikaitkan dengan pemantauan tempat penampungan air di sekolah melalui nilai gotong royong dan kepedulian terhadap air bersama.

## 2. Tujuan Pembelajaran

Setelah menyelesaikan modul, mahasiswa diharapkan mampu:

1. Mengidentifikasi Arduino Uno, LED, resistor 220 ohm, dan sensor HC-SR04 beserta fungsi dasarnya.
2. Menjelaskan hubungan pin digital, resistor pembatas arus, LED, serta prinsip pengukuran jarak menggunakan gelombang ultrasonik.
3. Menginterpretasikan perubahan kondisi keluaran LED ketika pin digital berubah.
4. Menganalisis perubahan jarak yang dibaca sensor dalam skenario pemantauan ketinggian air.
5. Menjawab soal penerapan dengan umpan balik yang menjelaskan alasan jawaban.

## 3. Justifikasi Pemilihan Media

### 3.1 Augmented Reality (AR)

AR dipilih untuk menghadirkan objek laboratorium digital di atas permukaan nyata melalui kamera perangkat yang mendukung WebXR. Mahasiswa dapat melihat representasi 3D board dan komponen dari berbagai arah, mengamati susunan fisiknya, serta menempatkan model pada bidang yang terdeteksi. Pendekatan ini relevan untuk pengenalan bentuk dan posisi komponen yang biasanya hanya diamati melalui foto atau benda fisik secara bergantian.

### 3.2 Virtual Reality (VR)

VR digunakan untuk memberikan pengalaman eksplorasi laboratorium secara imersif pada perangkat yang mendukung immersive-vr. Mahasiswa dapat mengamati objek dalam ruang 3D dan memahami tata letak komponen sebagai satu sistem. Pada komputer tanpa headset, tampilan 3D dengan kontrol putar dan zoom berfungsi sebagai alternatif eksplorasi.

### 3.3 Generative AI (GenAI)

GenAI digunakan bukan hanya sebagai chatbot, melainkan sebagai pembuat variasi soal dan skenario latihan. Masukan yang diberikan adalah topik, tingkat kesulitan, dan konteks kasus. Sistem meminta model menghasilkan satu soal pilihan ganda baru, empat opsi, satu indeks jawaban benar, serta penjelasan. Dengan demikian, latihan dapat divariasikan sesuai kebutuhan belajar dan konteks yang dipilih mahasiswa.

## 4. Mekanisme Interaksi dan Penggunaan GenAI

### 4.1 Alur penggunaan

1. **Pengenalan komponen (±3 menit):** mahasiswa memilih objek Arduino Uno, LED, resistor, atau HC-SR04 pada scene atau daftar komponen. Panel informasi menampilkan fungsi komponen.
2. **Eksplorasi rangkaian (±4 menit):** mahasiswa memutar dan memperbesar objek 3D, mengamati hubungan board dan komponen.
3. **Uji keluaran LED (±3 menit):** mahasiswa menekan sakelar untuk mengubah kondisi LED OFF/ON. Sistem menampilkan interpretasi logika LOW/HIGH pada pin digital 13.
4. **Simulasi sensor jarak (±3 menit):** mahasiswa menggeser nilai jarak 2-200 cm. Nilai dan deskripsi kondisi sensor berubah secara langsung.
5. **Latihan adaptif (±5 menit):** mahasiswa menentukan topik, kesulitan, dan konteks, kemudian meminta GenAI membuat latihan. Setelah memilih jawaban, sistem memberikan umpan balik dan penjelasan.

Estimasi keseluruhan adalah 18 menit dan berada dalam rentang 15-20 menit yang ditentukan pada tugas.

### 4.2 Titik interaksi aktif

- Memilih komponen untuk membuka informasi fungsi.
- Mengaktifkan atau menonaktifkan LED dan mengamati perubahan visual.
- Mengubah jarak objek dengan slider dan menganalisis respons pembacaan.
- Memilih jawaban latihan yang dihasilkan berdasarkan konfigurasi mahasiswa.
- Memilih mode tampilan AR atau VR jika browser/perangkat mendukung WebXR.

### 4.3 Mekanisme GenAI

Antarmuka mengirimkan topik, tingkat kesulitan, dan konteks ke endpoint backend `/api/generate`. Server memanggil OpenAI Responses API dengan instruksi untuk menghasilkan satu soal baru dalam format JSON terstruktur. Kunci API disimpan pada variabel lingkungan server (`.env`), tidak disimpan dalam kode browser. Backend memvalidasi bahwa respons memiliki pertanyaan, empat opsi, indeks jawaban benar, dan penjelasan sebelum dikirim ke halaman.

Apabila API key belum dipasang atau layanan tidak dapat diakses, prototipe mengaktifkan latihan lokal berbasis template. Mode ini diberi label `LATIHAN LOKAL (TEMPLATE)` agar tidak disalahartikan sebagai hasil GenAI. Untuk memenuhi kriteria integrasi GenAI pada demonstrasi akhir, API key harus dikonfigurasi dan pengujian generate harus berhasil.

## 5. Integrasi Konteks dan Kearifan Lokal

Konteks belajar menggunakan kasus monitoring tempat penampungan air di lingkungan sekolah di Sumatera Utara dengan nilai gotong royong dan kepedulian terhadap sumber daya air bersama. Nilai tersebut memengaruhi alur tugas: mahasiswa tidak hanya membaca angka sensor, tetapi menafsirkan kondisi bak, menentukan kapan perlu pemeriksaan atau pengisian, dan menyusun tindak lanjut yang dapat dilakukan warga sekolah bersama. GenAI juga diminta menghasilkan variasi skenario dengan konteks ini. Dengan demikian, konteks lokal menjadi pemicu keputusan dan motivasi belajar, bukan hanya teks dekoratif. Pengembangan berikutnya sebaiknya melibatkan mitra sekolah/komunitas agar skenario dan ambang tindakan sesuai kebutuhan lapangan.

## 6. Aspek Pedagogis dan Desain Interaksi

Konten diurutkan dari pengenalan objek menuju praktik sederhana dan analisis. Mahasiswa tidak hanya melihat visualisasi pasif, tetapi melakukan tindakan dan mengamati respons sistem. Umpan balik diberikan segera setelah perubahan kondisi LED, perubahan jarak, atau jawaban kuis. Latihan dengan tingkat kesulitan berbeda mendukung pembelajaran mandiri. Dosen tetap berperan sebagai fasilitator untuk memeriksa pemahaman konsep, memberi penguatan, dan mengoreksi miskonsepsi.

Prinsip etis yang digunakan adalah menjaga transparansi penggunaan AI, tidak menampilkan data pribadi mahasiswa pada prompt, dan memberi kesempatan kepada mahasiswa untuk memeriksa penjelasan AI terhadap materi ajar/datasheet. GenAI diposisikan sebagai pembantu latihan, bukan sumber kebenaran tunggal.

## 7. Rancangan Teknis

- **Frontend:** HTML, CSS, JavaScript ES modules.
- **Visualisasi 3D:** Three.js.
- **AR/VR:** WebXR melalui `ARButton` dan `VRButton` dari addon Three.js.
- **Backend:** Node.js dan Express.
- **GenAI:** OpenAI Responses API melalui backend.
- **Jalankan lokal:** `npm install`, salin `.env.example` menjadi `.env`, isi API key, lalu `npm start`; buka `http://localhost:4173`.
- **Distribusi:** frontend dapat di-host pada HTTPS. Untuk GenAI sungguhan, endpoint backend harus tetap di-host pada server yang terlindungi; jangan meletakkan API key di GitHub Pages atau JavaScript browser.

## 8. Evaluasi dan Validasi yang Direncanakan

Evaluasi awal dapat dilakukan dengan meminta beberapa mahasiswa mencoba modul dan mengamati apakah mereka mampu: (1) menyebutkan fungsi komponen, (2) menjelaskan fungsi resistor pada LED, (3) menerangkan prinsip pengukuran jarak HC-SR04, dan (4) menyelesaikan latihan tanpa instruksi berulang. Catat waktu penyelesaian, jumlah kesalahan, keberhasilan interaksi, dan komentar pengguna. Konten teknis harus diverifikasi dengan datasheet komponen dan modul ajar yang digunakan dosen.

## 9. Keterbatasan Prototipe

Model 3D dibuat dari geometri dasar dan bersifat ilustratif, bukan model CAD presisi. Aktivitas LED dan sensor adalah simulasi visual, bukan simulasi rangkaian listrik atau data sensor sungguhan. AR/VR bergantung pada kompatibilitas browser, perangkat, izin kamera/sensor, dan origin HTTPS. Kualitas integrasi GenAI bergantung pada ketersediaan API, model yang dapat diakses, serta validasi keluaran. Karena itu, aplikasi ini merupakan prototipe pembelajaran dan perlu diuji serta disempurnakan sebelum digunakan sebagai praktikum produksi.

## 10. Kesimpulan

Immersive Microcontroller Lab menawarkan alur belajar mandiri yang menggabungkan eksplorasi 3D, dukungan AR/VR berbasis WebXR, tiga simulasi interaktif, konteks masalah lingkungan sekolah, dan latihan adaptif yang dibuat melalui GenAI. Desain ini diarahkan untuk membantu mahasiswa memahami komponen serta hubungan input-output mikrokontroler secara lebih kontekstual. Keberhasilan demonstrasi akhir perlu dibuktikan dengan uji perangkat AR/VR, konfigurasi API GenAI, dan evaluasi pengguna.

## Referensi Teknis

1. Three.js Documentation. *ARButton*. https://threejs.org/docs/pages/ARButton.html
2. Three.js Documentation. *VRButton*. https://threejs.org/docs/pages/VRButton.html
3. Three.js Manual. *VR / WebXR basics*. https://threejs.org/manual/pages/webxr-basics.html
4. OpenAI Platform. *Assistants migration guide* (panduan migrasi ke Responses API). https://platform.openai.com/docs/assistants/migration

---

**Catatan sebelum pengumpulan:** lengkapi identitas peserta, lakukan uji aplikasi pada perangkat yang akan didemonstrasikan, aktifkan GenAI dengan API key milik sendiri, dan tambahkan tangkapan layar hasil uji AR/VR serta latihan GenAI yang benar-benar berhasil dijalankan.
