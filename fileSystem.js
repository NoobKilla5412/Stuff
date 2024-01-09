// @ts-check

define(async function (req, exports, module, args) {
  const { createElement } = await req("./js/HTMLUtils");
  const { Button, ButtonRef } = await req("./js/Button");
  const { openGUI } = await req("./js/GUI");
  const { join /* , normalize: normalizePath */ } = await req("./js/path");

  const nav = createElement("div", true);
  const disp = createElement("div", true);

  const files = {
    testFolder: {
      abc: "asdf",
      folder: {
        abc: "asfdgh"
      }
    },
    hi: "erty",
    efwgtrh: "hello"
  };

  /**
   * @param {string} path
   */
  function getFolder(path, folder = files) {
    const pathArr = path.split("/").filter((v) => v);
    if (pathArr.length == 0) return folder;
    let name = pathArr.shift();
    if (pathArr.length == 0) return folder[name];
    return getFolder(pathArr.join("/"), folder[name]);
  }

  /**
   * @param {string} path
   */
  function renderPath(path) {
    nav.innerHTML = "";
    nav.appendChild(
      Button("<", {
        onclick() {
          path = path.split("/").slice(0, -1).join("/");
          if (!path.startsWith("/")) path = "/" + path;
          render(path);
        }
      })
    );
    nav.append(" ");
    const pathArr = path.split("/").filter((v) => v);
    let currentPath = "";
    if (pathArr.length == 0) pathArr.push("");
    for (let i = 0; i < pathArr.length; i++) {
      const element = pathArr[i];
      currentPath += "/" + element;
      let _path = currentPath;
      nav.append(
        Button("span", "/" + element, {
          onclick() {
            render(_path);
          }
        })
      );
    }
  }

  /**
   * @param {string} path
   */
  function render(path) {
    disp.innerHTML = "";
    renderPath(path);
    const folder = getFolder(path);
    for (const name in folder) {
      if (Object.hasOwnProperty.call(folder, name)) {
        const element = folder[name];
        const icon = new Image();
        if (typeof element == "object") icon.src = "folder.png";
        const button = Button("div", name, {
          async onclick() {
            if (typeof element == "object") render(join(path, name));
            else if (typeof element == "string") {
              const gui = await openGUI();
              gui.addElement(createElement("h3", name));
              const input = gui.addElement(createElement("textarea", element));
              gui.addElement(createElement("br"));
              gui.addConfirm(
                ButtonRef("button", "Save", {
                  onclick() {
                    folder[name] = input.value;
                    gui.close();
                  }
                })
              );
              gui.addCancel("Close");
            }
          }
        });
        button.innerHTML = "";
        icon.style.height = "calc(1rem + 2px)";
        icon.style.padding = "2px";
        button.append(icon);
        button.innerHTML += name;
        disp.appendChild(button);
      }
    }
  }

  render("/");
});
