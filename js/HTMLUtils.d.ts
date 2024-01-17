declare function createElement<T extends keyof HTMLElementTagNameMap>(
  type: T,
  innerHTML: any,
  append?: boolean
): HTMLElementTagNameMap[T];
declare function createElement<T extends keyof HTMLElementTagNameMap>(type: T, append?: boolean): HTMLElementTagNameMap[T];

declare function br(): void;
declare function brRef(): HTMLBRElement;
