import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHoiOlvi-cf76OX6rq1e3VDybXKnaEFS8",
  authDomain: "portal-cc669.firebaseapp.com",
  projectId: "portal-cc669",
  storageBucket: "portal-cc669.appspot.com",
  messagingSenderId: "160343491803",
  appId: "1:160343491803:web:9b0ee00425c0e637dd38fe"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);