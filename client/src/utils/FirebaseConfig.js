import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyAT_Ir1XygpXJeXx0CvAsZvM3S1lazzAFg",
    authDomain: "chat-app-6625d.firebaseapp.com",
    projectId: "chat-app-6625d",
    storageBucket: "chat-app-6625d.firebasestorage.app",
    messagingSenderId: "23995317400",
    appId: "1:23995317400:web:631bb60b0aeef279d0a4ed",
    measurementId: "G-2WLMKV5DSZ"
  };

  const app = initializeApp(firebaseConfig);
  export const firebaseAuth = getAuth(app);