import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = './data/offres.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------
// CORS
// ------------------
const allowedOrigins = [
  'https://job-tracker-ouli.onrender.com', 
  'http://localhost:53485',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));

app.use(bodyParser.json());

// ------------------
// API
// ------------------
app.post('/create-user', (req, res) => {
  const userId = uuidv4();
  res.json({ userId });
});

app.get('/offers/:userId', (req, res) => {
  const { userId } = req.params;
  let data = {};
  try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ data = {}; }
  res.json(data[userId] || []);
});

app.post('/offers/:userId', (req, res) => {
  const { userId } = req.params;
  const newOffer = { ...req.body, id: uuidv4(), statut: 'non postulé', date_ajout: new Date().toISOString().split('T')[0] };
  let data = {};
  try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ data = {}; }
  if (!data[userId]) data[userId] = [];
  data[userId].unshift(newOffer);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(data[userId]);
});

app.patch('/offers/:userId', (req, res) => {
  const { userId } = req.params;
  const { id, updates } = req.body;
  let data = {};
  try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ data = {}; }
  if (!data[userId]) return res.status(404).json({ error: 'User not found' });
  const offer = data[userId].find(o => o.id === id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  Object.assign(offer, updates);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(data[userId]);
});

app.delete('/offers/:userId/:offerId', (req, res) => {
  const { userId, offerId } = req.params;
  let data = {};
  try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ data = {}; }
  if (!data[userId]) return res.status(404).json({ error: 'User not found' });
  data[userId] = data[userId].filter(o => o.id !== offerId);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(data[userId]);
});

// ------------------
// SERVIR HTML à la racine
// ------------------
app.use(express.static(__dirname));

// Route explicite pour index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ------------------
// START SERVER
// ------------------
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
