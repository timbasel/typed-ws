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
