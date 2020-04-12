import * as WS from "ws";
import { TypedWebSocket } from "../src";

interface Events {
  greet: (name: string) => void;
}

async function server(): Promise<void> {
  const wss = new WS.Server({
    port: 8080,
  });

  wss.on("connection", (ws: WebSocket) => {
    const tws = new TypedWebSocket<Events>(ws);
    tws.on("greet", (name: string) => {
      console.log(`Hello ${name}`);
    });
  });
}

async function client(): Promise<void> {
  const ws = new WS("ws://localhost:8080/");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tws = new TypedWebSocket<Events>(ws as any);

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
