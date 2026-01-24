// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCctInHQCrbOjJM_KRzJAOVcnNsSF-d3sc",
  authDomain: "jobtracker-1e97f.firebaseapp.com",
  projectId: "jobtracker-1e97f",
  storageBucket: "jobtracker-1e97f.firebasestorage.app",
  messagingSenderId: "1052589010482",
  appId: "1:1052589010482:web:99a79df3c396fca97b562b",
  measurementId: "G-D8KG274ZSL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);
