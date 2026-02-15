import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJyTbiiyrgtKtg6j9LZESkdRSz3D3eBis",
  authDomain: "anti-social-space-6e92b.firebaseapp.com",
  projectId: "anti-social-space-6e92b",
  storageBucket: "anti-social-space-6e92b.firebasestorage.app",
  messagingSenderId: "724895391995",
  appId: "1:724895391995:web:2c02f5e1961a281b2dd05e",
  measurementId: "G-S89Z81TKXZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();