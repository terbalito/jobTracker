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
