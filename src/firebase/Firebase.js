import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "AIzaSyBvdxpX6Jling7CH5aCZSn9IXtUp6K6tVc",
  authDomain: "fomino-sigi.firebaseapp.com",
  databaseURL: "https://fomino-sigi-default-rtdb.firebaseio.com",
  projectId: "fomino-sigi",
  storageBucket: "fomino-sigi.appspot.com",
  messagingSenderId: "249067279538",
  appId: "1:249067279538:web:3d6e7f786b4a6cdbe8a5ab",
  measurementId: "G-LC64HB5K5H",
};

const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;
      