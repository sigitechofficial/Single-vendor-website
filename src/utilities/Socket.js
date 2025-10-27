// socketService.js
import { io } from "socket.io-client";

const socket = io("wss://backend.fomino.ch:3041", {
  transports: ["websocket"],
});
// const socket = io("http://192.168.0.158:3041", {
//   transports: ["websocket"],
// });

export default socket;
