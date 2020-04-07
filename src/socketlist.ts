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

  public async emit<TEvent extends keyof TSendEvents>(
    event: TEvent,
    ...args: EventArgumentTypes<TSendEvents[TEvent]>
  ): Promise<void> {
    for (let i = 0; i < this.length; i++) {
      this[i].emit(event, ...args);
    }
  }

  public async error(error: Error, close = false): Promise<void> {
    for (let i = 0; i < this.length; i++) {
      this[i].error(error, close);
    }
  }
}
