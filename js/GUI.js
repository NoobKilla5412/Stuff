// @ts-check

define(async function (req, exports, module, args) {
  //const overload = await req("./overload");
  const { createElement } = await req("./HTMLUtils");
  const { ButtonRef } = await req("./Button");

  /**
   * @typedef Options
   * @prop {boolean} closeable
   * @prop {boolean} override
   */

  const defaultOptions = {
    closeable: true,
    override: false
  };

  let GUIOpen = false;

  let currentGUI = null;

  /**
   * @param {Partial<Options>=} _options
   */
  this.openGUI = async (_options) => {
    /** @type {Options} */
    let options = Object.assign({}, defaultOptions, _options);
    return new Promise((resolve, reject) => {
      if (GUIOpen && !options.override) {
        reject("Another GUI is already open");
        return;
      }
      if (options.override) currentGUI?.close();
      const dialog = createElement("dialog", true);
      dialog.showModal();
      GUIOpen = true;
      addEventListener("keydown", (e) => {
        if (e.key == "Escape") {
          e.preventDefault();
          if (options.closeable) close();
        }
      });
      let isOpen = true;

      function close() {
        dialog.remove();
        isOpen = false;
        currentGUI = null;
      }

      const interval = setInterval(() => {
        if (!isOpen) {
          clearInterval(interval);
          GUIOpen = false;
        }
      }, 100);

      let res = {
        addElement(elem) {
          if (!(elem instanceof HTMLElement)) throw new Error("Invalid element");
          dialog.appendChild(elem);
          return elem;
        },
        br() {
          res.addElement(createElement("br"));
        },
        addConfirm(elem, _options) {
          const defaultOptions = {
            close: false
          };
          const options = Object.assign({}, defaultOptions, _options);
          if (!(elem instanceof HTMLElement)) throw new Error("Invalid element");
          dialog.appendChild(elem);
          dialog.addEventListener("keydown", (e) => {
            if (e.key == "Enter" && !(document.activeElement instanceof HTMLTextAreaElement)) {
              elem.click();
              if (options.close) close();
            }
          });
          return elem;
        },
        addCancel(elem) {
          if (!options.closeable) throw new Error("Adding a close element to a non-closeable GUI");
          if (typeof elem == "string") {
            elem = ButtonRef("button", elem, {
              onclick() {
                close();
              }
            });
          }
          if (!(elem instanceof HTMLElement)) throw new Error("Invalid element");
          dialog.appendChild(elem);
          dialog.addEventListener("keydown", (e) => {
            if (e.key == "Escape") elem.click();
          });
          return elem;
        },
        close() {
          close();
        },
        async onClose() {
          return /** @type {Promise<void>} */ (
            new Promise((resolve) => {
              const interval = setInterval(() => {
                if (!isOpen) {
                  clearInterval(interval);
                  resolve();
                }
              }, 100);
            })
          );
        },
        get element() {
          return dialog;
        }
      };

      currentGUI = res;

      resolve(res);
    });
  };

  this.prompt = async (message, _default) => {
    return new Promise(async (resolve) => {
      const gui = await this.openGUI();
      if (message) gui.addElement(createElement("h2", message));
      const input = gui.addElement(createElement("input"));
      if (_default) input.value = _default;
      input.select();
      gui.addElement(createElement("br"));
      gui.addCancel("Cancel");
      gui.addConfirm(
        ButtonRef("button", "OK", {
          onclick() {
            resolve(input.value);
            gui.close();
          }
        })
      );
    });
  };

  /**
   * @param {(string | { innerHTML: string; value: string })[]} items
   */
  this.menu = async (items) => {
    return new Promise(async (resolve) => {
      const gui = await this.openGUI();
      const select = gui.addElement(createElement("select"));
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (typeof item == "string") {
          select.appendChild(createElement("option", item));
        } else {
          const elem = select.appendChild(createElement("option", item.innerHTML));
          elem.value = item.value;
        }
      }
      gui.addElement(createElement("br"));
      gui.addConfirm(
        ButtonRef("button", "OK", {
          onclick() {
            resolve(select.value);
            gui.close();
          }
        })
      );
      gui.addCancel("Cancel");
    });
  };
});
