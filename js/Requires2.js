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

    addEventListener("DOMContentLoaded", () => {
      let url = location.href.split("/MyFiles/1%20School8%20S2/")[1];
      if (url.split("?")[0] != "_loadJS.html") addHistory(url);
      else addHistory(new URL(location.href).searchParams.get("file"));
    });

    function addHistory(url) {
      url = decodeURIComponent(url);
      if (url.startsWith("/")) url = url.slice(1);
      if (!history.includes(url) && !url.endsWith("?fileSelect=")) history.push(url);
      setHistory();
    }

    function setHistory() {
      history.sort((a, b) => a.localeCompare(b));
      localStorage.setItem("fileHistory", JSON.stringify(history));
    }

    /**
     * @type {string[]}
     */
    let history = JSON.parse(localStorage.getItem("fileHistory")) || [];

    global.openActive = false;

    /**
     * @param {string} text
     */
    function* getMatches(text) {
      for (let i = 0; i < history.length; i++) {
        const element = history[i];
        if (element.toLowerCase().includes(text.toLowerCase())) {
          yield element;
        }
      }
    }

    function allMatches(matches) {
      let res = [],
        _a;
      let i = 0;
      while ((_a = matches.next()) && i < 5) {
        res.push(_a.value);
        i++;
      }
      return res;
    }

    function hideOnFocusLost() {
      if (global.openActive) dispatchEvent(new KeyboardEvent("keydown", { key: "o", ctrlKey: true }));
    }

    /** @type {{ [key: string]: { title: string; icon: string } }} */
    const masks = {
      None: {
        title: "",
        icon: ""
      },
      Google: {
        title: "Google",
        icon: "https://google.com/favicon.ico"
      },
      Mail: {
        title: "Inbox - brandon.robertson@student.csd509j.net",
        icon: "https://mail.google.com/favicon.ico"
      },
      "Google Drive": {
        title: "My Drive - Google Drive",
        icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png"
      },
      "Google Translate": {
        title: "Google Translate",
        icon: "https://translate.google.com/favicon.ico"
      },
      OneDrive: {
        title: "1 School8 S2 - OneDrive",
        icon: "https://p.sfx.ms/images/favicon.ico"
      },
      Canvas: {
        title: "Dashboard",
        icon: "https://instructure-uploads.s3.amazonaws.com/account_70880000000000001/attachments/2248/favicon.ico"
      },
      Custom: {
        title: "",
        icon: ""
      }
    };
    /** @type {{ maskName: string; customData: { title: string; icon: string } }} */
    let currentMask = JSON.parse(
      localStorage.getItem("mask") ||
        JSON.stringify({
          maskName: "None",
          customData: {
            title: masks["Custom"].title,
            icon: masks["Custom"].icon
          }
        })
    );

    masks["Custom"] = currentMask.customData;

    /**
     * @template {keyof HTMLElementTagNameMap} K
     * @param {K} tagName
     * @returns {HTMLElementTagNameMap[K]}
     */
    function createElement(tagName) {
      requiresFunctionsRequired["createElement"] = true;
      return writeLn(`<${tagName}></${tagName}>`).querySelector(tagName);
    }
    global.createElement = createElement;

    let oldTitle = "";
    global.title = document.title;
    let oldFav = "";
    function changeTitle() {
      if (!document.querySelector("link[rel='shortcut icon']")) {
        let elem = document.createElement("link");
        elem.rel = "shortcut icon";
        elem.href = "data:image/x-icon,";
        document.head.appendChild(elem);
      }
      if (currentMask.maskName != "None") {
        if (document.visibilityState == "hidden") {
          if (!oldTitle) oldTitle = global.title;
          global.title = masks[currentMask.maskName].title;
          if (!oldFav) oldFav = document.querySelector("link[rel='shortcut icon']").href;
          document.querySelector("link[rel='shortcut icon']").href = masks[currentMask.maskName].icon;
        } else if (document.visibilityState == "visible") {
          if (oldTitle) global.title = oldTitle;
          oldTitle = "";
          if (oldFav) document.querySelector("link[rel='shortcut icon']").href = oldFav;
          oldFav = "";
        }
      }
      document.title =
        global.title +
        // (document.visibilityState == "visible" || currentMask.maskName == "None"
        //   ? " -- " + new Date().toLocaleTimeString()
        //   : "") +
        ((document.visibilityState == "visible" || currentMask.maskName == "None") && global.openActive ? " | File Select" : "");
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState == "hidden") hideOnFocusLost();
      changeTitle();
    });

    function changeCustomData() {
      masks["Custom"].title = prompt("Enter a custom title", masks["Custom"].title) ?? masks["Custom"].title;
      masks["Custom"].icon = prompt("Enter a custom icon", masks["Custom"].icon) ?? masks["Custom"].icon;
      currentMask.customData = masks["Custom"];
      saveMask();
    }

    function saveMask() {
      localStorage.setItem(
        "mask",
        JSON.stringify({
          maskName: currentMask.maskName,
          customData: {
            title: masks["Custom"].title,
            icon: masks["Custom"].icon
          }
        })
      );
    }

    global.defaultBasePath = "file:///home/chronos/u-4ef886ac9e0bdca46c56da748653c676bcfc4700/MyFiles/Stuff/";

    function openFilePicker() {
      const bg = document.body.appendChild(document.createElement("div"));
      bg.id = "fileSelectBg";
      bg.style.position = "fixed";
      bg.style.top = "0px";
      bg.style.left = "0px";
      bg.style.width = "100%";
      bg.style.height = "100%";
      bg.style.background = "#000000bf";
      bg.addEventListener("click", () => {
        closeFilePicker();
      });
      const form = document.body.appendChild(document.createElement("form"));
      form.id = "fileSelectForm";
      form.style.position = "fixed";
      form.style.left = "37.5%";
      form.style.top = "10px";
      form.style.border = "1px solid black";
      form.style.borderRadius = ".3rem";
      form.style.backgroundColor = "#ffffffbf";
      form.style.padding = "5px";
      // write((0xff * 0.75).toString(0x10));
      form.style.width = "25%";
      const maskLabel = form.appendChild(document.createElement("label"));
      maskLabel.innerHTML = "Mask: ";
      maskLabel.style.float = "right";
      const maskBtn = maskLabel.appendChild(document.createElement("select"));
      function loadMask() {
        maskBtn.innerHTML = "";
        for (const key in masks) {
          if (Object.hasOwnProperty.call(masks, key)) {
            const element = masks[key];
            maskBtn.innerHTML += `<option value="${key}"${key == currentMask.maskName ? " selected=true" : ""}>${
              key == "Custom" ? currentMask.customData.title + " | Custom" : key
            }</option>`;
          }
        }
      }
      loadMask();
      maskBtn.addEventListener("change", () => {
        let value = maskBtn.options[maskBtn.selectedIndex];
        currentMask.maskName = value.value;
        if (currentMask.maskName == "Custom") changeCustomData();
        saveMask();
        loadMask();
      });
      maskLabel.appendChild(document.createElement("br"));
      const changeCustomDataBtn = form.appendChild(document.createElement("button"));
      changeCustomDataBtn.innerHTML = "Change Custom Link & Title";
      changeCustomDataBtn.addEventListener("click", (e) => {
        changeCustomData();
        loadMask();
      });
      changeCustomDataBtn.type = "button";
      // write(maskBtn.innerHTML.replace(/</g, "&lt;"));
      const historyElem = form.appendChild(document.createElement("div"));
      historyElem.style.height = "50vh";
      historyElem.style.overflow = "auto";
      const input = form.appendChild(document.createElement("input"));
      form.addEventListener("blur", () => {
        if (document.activeElement == document.body) hideOnFocusLost();
      });
      input.style.width = "calc(100% - 10px)";
      input.autocomplete = "off";
      const search = form.appendChild(document.createElement("div"));
      let matches = getMatches(input.value);
      let currentAmount = 0;
      function updateSearch() {
        let matches1 = allMatches(getMatches(input.value));
        if (input.value) {
          search.innerHTML = matches1
            .join("\n")
            .replace(new RegExp(`(${input.value})`, "gi"), `<span style="background-color: yellow">$1</span>`)
            .replace(/\n/g, "<br>");
        } else search.innerHTML = "";
      }
      input.addEventListener("input", (e) => {
        updateSearch();
        oldInnerHTML = input.value;
        matches = getMatches(oldInnerHTML);
      });
      let oldInnerHTML = input.value;
      input.addEventListener("keydown", (e) => {
        if (e.shiftKey && e.key == "Tab") {
          e.preventDefault();
          matches = getMatches(oldInnerHTML);
          let lastAmount = currentAmount - 1;
          currentAmount = 0;
          let tmp = "";
          while (lastAmount - 1 > currentAmount) {
            tmp = matches.next().value;
            currentAmount++;
          }
          // if (tmp == getMatches(oldInnerHTML).next().value) {
          //   matches = getMatches(oldInnerHTML);
          //   let lastAmount = currentAmount;
          //   currentAmount = 0;
          //   while (lastAmount - 1 > currentAmount) {
          //     tmp = matches.next().value;
          //     currentAmount++;
          //   }
          // }
          input.value = tmp || input.value;
          // if (tmp) currentAmount--;
        }
        if (e.key == "Tab") {
          e.preventDefault();
          let tmp = matches.next().value;
          if (typeof tmp == "undefined") {
            matches = getMatches(oldInnerHTML);
            tmp = matches.next().value;
            currentAmount = 0;
          }
          input.value = tmp || input.value;
          if (tmp) currentAmount++;
        }
        if (e.key == "Backspace") {
          if (input.value != oldInnerHTML) {
            e.preventDefault();
            input.value = oldInnerHTML;
            matches = getMatches(oldInnerHTML);
            updateSearch();
          }
        }
      });
      function updateHistoryDisp() {
        historyElem.innerHTML =
          history.map((value) => `<a id="${value.replace(/\s/g, "_")}" style="cursor: pointer">${value}</a>`).join('<hr style="margin: 1px">') +
          '<hr style="margin: 1px">';
        history.forEach((value) => {
          const elem = document.getElementById(value.replace(/\s/g, "_"));
          elem.onclick = () => {
            loadFile(value);
          };
          elem.oncontextmenu = (e) => {
            e.preventDefault();
            if (confirm(`Are you sure you want to delete "${value}" from your history?`)) history.splice(history.indexOf(value), 1);
            setHistory();
            updateHistoryDisp();
          };
        });
      }

      updateHistoryDisp();

      /**
       * @param {string} file
       */
      function loadFile(file) {
        if (file && /\.[^]*$/.test(file)) {
          // if (file == "home") location.href = global.defaultBasePath + "home.html";
          // else {
          if (file.endsWith(".html")) location.href = global.defaultBasePath + file;
          else if (file.endsWith(".js")) {
            location.href = global.defaultBasePath + "_loadJS.html?file=" + encodeURIComponent(file);
          } else {
            Run(file);
            addHistory(file);
          }
          // }
          file = "";
          oldInnerHTML = "";
          input.value = "";
          updateSearch();
          updateHistoryDisp();
        }
      }

      input.focus();
      form.onsubmit = (e) => {
        e.preventDefault();
        loadFile(input.value);
      };
      global.openActive = true;
    }
    global.openFilePicker = openFilePicker;

    function closeFilePicker() {
      document.querySelector("form#fileSelectForm").remove();
      document.querySelector("div#fileSelectBg").remove();
      global.openActive = false;
    }

    let devOpen = false;

    addEventListener("keydown", (e) => {
      if (e.ctrlKey) {
        if (e.key == "o") {
          e.preventDefault();
          if (!global.openActive) openFilePicker();
          else closeFilePicker();
        } else if (e.key == "k") {
          e.preventDefault();
          let allow = confirm(`Are you sure you want to clear ${history.length} items from your history?`);
          if (allow) {
            history = [];
            localStorage.setItem("fileHistory", JSON.stringify(history));
          }
        } else if (e.key == "h") {
          e.preventDefault();
          location.href = global.defaultBasePath + "home.html";
        } else if (e.code == "Backquote") {
          if (!devOpen) {
            var x = document.createElement("script");
            x.src = "https://cdn.jsdelivr.net/gh/SnowLord7/devconsole@master/main.js";
            document.head.appendChild(x);
            x.onload = () => {
              document.getElementsByClassName("snowlord-devConsole-container-body-exit")[0].addEventListener("click", () => {
                devOpen = false;
              });
            };
            devOpen = true;
          } else {
            document.getElementsByClassName("snowlord-devConsole-container-body-exit")[0]?.click();
          }
        } else if (e.key == "e") {
          e.preventDefault();
          keepOpen();
          // const scripts = document.querySelectorAll("script");
          // for (const script of scripts) {
          //   writeLn(script.src);
          // }
          /**
           * @param {string} str
           */
          function escapeHTML(str) {
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");
          }
          let file = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.title}</title>
  </head>
  <body>
    ${false ? '<script src="https://cdn.jsdelivr.net/gh/SnowLord7/devconsole@master/main.js"></script>' : ""}
    <script>
    var requiresFunctionsRequired = {};
    var moduleFunctions = {};
    var dependencies = [];
    var modules = {};
    var exported = true;
    var __path = ${JSON.stringify(__path)};
`;
          for (const key in requiresFunctionsRequired) {
            if (Object.hasOwnProperty.call(requiresFunctionsRequired, key)) {
              const element = requiresFunctionsRequired[key];
              if (element) {
                file += `${eval(key)}\n`;
              }
            }
          }
          file += "</script>\n";
          for (let i = dependencies.length - 1; i >= 0; i--) {
            const dependency = dependencies[i];
            if (moduleFunctions[dependency])
              file += `<script>
  define("${dependency}", ${moduleFunctions[dependency]}${dependency == mainModule ? ", true" : ""});
  </script>
`;
          }
          file += "</body></html>";
          document.write(
            `<pre>${file
              .replace(/(^|;)\s*\/\/.*\n/gm, (x, start) => {
                if (start == ";") return start + "\n";
                return "";
              })
              .replace(/</g, "&lt;")}</pre>`
          );
        }
      } else if (e.key == "Escape") {
        hideOnFocusLost();
      }
    });

    setInterval(changeTitle);

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
