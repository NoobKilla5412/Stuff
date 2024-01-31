declare var deps: string[];
declare var currentImportPath: string;
declare var mainModule: string;
declare var isExport: boolean;

declare function define(data: (req: (name: string, args?: any) => any, exports: T, module: { exports: T }) => any): void;
declare function define(name: string, data: (req: (name: string, args?: any) => any, exports: T, module: { exports: T }) => any): void;

declare function init(name: string): Promise<void>;

declare function write(text?: { toString(): string }): HTMLSpanElement;
declare function writeLn(content: string): HTMLSpanElement;
declare function writeLnMono(text: { toString(): string }): HTMLPreElement;
declare function writeErr(err: Error): HTMLSpanElement;
declare function writeWarn(err: Error): HTMLSpanElement;
declare function writeObj(obj: any): HTMLSpanElement;
declare function displayObj(obj: any): {
  cancel: () => void;
};

declare function joinPath(...args: string[]): string;
declare function normalizePath(parts: string, allowAboveRoot?: boolean): string;

declare function sleep(ms?: number): Promise<void>;
declare function rejectSleep(ms?: number, msg?: string): Promise<never>;

declare function toRequires(str: string): string;
