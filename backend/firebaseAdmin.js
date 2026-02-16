// firebaseAdmin.js
import admin from "firebase-admin";
import "dotenv/config";

// Vérifie les variables d'environnement
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("❌ Variables d'environnement Firebase Admin manquantes");
}

// Initialisation sécurisée, UNE SEULE FOIS
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

// Exporte uniquement ce qui est nécessaire
export const authAdmin = admin.auth();
export const db = admin.firestore();
