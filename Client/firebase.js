// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA3jZzZkU9WZa7-DC22AfFsft7tuU8JmGc",
  authDomain: "sample-firebase-ai-app-fa9f7.firebaseapp.com",
  projectId: "sample-firebase-ai-app-fa9f7",
  storageBucket: "sample-firebase-ai-app-fa9f7.firebasestorage.app",
  messagingSenderId: "1070455342130",
  appId: "1:1070455342130:web:261ee49aa0a416d213282b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Đảm bảo auth là đối tượng trả về từ getAuth()

export { auth };
// export default app;
