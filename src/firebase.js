// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyByCwA8Pp1v3lGvZmQBTOPkKzUWUBX15QI",
  authDomain: "ferreteria-app-7d851.firebaseapp.com",
  projectId: "ferreteria-app-7d851",
  storageBucket: "ferreteria-app-7d851.firebasestorage.app",
  messagingSenderId: "973039373852",
  appId: "1:973039373852:web:b0ee784760ce8bcfe499d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportar Auth
export const auth = getAuth(app);
const db = getFirestore(app);

export { db }