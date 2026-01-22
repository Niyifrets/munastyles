import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9wLNgqV9Zvm6rbcqIeuFOLwxwy_ajwNU",
  authDomain: "muna-styles-7c513.firebaseapp.com",
  projectId: "muna-styles-7c513",
  storageBucket: "muna-styles-7c513.firebasestorage.app",
  messagingSenderId: "87081051568",
  appId: "1:918264512238:web:a5839e95f97f6e68f8e275"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);