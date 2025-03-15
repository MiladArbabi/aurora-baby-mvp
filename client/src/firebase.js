import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBcbkVZfPz4F_ynmu7HuxoeQ2R3kt4tvuU",
    authDomain: "aurora-baby-mvp.firebaseapp.com",
    projectId: "aurora-baby-mvp",
    storageBucket: "aurora-baby-mvp.firebasestorage.app",
    messagingSenderId: "680806226468",
    appId: "1:680806226468:web:2a7f9dacfc795e71e316b1",
    measurementId: "G-KCDL8YJ9NN"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);