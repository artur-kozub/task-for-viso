import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
    authDomain: "viso-tech-task.firebaseapp.com",
    databaseURL: "https://viso-tech-task-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "viso-tech-task",
    storageBucket: "viso-tech-task.appspot.com",
    messagingSenderId: "810343997724",
    appId: "1:810343997724:web:4efb1da2f2a81e8b7c1ad9",
    measurementId: "G-E701E4ZJWQ"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };