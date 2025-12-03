import WebSocket from "ws";

const ws = new WebSocket("http://localhost:8000/ws");

ws.on("open", () => {
  console.log("Connected to server");
  ws.send("Hi server!");
});

ws.on("message", (msg) => {
  console.log("Received from server:", msg.toString());
});
