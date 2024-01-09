// @ts-check

define(async function (req, exports, module, args) {
  const overload = await req("./overload");
  const { createElement } = await req("./HTMLUtils");
  const { ButtonRef } = await req("./Button");

  this.openGUI = async () => {
    return new Promise((resolve) => {
      const dialog = createElement("dialog", true);
      dialog.showModal();
      resolve({
        addElement(elem) {
          if (!(elem instanceof HTMLElement)) throw new Error("Invalid element");
          dialog.appendChild(elem);
          return elem;
        },
        addConfirm(elem) {
          if (!(elem instanceof HTMLElement)) throw new Error("Invalid element");
          dialog.appendChild(elem);
          dialog.addEventListener("keydown", (e) => {
            if (e.key == "Enter") elem.click();
          });
          return elem;
        },
        addCancel(elem) {
          if (typeof elem == "string") {
            elem = ButtonRef("button", elem, {
              onclick() {
                dialog.remove();
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
          dialog.remove();
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
