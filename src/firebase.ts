/*----*/

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkdrr8STyrbpJ77N6q24XdIIB2n0CL0ho",
  authDomain: "chef-hamada.firebaseapp.com",
  databaseURL: "https://chef-hamada-default-rtdb.firebaseio.com",
  projectId: "chef-hamada",
  storageBucket: "chef-hamada.firebasestorage.app",
  messagingSenderId: "151452472473",
  appId: "1:151452472473:web:b1ed9372e38001ba1f1408"
};

const app = initializeApp(firebaseConfig);

// 👇 هذا هو المهم
export const db = getDatabase(app);
export const auth = getAuth(app);
