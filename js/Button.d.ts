interface Listeners {
  onclick?: (e: MouseEvent) => void;
  onrightclick?: (e: MouseEvent) => void;
}

declare function ButtonRef(name: string, listeners: Listeners, cb?: (btn: HTMLButtonElement) => void): HTMLButtonElement;
declare function ButtonRef<T extends keyof HTMLElementTagNameMap>(
  type: T,
  name: string,
  listeners: Listeners,
  cb?: (btn: HTMLElementTagNameMap[T]) => void
): HTMLElementTagNameMap[T];

declare function Button(
  parentElement: HTMLElement,
  name: string,
  listeners: Listeners,
  cb?: (btn: HTMLButtonElement) => void
): HTMLButtonElement;
declare function Button<T extends keyof HTMLElementTagNameMap>(
  parentElement: HTMLElement,
  type: T,
  name: string,
  listeners: Listeners,
  cb?: (btn: HTMLElementTagNameMap[T]) => void
): HTMLElementTagNameMap[T];
declare function Button(name: string, listeners: Listeners, cb?: (btn: HTMLButtonElement) => void): HTMLButtonElement;
