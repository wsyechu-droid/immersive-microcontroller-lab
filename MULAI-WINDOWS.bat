@echo off
setlocal
cd /d "%~dp0"
echo ================================================
echo  IMMERSIVE MICROCONTROLLER LAB
echo ================================================
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum ditemukan. Instal Node.js 20 atau lebih baru dari https://nodejs.org/
  pause
  exit /b 1
)
if not exist node_modules (
  echo Menginstal dependensi aplikasi...
  call npm install
  if errorlevel 1 (
    echo Instalasi gagal. Periksa koneksi internet dan versi Node.js.
    pause
    exit /b 1
  )
)
if not exist .env (
  copy .env.example .env >nul
  echo File .env dibuat. Isi OPENAI_API_KEY untuk mengaktifkan GenAI sungguhan.
)
echo Membuka aplikasi pada browser...
start "" http://localhost:4173
echo Server berjalan. Tutup jendela ini untuk menghentikan aplikasi.
call npm start
pause
