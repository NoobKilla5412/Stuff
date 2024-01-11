// @ts-check

(async (global) => {
  writeLn(location.pathname);

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
    return document.body.appendChild(elem);
  }
  global.write = write;

  /**
   * @param {{ toString(): string }} text
   */
  function writeLn(text) {
    let elem = write(text);
    document.body.appendChild(document.createElement("br"));
    return elem;
  }
  global.writeLn = writeLn;

  /**
   * @param {{ toString(): string }} text
   */
  function writeLnMono(text) {
    createStyle();
    let elem = document.body.appendChild(document.createElement("pre"));
    elem.innerHTML = `${text}`;
    return elem;
  }
  global.writeLnMono = writeLnMono;

  function writeErr(err) {
    let elem = writeLn(`<pre style="color: red">${err?.stack || err}</pre>`);
    return elem;
  }
  global.writeErr = writeErr;

  function writeWarn(err) {
    let elem = writeLn(`<pre style="color: #8B8000">${err?.stack || err}</pre>`);
    return elem;
  }
  global.writeWarn = writeWarn;

  function objToString(obj) {
    return obj == null
      ? "null"
      : (
          JSON.stringify(
            obj,
            (key, value) => {
              if (typeof value == "function") return "function: " + value.toString();
              return value;
            },
            2
          ) ?? "undefined"
        )
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
  }

  /**
   * @param {any} obj
   */
  function writeObj(obj) {
    // writeLn(obj);
    let elem = writeLnMono(objToString(obj));
    return elem;
  }
  global.writeObj = writeObj;

  function displayObj(obj) {
    let elem = writeObj(obj());

    let interval = setInterval(() => {
      elem.innerHTML = objToString(obj());
    }, 100);

    return {
      cancel: () => clearInterval(interval)
    };
  }
  global.displayObj = displayObj;

  const countLabels = {
    default: 0
  };

  global.console = {
    log: (data) => {
      if (typeof data == "string") {
        writeLn(data);
      } else {
        writeObj(data);
      }
    },
    error: writeErr,
    warn: writeWarn,
    table: () => {
      // This function gets overriden in convertToTable.js
      writeWarn('To use console.table, please import "convertToTable.js"');
    },
    count: (label = "default") => {
      if (!countLabels[label]) countLabels[label] = 1;
      else countLabels[label]++;
      console.log(`${label}: ${countLabels[label]}`);
    },
    countReset: (label = "default") => {
      countLabels[label] = 0;
      console.log(`${label}: ${countLabels[label]}`);
    }
  };

  const styleName = "42389tujfireuofgpsdfjkgnju9jn";

  const sleep = async (/** @type {number=} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));
  global.sleep = sleep;
  const rejectSleep = async (/** @type {number=} */ ms, /** @type {string=} */ msg = "timeout") => new Promise((_, reject) => setTimeout(reject, ms, msg));
  global.rejectSleep = rejectSleep;

  async function createStyle() {
    return Promise.race([
      /** @type {Promise<void>} */ (
        new Promise((resolve) => {
          const style = /** @type {HTMLLinkElement} */ (document.getElementById(styleName) || document.head.appendChild(document.createElement("link")));
          style.rel = "stylesheet";
          style.id = styleName;
          style.href = joinPath(defaultBasePath, "js/Requires3.css");
          style.onload = () => {
            resolve();
          };
        })
      ),
      rejectSleep(100, "Stylesheet is not found")
    ]);
  }

  /**
   * @param {string[]} args
   */
  function joinPath(...args) {
    var paths = [];
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      if (typeof arg != "string") {
        throw new TypeError("Arguments to path.join must be strings");
      }
      if (arg) {
        paths.push(arg);
      }
    }

    var joined = paths.join("/");

    // Make sure that the joined path doesn't start with two slashes, because
    // normalize() will mistake it for an UNC path then.
    //
    // This step is skipped when it is very clear that the user actually
    // intended to point at an UNC path. This is assumed when the first
    // non-empty string arguments starts with exactly two slashes followed by
    // at least one more non-slash character.
    //
    // Note that for normalize() to treat a path as an UNC path it needs to
    // have at least 2 components, so we don't filter for that here.
    // This means that the user can use join to construct UNC paths from
    // a server name and a share name; for example:
    //   path.join('//server', 'share') -> '\\\\server\\share\')
    // if (!/^[\\\/]{2}[^\\\/]/.test(paths[0])) {
    //   joined = joined.replace(/^[\\\/]{2,}/, "/");
    // }

    return normalizePath(joined);
  }
  global.joinPath = joinPath;

  function normalizePath(parts, allowAboveRoot) {
    // requiresFunctionsRequired["normalizePath"] = true;
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

  const defaultBasePath = joinPath(location.pathname, "..");

  try {
    /**
     * @typedef Module
     * @prop {any} exports
     */

    let moduleFunctions = {};
    /**
     * @type {{ [path: string]: Module }}
     */
    let modules = {};

    /**
     * @template T
     * @param {(req: (name: string, args?: any) => any, exports: T, module: { exports: T }) => any} data
     */
    function define(data) {
      if (typeof data == "string") {
        // if (/^([\w\-]*)$/.test(data)) data = `node_modules/${data}/index.js`;
        // if (data.startsWith("/")) data = data.slice(1);
        // if (!data.startsWith(defaultBasePath)) data = joinPath(defaultBasePath, data);
        writeLn(`Module "${data}" needs to be updated`);
        // moduleFunctions[data] = arguments[1];
        // if (arguments[2]) {
        //   setTimeout(() => {
        //     Run(data, arguments[3]);
        //   });
        // }
      } else {
        moduleFunctions[currentImportPath] = data;
      }
    }
    global.define = define;

    global.currentImportPath = defaultBasePath;

    /**
     * @param {string} path
     * @returns {Promise<void>}
     */
    async function getScript(path) {
      return Promise.race([
        /** @type {Promise<void>} */ (
          new Promise((resolve) => {
            // if (typeof moduleFunctions[path] == "undefined") dependencies.push(path);
            const elem = document.createElement("script");
            elem.onload = () => {
              resolve();
            };
            elem.src = path;
            document.body.appendChild(elem);
          })
        ),
        rejectSleep(1000, `Could not load module "${path}" due to timeout. Check if the file exists.`)
      ]);
    }

    /**
     * @param {string} path
     */
    function addDotJS(path) {
      if (!/\.\w+$/.test(path)) {
        path += ".js";
      }
      return path;
    }

    /**
     * @param {string} path
     * @param {any=} args
     */
    async function Run(path, args) {
      return /** @type {Promise<void>} */ (
        new Promise(async (resolve, reject) => {
          try {
            let originalPath = currentImportPath;
            if (currentImportPath != path) {
              currentImportPath = joinPath(currentImportPath, path);
            }
            currentImportPath = addDotJS(currentImportPath);
            path = currentImportPath;
            if (typeof moduleFunctions[path] != "function") {
              await getScript(path);
            }
            if (typeof moduleFunctions[path] != "function") {
              throw new Error(`File "${path}" is not a module`);
            }

            if (typeof modules[path] == "undefined") {
              modules[path] = {
                exports: {}
              };
            }
            const res = await moduleFunctions[path].bind(modules[path].exports)(
              async (/** @type {string} */ name, /** @type {any=} */ args) => {
                let originalPath = currentImportPath;
                currentImportPath = joinPath(currentImportPath, "..", name);
                let importFromPath = (currentImportPath = addDotJS(currentImportPath));
                let _path = currentImportPath;
                if (typeof modules[_path] == "undefined") {
                  await Run(importFromPath, args);
                }
                currentImportPath = originalPath;
                return modules[_path].exports;
              },
              modules[path].exports,
              modules[path],
              args
            );
            if (typeof res != "undefined") {
              if (typeof res == "object" && res) Object.assign(modules[path].exports, res);
              else modules[path].exports = res;
            }
            currentImportPath = originalPath;
            resolve();
          } catch (e) {
            reject(e?.stack || e);
          }
        })
      );
    }

    /**
     * @param {string} name
     */
    async function init(name) {
      if (!document.title) {
        document.title = name;
      }
      try {
        await Run("./js/fileBrowser");
        await Run(name);
      } catch (e) {
        console.error(e);
      }
    }
    global.init = init;

    /**
     * @param {string} str
     */
    function toRequires(str) {
      let hasDefaultExport = Array.from(str.matchAll(/export default/g)).length;

      // if (Array.from(str.matchAll(/module\.exports = /g)).length > 1) {
      //   return new Error("Can not have multiple default exports.");
      // }
      // let res = "";
      // let s = str.split("");
      // function skip_whitespace() {
      //   let res = "";
      //   while (/\s/.test(s[0])) res += s.shift();
      //   return res;
      // }

      // function parse_varname() {
      //   // if (!/[a-z]/gi.test(s[0])) console.error(new SyntaxError("Expected varname"));
      //   let chars = "";
      //   while (s.length > 0 && /[a-z]/gi.test(s[0])) {
      //     chars += s.shift();
      //   }
      //   return chars;
      // }

      // while (s.length > 0) {
      //   let t = s.shift();
      //   if (/[a-z]/gi.test(t)) {
      //     let chars = t + parse_varname();
      //     res += skip_whitespace();
      //     if (chars == "export") {
      //       let key = parse_varname();
      //       if (key == "function") {
      //         res += "function ";
      //         let name = parse_varname();
      //         res += name;
      //         while (s.length > 0 && s[0] != ")") res += s.shift();
      //         res += s.shift();
      //         res += skip_whitespace();
      //         if (s[0] == "{") {
      //           res += s.shift();
      //           let parenCount = 1;
      //           while (s.length > 0) {
      //             if (s[0] == "{") parenCount++;
      //             else if (s[0] == "}") parenCount--;
      //             res += s.shift();
      //             if (parenCount == 0) break;
      //           }
      //           res += `\nexports.${name} = ${name};`;
      //         }
      //       }
      //     } else res += chars;
      //   } else res += t;
      // }
      return (
        str
          .replace(/import ([^]*?) from ("|')([^]*?)\3;?$/gm, "const $1 = require($2$3$2);")
          // .replace(/export default function ([^ ]*?)\(([^]*?)\) {([^]*?)}$/gm, "function $1($2) {$3}\n  module.exports = $1;")
          // .replace(/export function ([^ ]*?)\(([^]*?)\) {([^]*?)}$/gm, `function $1($2) {$3}\n  ${hasDefaultExport ? "module." : ""}exports.$1 = $1;`)
          // .replace(/req(uire)?\((["'])([\w\-]*?)(["'])\)/g, "(await req($2/node_modules/$3/$4))")
          .replace(/\breq(uire)?\(("|')([^]*?)\2\)/g, "(await req($2$3$2))")
          .replace(/console\.log/g, "writeObj")
      );
    }
    global.toRequires = toRequires;
  } catch (e) {
    console.error(e);
  }
})(this);
