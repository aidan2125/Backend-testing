// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC00rwqJP9wIG735L258jgneUKQLhVSKB8",
  authDomain: "travique-7c851.firebaseapp.com",
  projectId: "travique-7c851",
  storageBucket: "travique-7c851.firebasestorage.app",
  messagingSenderId: "1001728909577",
  appId: "1:1001728909577:web:68b8981e097e5b71b5b3d8",
  measurementId: "G-GBBZWDJHMW"
}; 
// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export services for use
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
