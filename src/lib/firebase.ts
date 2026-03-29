import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDqTpVbhZxFdFlMvFTmS4y0Y1CnBe1NUx0",
    authDomain: "print-loo.firebaseapp.com",
    projectId: "print-loo",
    storageBucket: "print-loo.firebasestorage.app",
    messagingSenderId: "798409667106",
    appId: "1:798409667106:web:80b7e4c9184f3f4386507b",
    measurementId: "G-XX1XWJTTH6"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
