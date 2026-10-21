import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyze } from './analyzer/index.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost' }));
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  const { url } = req.body ?? {};
  if (!url?.trim()) return res.status(400).json({ error: 'URL requerida' });
  try {
    const result = await analyze(url.trim());
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: `Error al analizar: ${err.message}` });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
