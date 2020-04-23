import TypedWebSocket from "./socket";

import { EventArgumentTypes, EventListener } from "./types";

export class TypedWebSocketList<
  TReceiveEvents,
  TSendEvents = TReceiveEvents
> extends Array<TypedWebSocket<TReceiveEvents, TSendEvents>> {
  public constructor(
    ...items: Array<TypedWebSocket<TReceiveEvents, TSendEvents>>
  ) {
    super(...items);
    Object.setPrototypeOf(this, Object.create(TypedWebSocketList.prototype));
  }

  public async open(): Promise<void> {
    for (let i = 0; i < this.length; i++) {
      await this[i].open();
    }
  }

  public close(): void {
    for (let i = 0; i < this.length; i++) {
      this[i].close();
    }
  }

  public remove<TEvent extends keyof TReceiveEvents>(
    event: TEvent,
    listener: EventListener<TReceiveEvents[TEvent]>
  ): void {
    for (let i = 0; i < this.length; i++) {
      this[i].remove(event, listener);
    }
  }

  public removeAll<TEvent extends keyof TReceiveEvents>(event: TEvent): void {
    for (let i = 0; i < this.length; i++) {
      this[i].removeAll(event);
    }
  }

  public on<TEvent extends keyof TReceiveEvents>(
    event: TEvent,
    listener: EventListener<TReceiveEvents[TEvent]>
  ): void {
    for (let i = 0; i < this.length; i++) {
      this[i].on(event, listener);
    }
  }

  public async send<TEvent extends keyof TSendEvents>(
    event: TEvent,
    ...args: EventArgumentTypes<TSendEvents[TEvent]>
  ): Promise<void> {
    for (let i = 0; i < this.length; i++) {
      this[i].send(event, ...args);
    }
  }

  public async receive<TEvent extends keyof TReceiveEvents>(
    event: TEvent | Array<TEvent>,
    timeout?: number
  ): Promise<void> {
    const events = event instanceof Array ? event : [event];
    const promise = new Promise<void>((resolve, reject) => {
      for (let i = 0; i < this.length; i++) {
        this[i]
          .receive(events, timeout)
          .then(() => {
            this.forEach((socket) => socket.received(events));
            resolve();
          })
          .catch(() => {
            reject();
          });
      }
    });

    return promise;
  }

  public async error(error: Error, close = false): Promise<void> {
    for (let i = 0; i < this.length; i++) {
      this[i].error(error, close);
    }
  }
}
