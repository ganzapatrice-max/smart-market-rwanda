
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZexRqhd_e_Ld82ITe6pkLPS40aiUsCuQ",
  authDomain: "quickfix-rwanda-dad8d.firebaseapp.com",
  projectId: "quickfix-rwanda-dad8d",
  storageBucket: "quickfix-rwanda-dad8d.firebasestorage.app",
  messagingSenderId: "207556616735",
  appId: "1:207556616735:web:e7189adbe52a35f4acab2a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);