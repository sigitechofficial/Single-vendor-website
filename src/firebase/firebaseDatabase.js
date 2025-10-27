// firebaseDatabase.js
import { getDatabase, ref, onValue } from "firebase/database";
import firebaseApp from "./Firebase";

const database = getDatabase(firebaseApp);

export const getDriverLocation = (callback) => {
  const driverLocationRef = ref(database, "fomino_driver");

  return onValue(driverLocationRef, (snapshot) => {
    const data = snapshot.val();
    callback(data); 
  });
};
