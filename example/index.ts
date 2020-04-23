import * as WS from "ws";
import { TypedWebSocket } from "../src";

interface Events {
  foo: (name: string) => void;
  bar: () => void;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function server(): Promise<void> {
  const wss = new WS.Server({
    port: 8080,
  });

  wss.on("connection", async (ws: WebSocket) => {
    const tws = new TypedWebSocket<Events>(ws);
    tws.on("foo", (name: string) => {
      console.log(`Hello ${name}`);
    });
    await sleep(5000);
    tws.send("foo", "te4st");
  });
}

async function client(): Promise<void> {
  const ws = new WS("ws://localhost:8080/");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tws = new TypedWebSocket<Events>(ws as any);

  await tws.open();
  tws.send("foo", "World");

  await tws.receive(["foo", "bar"]).catch(() => {
    console.log("nothing received");
  });
  console.log("Received for or bar");
}

async function main(): Promise<void> {
  server();
  client();
}

main().catch((error) => {
  console.error(error);
});
