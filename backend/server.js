import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "dotenv/config";

import { addJob, getJobs, updateJob, deleteJob, getAllUsers, getUrgentOffersByUser } from "./jobs.js"; 
import { firebaseAuth } from "./firebaseAuthMiddleware.js";
import { db, authAdmin } from "./firebaseAdmin.js"; // 🔹 Import propre

import cron from "node-cron";

// Pas besoin de réinitialiser Firebase ici !
// Tout est déjà géré dans firebaseAdmin.js

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// --- JOBS CRUD ---
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

// ===============================
// 🔹 CRON POUR NOTIFS
// ===============================
cron.schedule("0 */4 * * *", async () => {
  console.log("📬 Vérification offres urgentes...");
  const users = await getAllUsers();
  for (const user of users) {
    const urgentOffers = await getUrgentOffersByUser(user.id);
    if (urgentOffers.length && user.fcmToken) {
      await authAdmin.messaging().send({
        token: user.fcmToken,
        notification: {
          title: "⏰ Offres urgentes",
          body: `Vous avez ${urgentOffers.length} offre(s) avec délai proche !`,
        },
      });
      console.log(`✅ Notification envoyée à ${user.email}`);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
