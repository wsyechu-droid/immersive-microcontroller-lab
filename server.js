import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 4173);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json({ limit: '30kb' }));
app.use(express.static(__dirname));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', genaiConfigured: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_MODEL || 'gpt-4.1-mini' });
});

app.post('/api/generate', async (req, res) => {
  const { topic, difficulty, context, subject } = req.body ?? {};
  if (![topic, difficulty, context].every(v => typeof v === 'string' && v.trim().length > 0)) {
    return res.status(400).json({ error: 'topic, difficulty, dan context wajib diisi.' });
  }
  if (topic.length > 120 || difficulty.length > 40 || context.length > 180) {
    return res.status(400).json({ error: 'Input terlalu panjang.' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'GenAI belum dikonfigurasi. Tambahkan OPENAI_API_KEY pada file .env.' });
  }

  const instructions = `Anda adalah perancang asesmen untuk mata kuliah ${subject || 'Mikrokontroler dan Antarmuka'} tingkat diploma. Buat SATU variasi soal pilihan ganda baru dalam Bahasa Indonesia, akurat secara teknis, kontekstual, dan sesuai level kesulitan. Soal harus menguji penalaran/penerapan, bukan sekadar definisi. Hindari mengulang pertanyaan yang sama. Konteks lokal dapat digunakan secara wajar. Keluarkan JSON valid saja tanpa markdown dengan bentuk: {"question":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"...","difficulty":"...","topic":"...","scenario":"..."}. correctIndex adalah indeks 0 sampai 3. Tepat empat opsi dan hanya satu jawaban benar. Jangan membuat fakta teknis yang meragukan.`;
  const input = `Topik: ${topic}\nKesulitan: ${difficulty}\nKonteks penerapan: ${context}\nBuat variasi skenario latihan yang berbeda dari contoh latihan umum.`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', instructions, input, max_output_tokens: 700 })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload?.error?.message || `OpenAI API mengembalikan status ${response.status}`;
      return res.status(502).json({ error: message });
    }
    const text = (payload.output || []).flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text).join('\n').trim();
    const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonText);
    if (typeof parsed.question !== 'string' || !Array.isArray(parsed.options) || parsed.options.length !== 4 || !Number.isInteger(parsed.correctIndex) || parsed.correctIndex < 0 || parsed.correctIndex > 3 || typeof parsed.explanation !== 'string') {
      throw new Error('Struktur jawaban AI tidak sesuai format latihan.');
    }
    res.json(parsed);
  } catch (error) {
    console.error('GenAI generation error:', error);
    res.status(500).json({ error: 'Gagal menghasilkan latihan. Periksa koneksi, model, atau format respons API.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Immersive Microcontroller Lab berjalan di http://localhost:${PORT}`);
});
