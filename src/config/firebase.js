// src/config/firebase.js

import {
  initializeApp,
  getApp,
  getApps,
} from "firebase/app";

import {
  initializeAuth,
  getAuth,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

import { persistenciaAuth } from "./authPersistence";

const firebaseConfig = {
  apiKey: "AIzaSyD0eVqr7sGMZ7DN4CPYPscDcVmlqMDGLYk",
  authDomain: "inkapark-ce3d4.firebaseapp.com",
  projectId: "inkapark-ce3d4",
  storageBucket: "inkapark-ce3d4.firebasestorage.app",
  messagingSenderId: "139993194781",
  appId: "1:139993194781:web:8323d186d3c7eab8c441f4",
  measurementId: "G-9ML3KDLZ6T",
};

// Reutiliza la aplicación durante las recargas de desarrollo.
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Inicializa Authentication con persistencia de sesión.
const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: persistenciaAuth,
    });
  } catch (error) {
    if (error.code === "auth/already-initialized") {
      return getAuth(app);
    }

    throw error;
  }
})();

// Base de datos Firestore.
const db = getFirestore(app);

export { app, auth, db };