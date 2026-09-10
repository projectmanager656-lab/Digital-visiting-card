import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNIg40H8NDqiNraQvLKAex0dqb6vd9m3E",
  authDomain: "digital-visiting-card-8f4d6.firebaseapp.com",
  projectId: "digital-visiting-card-8f4d6",
  storageBucket: "digital-visiting-card-8f4d6.firebasestorage.app",
  messagingSenderId: "205132592753",
  appId: "1:205132592753:web:4828672a3f0f1acc9b0dd0",
  measurementId: "G-9LVMR1X9W1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);