import * as WebSocket from "ws";
import { TypedWebSocket } from "../src/index";

interface Events {
  greet: (name: string) => void;
}

async function server(): Promise<void> {
  const wss = new WebSocket.Server({
    port: 8080,
  });

  wss.on("connection", (ws) => {
    const tws = new TypedWebSocket<Events>(ws);
    tws.on("greet", (name: string) => {
      console.log(`Hello ${name}`);
    });
  });
}

async function client(): Promise<void> {
  const ws = new WebSocket("ws://localhost:8080/");
  const tws = new TypedWebSocket<Events>(ws);

  await tws.open();
  tws.emit("greet", "World");
}

async function main(): Promise<void> {
  server();
  client();
}

main().catch((error) => {
  console.error(error);
});
