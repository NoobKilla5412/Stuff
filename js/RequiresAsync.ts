declare function write<T extends {}>(text: T): HTMLSpanElement;

declare function define(
  file: string,
  main: (exports: any, require: (file: string) => Promise<any>) => void | Promise<void>,
  run?: boolean
): void;

declare function setBasePath(newPath: string): void;
declare function resetBasePath(): void;
