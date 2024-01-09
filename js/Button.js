// @ts-check

define(async function (req, module, args) {
  const { createElement } = await req("./HTMLUtils");
  const overload = await req("./overload");
  const { typedef, isType } = await req("./typeUtils");

  typedef("Listeners", "{ onclick?: function; onrightclick?: function }");

  let id = 0;

  this.ButtonRef = overload()
    .add(["string", "Listeners"], (name, listeners) => {
      return this.ButtonRef("button", name, listeners);
    })
    .add(["string", "Listeners", "function"], (name, listeners, cb) => {
      const btn = this.ButtonRef("button", name, listeners);
      cb(btn);
      return btn;
    })
    .add(["string", "string", "Listeners"], (type, name, listeners) => {
      /**
       * @type {HTMLElement}
       */
      const btn = createElement(type);
      btn.style.width = "fit-content";
      btn.innerHTML = name;
      if (isType(listeners.onclick, "function"))
        btn.addEventListener("click", () => {
          try {
            listeners.onclick();
          } catch (e) {
            console.error(e);
          }
        });
      if (isType(listeners.onrightclick, "function"))
        btn.addEventListener("contextmenu", (e) => {
          try {
            e.preventDefault();
            listeners.onrightclick();
          } catch (e) {
            console.error(e);
          }
        });
      return btn;
    })
    .add(["string", "string", "Listeners", "function"], (type, name, listeners, cb) => {
      const btn = this.ButtonRef(type, name, onclick);
      cb(btn);
      return btn;
    })
    .compile();

  this.Button = overload()
    .add(["any", "string", "Listeners"], (element, name, listeners) => {
      return element.appendChild(this.ButtonRef("button", name, listeners));
    })
    .add(["any", "string", "Listeners", "function"], (element, name, listeners, cb) => {
      const btn = this.ButtonRef("button", name, listeners, cb);
      element.appendChild(btn);
      return btn;
    })
    .add(["any", "string", "string", "Listeners"], (element, type, name, listeners) => {
      const btn = this.ButtonRef(type, name, listeners);
      element.appendChild(btn);
      return btn;
    })
    .add(["any", "string", "string", "Listeners", "function"], (element, type, name, listeners, cb) => {
      const btn = this.ButtonRef(type, name, listeners, cb);
      element.appendChild(btn);
      return btn;
    })
    .add(["string", "Listeners"], (name, listeners) => {
      return document.body.appendChild(this.ButtonRef("button", name, listeners));
    })
    .add(["string", "Listeners", "function"], (name, listeners, cb) => {
      const btn = this.ButtonRef("button", name, listeners, cb);
      document.body.appendChild(btn);
      return btn;
    })
    .add(["string", "string", "Listeners"], (type, name, listeners) => {
      const btn = this.ButtonRef(type, name, listeners);
      document.body.appendChild(btn);
      return btn;
    })
    .add(["string", "string", "Listeners", "function"], (type, name, listeners, cb) => {
      const btn = this.ButtonRef(type, name, listeners, cb);
      document.body.appendChild(btn);
      return btn;
    })

    .compile();
});
