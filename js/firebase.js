// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC00rwqJP9wIG735L258jgneUKQLhVSKB8",
  authDomain: "travique-7c851.firebaseapp.com",
  projectId: "travique-7c851",
  storageBucket: "travique-7c851.appspot.com", // ✅ Fix this domain (was incorrect before)
  messagingSenderId: "1001728909577",
  appId: "1:1001728909577:web:68b8981e097e5b71b5b3d8",
  measurementId: "G-GBBZWDJHMW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
