import * as WebSocket from "ws";

import { EventArgumentTypes, EventListener, Listener } from "./types";

export class TypedWebSocket<TReceiveEvents, TSendEvents = TReceiveEvents> {
  private readonly ws: WebSocket;
  private readonly listeners: Array<{
    event: keyof TReceiveEvents;
    listener: Listener;
    once: boolean;
  }> = [];

  public constructor(ws: WebSocket) {
    this.ws = ws;

    this.ws.on("message", this.handleError(this.ws, this.onMessage));
  }

  private handleError<T>(
    ws: WebSocket,
    fn: (data: WebSocket.Data) => Promise<T>
  ): (data: WebSocket.Data) => Promise<T | void> {
    return async (data): Promise<T | void> => {
      try {
        return await fn.bind(this)(data);
      } catch (error) {
        if (error instanceof Error) {
          this.error(error);
        } else if (typeof error == "string") {
          error = new Error(error);
          this.error(error, true);
        } else {
          error = new Error("internal server error");
          this.error(error, true);
        }
      }
    };
  }

  private async onMessage(data: WebSocket.Data): Promise<void> {
    if (typeof data != "string") {
      throw new Error("invalid data type");
    }
    const json = JSON.parse(data);
    const messageEvent = json.event;
    this.listeners.forEach(({ event, listener, once }, index) => {
      if (event == messageEvent) {
        listener(...(json.args || []));
      }

      if (once) {
        this.listeners.splice(index, 1);
      }
    });
  }

  public async open(): Promise<void> {
    return new Promise((resolve) => {
      if (this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.once("open", () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public close(): void {
    this.ws.close();
  }

  public remove<TEvent extends keyof TReceiveEvents>(
    event: TEvent,
    listener: EventListener<TReceiveEvents[TEvent]>
  ): TypedWebSocket<TReceiveEvents, TSendEvents> {
    const index = this.listeners.findIndex((item) => item.listener == listener);
    if (index > 0) {
      this.listeners.splice(index, 1);
    }
    return this;
  }

  public on<TEvent extends keyof TReceiveEvents>(
    event: TEvent,
    listener: EventListener<TReceiveEvents[TEvent]>
  ): TypedWebSocket<TReceiveEvents, TSendEvents> {
    this.listeners.push({ event, listener, once: false });
    return this;
  }

  public once<TEvent extends keyof TReceiveEvents>(
    event: TEvent,
    listener: EventListener<TReceiveEvents[TEvent]>
  ): TypedWebSocket<TReceiveEvents, TSendEvents> {
    this.listeners.push({ event, listener, once: true });
    return this;
  }

  public async emit<TEvent extends keyof TSendEvents>(
    event: TEvent,
    ...args: EventArgumentTypes<TSendEvents[TEvent]>
  ): Promise<void> {
    this.ws.send(JSON.stringify({ event: event, args: args }));
  }

  public async error(error: Error, close = false): Promise<void> {
    this.ws.send({
      event: "error",
      name: error.name,
      message: error.message,
    });
    if (close) {
      this.ws.close();
    }
  }
}

export default TypedWebSocket;
