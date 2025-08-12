// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "geostoque",
  appId: "1:828128285536:web:f20050b39361475deb4405",
  storageBucket: "geostoque.firebasestorage.app",
  apiKey: "AIzaSyAA45A64_DmOGhpeu9xODMwRXiEPSY-H8w",
  authDomain: "geostoque.firebaseapp.com",
  messagingSenderId: "828128285536",
};

// Inicializa o Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
