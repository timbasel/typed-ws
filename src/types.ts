/* eslint-disable @typescript-eslint/no-explicit-any */

export type Listener = (...args: any[]) => any;

export type EventArgumentTypes<T> = [T] extends [(...args: infer U) => any]
  ? U
  : [T] extends [void]
  ? []
  : [T];

export type EventReturnType<T> = T extends (...args: any[]) => any
  ? ReturnType<T>
  : void;

export type EventListener<T> = (
  ...args: EventArgumentTypes<T>
) => EventReturnType<T>;

export type PromiseReceiver<T> = {
  resolve: (value?: T) => void;
  reject: (reason?: any) => void;
};

import * as NodeWebSocket from "ws";
type IsomorphicWebSocket = WebSocket | NodeWebSocket;
export { IsomorphicWebSocket as WebSocket };
