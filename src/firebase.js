import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCRJEGAf-F_aXnL-KMzqMyB5FcyHAINjc",
  authDomain: "samaservice-8ea00.firebaseapp.com",
  projectId: "samaservice-8ea00",
  storageBucket: "samaservice-8ea00.firebasestorage.app",
  messagingSenderId: "1078524933964",
  appId: "1:1078524933964:web:8612148eb98d615e5a81e9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Force reCAPTCHA v2 classique
auth.settings.appVerificationDisabledForTesting = false;
