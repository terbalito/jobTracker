// backend/jobs.js
import { db } from "./firebaseAdmin.js"; // Firebase Admin

// Ajouter un job
export async function addJob(job) {
  const docRef = await db.collection("jobs").add(job);
  return docRef.id;
}

// Lire tous les jobs pour un user
export async function getJobs(userId) {
  const snapshot = await db.collection("jobs").get();
  const jobs = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(job => job.userId === userId);
  return jobs;
}

// Mettre à jour un job
export async function updateJob(id, updates) {
  const docRef = db.collection("jobs").doc(id);
  await docRef.update(updates);
}

// Supprimer un job
export async function deleteJob(id) {
  const docRef = db.collection("jobs").doc(id);
  await docRef.delete();
}

// 🔹 NOUVEAU : récupérer tous les utilisateurs avec leur token FCM et email
export async function getAllUsers() {
  const snapshot = await db.collection("users").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 🔹 NOUVEAU : récupérer les offres urgentes (≤2 jours) pour un utilisateur
export async function getUrgentOffersByUser(userId) {
  const snapshot = await db.collection("jobs").get();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(job => {
      if (job.userId !== userId) return false;
      const deadline = new Date(job.date_limite);
      deadline.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 2 && job.statut !== "postulé";
    });
}
