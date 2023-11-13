// @ts-check

define(async function (req, module, args) {
  const { createElement } = await req("./HTMLUtils");
  const overload = await req("./overload");

  let id = 0;

  this.ButtonRef = overload()
    .add(["string", "Function"], (name, onclick) => {
      return this.ButtonRef("button", name, onclick);
    })
    .add(["string", "Function", "Function"], (name, onclick, cb) => {
      const btn = this.ButtonRef("button", name, onclick);
      cb(btn);
      return btn;
    })
    .add(["string", "string", "Function"], (type, name, onclick) => {
      const btn = createElement(type);
      btn.innerHTML = name;
      btn.addEventListener("click", () => {
        onclick();
      });
      return btn;
    })
    .add(["string", "string", "Function", "Function"], (type, name, onclick, cb) => {
      const btn = this.ButtonRef(type, name, onclick);
      cb(btn);
      return btn;
    })
    .compile();

  this.Button = overload()
    .add(["string", "Function"], (name, onclick) => {
      return document.body.appendChild(this.ButtonRef("button", name, onclick));
    })
    .add(["string", "Function", "Function"], (name, onclick, cb) => {
      const btn = this.ButtonRef("button", name, onclick, cb);
      document.body.appendChild(btn);
      return btn;
    })
    .add(["string", "string", "Function"], (type, name, onclick) => {
      const btn = this.ButtonRef(type, name, onclick);
      document.body.appendChild(btn);
      return btn;
    })
    .add(["string", "string", "Function", "Function"], (type, name, onclick, cb) => {
      const btn = this.ButtonRef(type, name, onclick, cb);
      document.body.appendChild(btn);
      return btn;
    })
    .add(["any", "string", "Function"], (element, name, onclick) => {
      return element.appendChild(this.ButtonRef("button", name, onclick));
    })
    .add(["any", "string", "Function", "Function"], (element, name, onclick, cb) => {
      const btn = this.ButtonRef("button", name, onclick, cb);
      element.appendChild(btn);
      return btn;
    })
    .add(["any", "string", "string", "Function"], (element, type, name, onclick) => {
      const btn = this.ButtonRef(type, name, onclick);
      element.appendChild(btn);
      return btn;
    })
    .add(["any", "string", "string", "Function", "Function"], (element, type, name, onclick, cb) => {
      const btn = this.ButtonRef(type, name, onclick, cb);
      element.appendChild(btn);
      return btn;
    })
    .compile();
});
