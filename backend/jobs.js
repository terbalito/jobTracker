// backend/jobs.js
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Ajouter un job
export async function addJob(job) {
  const docRef = await addDoc(collection(db, "jobs"), job);
  return docRef.id;
}

// Lire tous les jobs pour un user
export async function getJobs(userId) {
  const querySnapshot = await getDocs(collection(db, "jobs"));
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(job => job.userId === userId);
}

// Mettre à jour un job
export async function updateJob(id, updates) {
  const docRef = doc(db, "jobs", id);
  await updateDoc(docRef, updates);
}

// Supprimer un job
export async function deleteJob(id) {
  const docRef = doc(db, "jobs", id);
  await deleteDoc(docRef);
}
