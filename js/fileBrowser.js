// @ts-check

define(async function (req, exports, module, args) {
  const { createElement } = await req("./HTMLUtils");
  const { openGUI } = await req("./GUI");
  const { ButtonRef } = await req("./Button");

  addEventListener("DOMContentLoaded", () => {
    let file = location.href.split(defaultBasePath)[1].split("?")[0].slice(1);
    if (file != "index.html") addHistory(url);
    else addHistory(new URL(location.href).searchParams.get("file"));
  });

  window.openActive = false;

  /**
   * @param {string} url
   */
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
    if (window.openActive) dispatchEvent(new KeyboardEvent("keydown", { key: "o", ctrlKey: true }));
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

  let oldTitle = "";
  window.title = document.title;
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
        if (!oldTitle) oldTitle = window.title;
        window.title = masks[currentMask.maskName].title;
        if (!oldFav) oldFav = document.querySelector("link[rel='shortcut icon']").href;
        document.querySelector("link[rel='shortcut icon']").href = masks[currentMask.maskName].icon;
      } else if (document.visibilityState == "visible") {
        if (oldTitle) window.title = oldTitle;
        oldTitle = "";
        if (oldFav) document.querySelector("link[rel='shortcut icon']").href = oldFav;
        oldFav = "";
      }
    }
    document.title =
      window.title +
      // (document.visibilityState == "visible" || currentMask.maskName == "None"
      //   ? " -- " + new Date().toLocaleTimeString()
      //   : "") +
      ((document.visibilityState == "visible" || currentMask.maskName == "None") && window.openActive ? " | File Select" : "");
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

  /**
   * @param {string} file
   */
  function loadFile(file) {
    if (file) {
      addHistory(file);
      location.href = joinPath(currentImportPath, `index.html?file=${encodeURIComponent(file)}`);
    }
  }

  function openFilePicker() {
    /**
     * @param {string} file
     */
    function loadFile1(file) {
      if (file) {
        // if (file == "home") location.href = window.defaultBasePath + "home.html";
        // else {
        loadFile(file);
        // }
        file = "";
        oldInnerHTML = "";
        input.value = "";
        updateSearch();
        updateHistoryDisp();
      }
    }
    window.openActive = true;
    const bg = createElement("div", true);
    bg.id = "fileSelectBg";
    bg.style.position = "fixed";
    bg.style.top = "0px";
    bg.style.left = "0px";
    bg.style.width = "100%";
    bg.style.height = "100%";
    bg.style.background = "#000000bf";
    bg.addEventListener("click", () => {
      closeFilePicker();
      window.openActive = false;
    });
    const form = createElement("form", true);
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
    // const openBugs = form.appendChild(document.createElement("button"));
    // openBugs.innerHTML = "Open Bug Report";
    // openBugs.addEventListener("click", async () => {
    //   // const gui = await openGUI();
    //   // const select = gui.addElement(createElement("select"));

    //   let file = new URL(location.href).searchParams.get("file");
    //   file += ".md";
    //   location.href = location.href.split("/Stuff/")[0] + "/Stuff/bugs/" + file;
    // });
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
        if (elem == null) return;
        elem.onclick = () => {
          loadFile1(value);
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

    input.focus();
    form.onsubmit = (e) => {
      e.preventDefault();
      loadFile1(input.value);
    };
    window.openActive = true;
  }
  window.openFilePicker = openFilePicker;

  function closeFilePicker() {
    document.querySelector("form#fileSelectForm")?.remove();
    document.querySelector("div#fileSelectBg")?.remove();
    window.openActive = false;
  }

  let devOpen = false;

  const password = "ZmpnaA==";

  if (localStorage.getItem("locked") == null) localStorage.setItem("locked", false);
  if (localStorage.getItem("locked") == "true") lock();

  async function lock() {
    // if (localStorage.getItem("locked") == "true") return;
    const gui = await openGUI({
      closeable: false
    });
    localStorage.setItem("locked", "true");
    const background = document.body.appendChild(createElement("div"));
    background.style.background = "black";
    background.style.position = "absolute";
    background.style.left = "0px";
    background.style.top = "0px";
    background.style.width = "100%";
    background.style.height = "100%";
    gui.addElement(createElement("h2", "Enter your password"));
    const input = gui.addElement(createElement("input"));
    input.type = "password";
    input.select();
    gui.addConfirm(
      ButtonRef("button", "Go", {
        onclick() {
          if (btoa(input.value) == password) {
            gui.close();
          }
        }
      })
    );
    await gui.onClose();
    localStorage.setItem("locked", "false");
    background.remove();
  }

  addEventListener("keydown", async (e) => {
    if (e.ctrlKey) {
      if (e.key == "o") {
        e.preventDefault();
        if (!window.openActive) openFilePicker();
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
        loadFile("home");
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
          devOpen = false;
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
    } else if (e.altKey) {
      if (e.key == "l") {
        lock();
      }
    } else if (e.key == "Escape") {
      hideOnFocusLost();
    }
  });

  setInterval(changeTitle);
});
