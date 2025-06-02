// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore"; // <--- NUEVA IMPORTACIÓN

// Tu configuración de Firebase (la que me pasaste)
const firebaseConfig = {
  apiKey: "AIzaSyBP-mrr0XGG5wMaB8ubXCUF3Ze7uQ7AJTk",
  authDomain: "seve-photography-web.firebaseapp.com",
  projectId: "seve-photography-web",
  storageBucket: "seve-photography-web.firebasestorage.app",
  messagingSenderId: "381775393642",
  appId: "1:381775393642:web:c0a2f20559e0cf919ceb13",
  measurementId: "G-ZTQHFR3T8S"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Storage y exportarlo
export const storage = getStorage(app);

// Inicializar Firestore Database y exportarlo  // <--- NUEVO
export const db = getFirestore(app);           // <--- NUEVO

export default app;
