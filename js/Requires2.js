((global) => {
  try {
    let forceOpen = false;
    if (localStorage.getItem("hasARequiresWindowOpen") == "true") {
      let error = new Error("You already have a tab open. Do you want to keep this open (Cancel) or close it (Ok)?");
      if (confirm(error)) {
        close();
        throw error;
      } else {
        forceOpen = true;
      }
    }

    function keepOpen() {
      requiresFunctionsRequired["keepOpen"] = true;
      localStorage.setItem("hasARequiresWindowOpen", false);
    }
    global.keepOpen = keepOpen;

    global.undefinedObj = { [Symbol.toStringTag]: "undefined", toString: () => "undefined" };

    localStorage.setItem("hasARequiresWindowOpen", true);

    console.error = console.log.bind(console);

    let moduleFunctions = {};
    global.moduleFunctions = moduleFunctions;
    let /** @type {{ [name: string]: { exports: {} } }} */ modules = {};

    let /** @type {string[]} */ dependencies = [];
    let mainModule = "";
    let requiresFunctionsRequired = { writeLn: true, write: true, writeObj: true };
    let exported = false;
    let __path = "";
    global.__path = __path;

    let /** @type {((obj: any, options: any, lineWidth?: number) => string)?} */ __objToHTML = null;
    let __parseOptions = undefined;
    let __lineWidth = 70;

    /**
     * @param {(obj: any, options: any, lineWidth?: number) => string} objToHTML
     */
    function initWrite(objToHTML, options, lineWidth = 70) {
      __objToHTML = objToHTML;
      __parseOptions = options;
      __lineWidth = lineWidth;
      requiresFunctionsRequired["initWrite"] = true;
    }
    global.initWrite = initWrite;

    function normalizePath(parts, allowAboveRoot) {
      requiresFunctionsRequired["normalizePath"] = true;
      let absolute = parts.startsWith("/");
      if (!Array.isArray(parts)) parts = parts.split(/[/\\]/);
      var res = [];
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];

        // ignore empty parts
        if (!p || p === ".") continue;

        if (p === "..") {
          if (res.length && res[res.length - 1] !== "..") {
            res.pop();
          } else if (allowAboveRoot) {
            res.push("..");
          }
        } else {
          res.push(p);
        }
      }

      let resultString = res.join("/");
      // console.log(resultString);

      // if (!/\.[^]*$/.test(resultString) && !/\/$/.test(resultString)) {
      //   resultString += "/";
      // }
      return (absolute ? "/" : "") + resultString;
    }
    global.normalizePath = normalizePath;

    function functionStringContent(fn) {
      let string = fn.toString().split("\n");
      string.shift();
      string.pop();
      string = string.join("\n");
      return string;
    }
    global.functionStringContent = functionStringContent;

    /**
     * @param {{toString(): string}} text
     */
    function write(text = "undefined") {
      let elem = document.createElement("span");
      let html = text
        .toString()
        .replace(/\n/g, "<br>")
        .replace(/ {2,}/g, (x) => {
          return x.replace(/ /, "&nbsp;");
        })
        .replace(/\t/g, "&nbsp;".repeat(4));
      // if (typeof text == "object") {
      //   if (typeof __objToHTML == "function") html = __objToHTML(text, __parseOptions, __lineWidth);
      //   else html = JSON.stringify(text);
      // }
      elem.innerHTML = html;
      requiresFunctionsRequired["write"] = true;
      return document.body.appendChild(elem);
    }
    global.write = write;

    /**
     * @param {{toString(): string}} text
     */
    function writeLn(text) {
      let elem = write(text);
      document.body.appendChild(document.createElement("br"));
      requiresFunctionsRequired["writeLn"] = true;
      return elem;
    }
    global.writeLn = writeLn;

    function writeObj(obj) {
      let elem = writeLn(`<pre>${(JSON.stringify(obj, undefined, 2) ?? "undefined").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`);
      requiresFunctionsRequired["writeObj"] = true;
      return elem;
    }
    global.writeObj = writeObj;

    /**
     * @param {string} name
     * @param {(require, exports, module) => void} data
     * @param {boolean=} run
     * @param {any[]=} args
     */
    function define(name, data, run, args = []) {
      requiresFunctionsRequired["define"] = true;
      if (data) {
        if (/^([\w\-]*)$/.test(name)) name = `/node_modules/${name}/index.js`;
        if (name.startsWith("/")) name = name.slice(1);
        moduleFunctions[name] = data;
        if (run) {
          mainModule = name;
          setTimeout(() => {
            Run(name, args, true);
          });
        }
      }
    }
    global.define = define;

    function toRequires(str) {
      let hasDefaultExport = Array.from(str.matchAll(/export default/g)).length;
      str = str
        .replace(/import ([^]*?) from ("|')([^]*?)\2;?$/gm, "const $1 = require($2$3$2);")
        .replace(/export default function ([^ ]*?)\(([^]*?)\) {([^]*?)}$/gm, "function $1($2) {$3}\n  module.exports = $1;")
        .replace(/export function ([^ ]*?)\(([^]*?)\) {([^]*?)}$/gm, `function $1($2) {$3}\n  ${hasDefaultExport ? "module." : ""}exports.$1 = $1;`)
        // .replace(/req(uire)?\((["'])([\w\-]*?)(["'])\)/g, "(await req($2/node_modules/$3/$4))")
        .replace(/req(uire)?\((["'])([^]*?)(["'])\)/g, "(await req($2$3$4))")
        .replace(/console\.log/g, "writeObj");
      // if (Array.from(str.matchAll(/module\.exports = /g)).length > 1) {
      //   return new Error("Can not have multiple default exports.");
      // }
      return str;
    }
    global.toRequires = toRequires;

    /**
     * @param {string} name
     * @param {(require, exports, module) => void} data
     * @param {boolean} run
     */
    function defineCommonJS(name, data, run) {
      try {
        let str = toRequires(functionStringContent(data));
        writeLn(str);
        data = new Function("req", "exports", "module", str);
        define(name, data, run);
      } catch (e) {
        console.error(e);
        writeLn(e);
      }
    }
    global.defineCommonJS = defineCommonJS;

    function defaultArgs(currentArgs, defaultArgs) {
      requiresFunctionsRequired["defaultArgs"] = true;
      return Object.assign({}, defaultArgs, currentArgs);
    }
    global.defaultArgs = defaultArgs;

    /**
     * @param {string} path
     * @param {any=} args
     * @param {boolean} initial
     */
    async function Run(path, args = {}, initial = false) {
      requiresFunctionsRequired["Run"] = true;
      // if (!path.startsWith(__path)) path = __path + path;
      path = normalizePath(path, true);
      return new Promise(async (resolve) => {
        let file = path.slice(path.lastIndexOf("/") + 1);
        try {
          if (!initial && !exported) {
            const res = await Promise.race([new Promise((resolve) => setTimeout(resolve, 200, "Can not load module " + path)), getScript(path)]);
            if (res) {
              resolve({});
              throw res;
            }
          }
          let path1 = path;
          let basePath = path1.slice(0, path1.lastIndexOf("/") + 1);
          dependencies.push(path);
          modules[path] ??= {};
          modules[path].exports ??= {};
          const res = await moduleFunctions[path](
            /** @param {string} path */ (path, args) => {
              if (/^([\w\-]*)$/.test(path)) path = `/node_modules/${path}/index.js`;
              if (path == ".") path = "./";
              if (path.endsWith("/")) path += "index";
              if (!path.endsWith(".js")) path += ".js";
              path = normalizePath(path, true);
              if (!path.startsWith("/")) path = basePath + path;
              else path = path.slice(1);
              path = normalizePath(path, true);

              if (typeof modules[path] != "undefined") {
                return modules[path].exports;
              } else
                return new Promise(async (resolve) => {
                  if (typeof modules[path] == "undefined") {
                    await Run(path, args || {});
                  }
                  resolve(modules[path].exports);
                });
            },
            modules[path].exports,
            modules[path],
            args ?? {}
          );
          if (res != void 0) modules[path].exports = res;
          resolve();
        } catch (e) {
          keepOpen();
          console.log(e);
          writeLn(`<pre style="color: red;">${e.stack || e}</pre>`);
          resolve();
        }
      });
    }

    /**
     * @param {string} path
     * @returns {Promise<void>}
     */
    async function getScript(path) {
      requiresFunctionsRequired["getScript"] = true;
      return new Promise((resolve) => {
        let file = path.slice(path.lastIndexOf("/") + 1);
        // if (typeof moduleFunctions[file] == "undefined") dependencies.push(path);
        const elem = document.createElement("script");
        elem.onload = async () => {
          resolve();
        };
        if (!/^https?:\/\//.test(path)) {
          path = global.defaultBasePath + path;
        }
        elem.src = path;
        document.body.appendChild(elem);
      });
    }
    global.getScript = getScript;

    // const globals = ["testGlobal.js"];

    // addEventListener("DOMContentLoaded", () => {
    //   for (let i = 0; i < globals.length; i++) {
    //     const element = globals[i];
    //     define(
    //       "runGlobals",
    //       async (_exports, require) => {
    //         // await getScript(global.defaultBasePath + element);
    //         const globalExports = await require(global.defaultBasePath + element);
    //         for (const key in globalExports) {
    //           if (Object.hasOwnProperty.call(globalExports, key)) {
    //             globalThis[key] = globalExports[key];
    //           }
    //         }
    //       },
    //       true
    //     );
    //   }
    // });
    window.onError = (e) => {
      writeLn(e);
    };
    if (!forceOpen)
      addEventListener("beforeunload", () => {
        localStorage.setItem("hasARequiresWindowOpen", false);
      });
    global.process = { version: "2.0.0" };

    Object.defineProperty(global, "__dirname", { value: "/" });
  } catch (e) {
    writeLn(e);
  }
})(globalThis);
