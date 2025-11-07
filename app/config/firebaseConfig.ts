// app/config/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDiefI9dAIMqeCWeROO8iGf2sGw3P6L5NM",
    authDomain: "burgerfast-e3349.firebaseapp.com",
    databaseURL: "https://burgerfast-e3349-default-rtdb.firebaseio.com",
    projectId: "burgerfast-e3349",
    storageBucket: "burgerfast-e3349.firebasestorage.app",
    messagingSenderId: "164658668435",
    appId: "1:164658668435:web:56c7bb1d65766b7e4d3e66",
    measurementId: "G-RQEQ0NVJPZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);