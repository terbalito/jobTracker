import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;
const DATA_FILE = './data/offres.json';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Servir le build React
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// ⚡ CORS – autoriser ton front
app.use(cors({
  origin: 'https://job-tracker-ouli.onrender.com'
}));
app.use(bodyParser.json());

// Crée un nouvel utilisateur et renvoie un userId
app.post('/create-user', (req, res) => {
  const userId = uuidv4();
  res.json({ userId });
});

// Récupérer toutes les offres pour un userId
app.get('/offers/:userId', (req, res) => {
  const { userId } = req.params;
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    data = {};
  }
  res.json(data[userId] || []);
});

// Ajouter une offre pour un userId
app.post('/offers/:userId', (req, res) => {
  const { userId } = req.params;
  const newOffer = { ...req.body, id: uuidv4(), statut: 'non postulé', date_ajout: new Date().toISOString().split('T')[0] };

  let data = {};
  try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e) { data = {}; }

  if (!data[userId]) data[userId] = [];
  data[userId].unshift(newOffer);

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(data[userId]);
});

// Mettre à jour une offre
app.patch('/offers/:userId', (req, res) => {
  const { userId } = req.params;
  const { id, updates } = req.body;
  let data = {};
  try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ data = {}; }
  if (!data[userId]) return res.status(404).json({ error: "User not found" });
  const offer = data[userId].find(o => o.id === id);
  if (!offer) return res.status(404).json({ error: "Offer not found" });
  Object.assign(offer, updates);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(data[userId]);
});

// Supprimer une offre
app.delete('/offers/:userId', (req, res) => {
  const { userId } = req.params;
  const { id } = req.body;
  let data = {};
  try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){ data = {}; }
  if (!data[userId]) return res.status(404).json({ error: "User not found" });
  data[userId] = data[userId].filter(o => o.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(data[userId]);
});


// Démarrer le serveur
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
