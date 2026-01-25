import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { addJob, getJobs, updateJob, deleteJob } from "./jobs.js";
import { firebaseAuth } from "./firebaseAuthMiddleware.js";
import "dotenv/config";


const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:54344', // ou ton port Vite
  'https://jobtracker-q655.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true); // pour Postman ou fetch sans origin
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'CORS policy: this origin is not allowed';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(bodyParser.json());

// --- JOBS ---
app.get("/offers", firebaseAuth, async (req, res) => {
  const jobs = await getJobs(req.user.uid);
  res.json(jobs);
});

app.post("/offers", firebaseAuth, async (req, res) => {
  const job = {
    ...req.body,
    userId: req.user.uid,
    statut: "non postulé",
    date_ajout: new Date().toISOString().split("T")[0],
  };

  await addJob(job);
  res.json(await getJobs(req.user.uid));
});

app.patch("/offers/:id", firebaseAuth, async (req, res) => {
  await updateJob(req.params.id, req.body);
  res.json(await getJobs(req.user.uid));
});

app.delete("/offers/:id", firebaseAuth, async (req, res) => {
  await deleteJob(req.params.id);
  res.json(await getJobs(req.user.uid));
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
