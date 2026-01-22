import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ------------------
// CONSTANTES
// ------------------
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dossiers de stockage
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const DATA_FILE = path.join(dataDir, 'offres.json');
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{}', 'utf8');

const USERS_FILE = path.join(dataDir, 'users.json');
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{}');

// Racine du projet
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ------------------
// CORS
// ------------------
const allowedOrigins = [
  'https://job-tracker-ouli.onrender.com', 
  'http://localhost:3000',
  'http://localhost:53485',
  'http://localhost:56247'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman ou fichiers locaux
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
// ------------------
// Body Parser
// ------------------
app.use(bodyParser.json());

// ------------------
// MIDDLEWARE AUTH
// ------------------
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Non connecté' });

  const token = authHeader.split(' ')[1];
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.userId = user.userId; // Important : utiliser userId partout
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

// ------------------
// ROUTES AUTH
// ------------------
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ error: 'Champs manquants' });

  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

  if (users[username]) return res.status(409).json({ error: 'Utilisateur existe déjà' });

  const hash = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  users[username] = { userId, password: hash };
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  const user = users[username];

  if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });

  const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token });
});

// ------------------
// ROUTES OFFERS
// ------------------
app.get('/offers', authMiddleware, (req, res) => {
  const userId = req.userId;
  let data = {};
  try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ data = {}; }
  res.json(data[userId] || []);
});

app.post('/offers', authMiddleware, (req, res) => {
  const userId = req.userId;
  const newOffer = { ...req.body, id: uuidv4(), statut: 'non postulé', date_ajout: new Date().toISOString().split('T')[0] };
  let data = {};
  try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ data = {}; }
  if (!data[userId]) data[userId] = [];
  data[userId].unshift(newOffer);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(data[userId]);
});

app.patch('/offers', authMiddleware, (req, res) => {
  const userId = req.userId;
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

app.delete('/offers/:offerId', authMiddleware, (req, res) => {
  const userId = req.userId;
  const { offerId } = req.params;
  let data = {};
  try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ data = {}; }
  if (!data[userId]) return res.status(404).json({ error: 'User not found' });
  data[userId] = data[userId].filter(o => o.id !== offerId);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(data[userId]);
});

// ------------------
// AUTRES ROUTES
// ------------------
app.post('/create-user', (req, res) => {
  const userId = uuidv4();
  res.json({ userId });
});

// ------------------
// SERVIR HTML
// ------------------
app.use(express.static(PROJECT_ROOT));
app.get('/', (req, res) => {
  res.sendFile(path.join(PROJECT_ROOT, 'index.html'));
});

// ------------------
// START SERVER
// ------------------
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
