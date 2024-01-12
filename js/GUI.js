// @ts-check

define(async function (req, exports, module, args) {
  const overload = await req("./overload");
  const { createElement } = await req("./HTMLUtils");
  const { ButtonRef } = await req("./Button");

  /**
   * @typedef Options
   * @prop {boolean} closeable
   */

  const defaultOptions = {
    closeable: true
  };

  let GUIOpen = false;

  /**
   * @param {Partial<Options>} _options
   */
  this.openGUI = async (_options) => {
    /** @type {Options} */
    let options = Object.assign({}, defaultOptions, _options);
    return new Promise((resolve) => {
      if (GUIOpen) {
        while (GUIOpen);
      }
      const dialog = createElement("dialog", true);
      dialog.showModal();
      GUIOpen = true;
      addEventListener("keydown", (e) => {
        if (e.key == "Escape" && !options.closeable) {
          e.preventDefault();
        }
      });
      let isOpen = true;

      function close() {
        dialog.remove();
        isOpen = false;
      }

      const interval = setInterval(() => {
        if (!isOpen) {
          clearInterval(interval);
          GUIOpen = false;
        }
      }, 100);

      resolve({
        addElement(elem) {
          if (!(elem instanceof HTMLElement)) throw new Error("Invalid element");
          dialog.appendChild(elem);
          return elem;
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
          return new Promise((resolve) => {
            const interval = setInterval(() => {
              if (!isOpen) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
          });
        },
        get element() {
          return dialog;
        }
      });
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
});
