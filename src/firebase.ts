// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// const firebaseConfig = {
//   apiKey: "AIzaSyBl0GGJM0mZK_MtQNCS0GpkhvtpuDPIfMA",
//   authDomain: "bj-alert.firebaseapp.com",
//   projectId: "bj-alert",
//   storageBucket: "bj-alert.firebasestorage.app",
//   messagingSenderId: "149339289115",
//   appId: "1:149339289115:web:813c82d053e2cc4fa62abe",
// };

const app = initializeApp(firebaseConfig);

// Export auth
export const auth = getAuth(app);
export const db = getFirestore(app);

// // ✅ Export Firestore
// export const db = getFirestore(app);
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// // Decode the base64 config from environment variable
// const decodedConfig = atob(import.meta.env.VITE_FIREBASE_BASE64);

// // Parse back to JSON
// const firebaseConfig = JSON.parse(decodedConfig);

// // Initialize Firebase app
// const app = initializeApp(firebaseConfig);

// // Export Firebase services
// export const auth = getAuth(app);
// export const db = getFirestore(app);
