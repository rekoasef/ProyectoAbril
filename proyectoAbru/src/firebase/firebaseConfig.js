// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// Si en el futuro necesitas Firestore Database:
// import { getFirestore } from "firebase/firestore";
// Si en el futuro necesitas Firebase Authentication (el sistema completo de Firebase):
// import { getAuth } from "firebase/auth";

// Tu configuración de Firebase (la que me pasaste)
const firebaseConfig = {
  apiKey: "AIzaSyBP-mrr0XGG5wMaB8ubXCUF3Ze7uQ7AJTk",
  authDomain: "seve-photography-web.firebaseapp.com",
  projectId: "seve-photography-web",
  storageBucket: "seve-photography-web.firebasestorage.app", // Correcto
  messagingSenderId: "381775393642",
  appId: "1:381775393642:web:c0a2f20559e0cf919ceb13",
  measurementId: "G-ZTQHFR3T8S" // Opcional para Storage, pero está bien incluirlo
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Storage y exportarlo para usarlo en tu aplicación
export const storage = getStorage(app);

// Ejemplo para Firestore (si lo usas después)
// export const db = getFirestore(app);

// Ejemplo para Firebase Auth (si lo usas después)
// export const auth = getAuth(app);

// Exportar la instancia de la app de Firebase por si se necesita en algún otro lugar
export default app;
