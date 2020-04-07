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

  on<TEvent extends keyof TReceiveEvents>(
    event: TEvent,
    listener: EventListener<TReceiveEvents[TEvent]>
  ): void {
    for (const tws of this) {
      tws.on(event, listener);
    }
  }

  public async emit<TEvent extends keyof TSendEvents>(
    event: TEvent,
    ...args: EventArgumentTypes<TSendEvents[TEvent]>
  ): Promise<void> {
    for (const tws of this) {
      tws.emit(event, ...args);
    }
  }

  public close(): void {
    for (const tws of this) {
      tws.close();
    }
  }
}
