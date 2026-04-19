import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCwrnwXxBdIqtq-fijxdoiCNnRfZ_9tFFc",
  authDomain: "crop3-6561e.firebaseapp.com",
  projectId: "crop3-6561e",
  storageBucket: "crop3-6561e.firebasestorage.app",
  messagingSenderId: "684558039385",
  appId: "1:684558039385:web:70699ccafa027424adf448",
  measurementId: "G-4FKCC9J8DR"
};

// Initialize Firebase (check if already initialized for Next.js SSR/HMR safety)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
