// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkxWtwR2Wgde6HEe3hNjzLfIYRjdN9CKs",
  authDomain: "trip-planner-aa0e3.firebaseapp.com",
  projectId: "trip-planner-aa0e3",
  storageBucket: "trip-planner-aa0e3.firebasestorage.app",
  messagingSenderId: "344309806936",
  appId: "1:344309806936:web:820eee5236fb1ce363172d",
  measurementId: "G-95499DP398"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);
// const analytics = getAnalytics(app);