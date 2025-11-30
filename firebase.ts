import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from user prompt
const firebaseConfig = {
  apiKey: "AIzaSyDPv7iBhX2-937Ws9qPr91nWIRkJfGJZ0w",
  authDomain: "logo-fresh.firebaseapp.com",
  projectId: "logo-fresh",
  storageBucket: "logo-fresh.appspot.com", // Corrected storage bucket
  messagingSenderId: "1064659319220",
  appId: "1:1064659319220:web:9f8915ed105ad672031ae1",
  measurementId: "G-BM10F7QGTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
