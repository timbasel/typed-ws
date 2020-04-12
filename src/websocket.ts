/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck

interface WebSocket {
  readyState: number;
  CONNECTING: number;
  OPEN: number;
  send: (event?: any) => void;
  onopen: (event?: any) => void;
  onmessage: (event: any) => void;
  onerror: (event: any) => void;
  onclose: (event: any) => void;
  close: () => void;
}

let ws: WebSocket = null;

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  if (typeof WebSocket !== "undefined") {
    ws = WebSocket;
  } else if (typeof MozWebSocket !== "undefined") {
    ws = MozWebSocket;
  } else if (typeof global !== "undefined") {
    ws = global.WebSocket || global.MozWebSocket;
  } else if (typeof window !== "undefined") {
    ws = window.WebSocket || window.MozWebSocket;
  } else if (typeof self !== "undefined") {
    ws = self.WebSocket || self.MozWebSocket;
  }
} else {
  ws = require("ws");
}

export { ws as WebSocket };
