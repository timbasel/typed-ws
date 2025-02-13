import {
  EventArgumentTypes,
  EventListener,
  Listener,
  PromiseReceiver,
  WebSocket,
} from "./types";

export class TypedWebSocket<TReceiveEvents, TSendEvents = TReceiveEvents> {
  private readonly ws: WebSocket;
  private readonly listeners: Array<{
    event: keyof TReceiveEvents;
    listener: Listener;
    once: boolean;
  }> = [];
  private readonly receivers: Array<{
    events: Array<keyof TReceiveEvents>;
    promise: PromiseReceiver<keyof TReceiveEvents>;
  }> = [];

  public constructor(ws: WebSocket) {
    this.ws = ws;

    this.ws.onmessage = this.handleError(this.ws, this.onMessage);
  }

  private handleError<T>(
    ws: WebSocket,
    fn: (msg: MessageEvent) => Promise<T>
  ): (msg: MessageEvent) => Promise<T | void> {
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

  private async onMessage(msg: MessageEvent): Promise<void> {
    if (typeof msg.data != "string") {
      throw new Error("invalid data type");
    }
    const json = JSON.parse(msg.data);
    const messageEvent = json.event;
    this.listeners.forEach(({ event, listener, once }, index) => {
      if (event == messageEvent) {
        listener(...(json.args || []));
      }

      if (once) {
        this.listeners.splice(index, 1);
      }
    });
    this.receivers.forEach(({ events, promise }, index) => {
      if (events.includes(messageEvent)) {
        promise.resolve(messageEvent);
        this.receivers.splice(index, 1);
      }
    });
  }

  public async onOpen(listener: Listener | null): Promise<void> {
    this.ws.onopen = listener;
  }

  public async onClose(listener: Listener | null): Promise<void> {
    this.ws.onclose = listener;
  }

  public async open(): Promise<void> {
    return new Promise((resolve) => {
      if (this.ws.readyState === this.ws.CONNECTING) {
        const listener = this.ws.onopen as Listener;
        this.onOpen(() => {
          if (listener) {
            listener();
          }
          this.ws.onopen = listener;
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
    const index = this.listeners.findIndex(
      (item) => item.event == event && item.listener == listener
    );
    if (index > 0) {
      this.listeners.splice(index, 1);
    }
    return this;
  }

  public removeAll<TEvent extends keyof TReceiveEvents>(
    event: TEvent
  ): TypedWebSocket<TReceiveEvents, TSendEvents> {
    for (let index = 0; index < this.listeners.length; index++) {
      if (this.listeners[index].event == event) {
        this.listeners.splice(index, 1);
      }
    }
    for (let index = 0; index < this.receivers.length; index++) {
      if (this.receivers[index].events.includes(event)) {
        this.receivers[index].promise.resolve();
        this.receivers.splice(index, 1);
      }
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

  public async send<TEvent extends keyof TSendEvents>(
    event: TEvent,
    ...args: EventArgumentTypes<TSendEvents[TEvent]>
  ): Promise<void> {
    this.ws.send(JSON.stringify({ event: event, args: args }));
  }

  public async receive<TEvent extends keyof TReceiveEvents>(
    event: TEvent | Array<TEvent>,
    timeout = 10000
  ): Promise<keyof TReceiveEvents> {
    const events = event instanceof Array ? event : [event];
    const promise = new Promise<keyof TReceiveEvents>((resolve, reject) => {
      this.receivers.push({ events, promise: { resolve, reject } });

      setTimeout(() => {
        reject();
      }, timeout);
    });

    return promise;
  }

  public received<TEvent extends keyof TReceiveEvents>(
    event: TEvent | Array<TEvent>,
    succesful = true
  ): void {
    const events = event instanceof Array ? event : [event];
    this.receivers.forEach((receiver, index) => {
      for (const event of events) {
        if (receiver.events.includes(event)) {
          if (succesful) {
            receiver.promise.resolve(event);
          } else {
            receiver.promise.reject();
          }
          this.receivers.slice(index, 1);
        }
      }
      return false;
    });
  }

  public async error(error: Error, close = false): Promise<void> {
    this.ws.send(
      JSON.stringify({
        event: "error",
        args: [error.message],
      })
    );
    if (close) {
      this.ws.close();
    }
  }
}

export default TypedWebSocket;
