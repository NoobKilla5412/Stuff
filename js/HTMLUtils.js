// @ts-check

define(async function (req, module, args) {
  const overload = await req("./overload");

  this.createElement = overload()
    .add(["string", "any"], (type, innerHTML) => {
      const elem = document.createElement(type);
      elem.append(innerHTML);
      return elem;
    })
    .add(["string", "any", "boolean"], (type, innerHTML, append) => {
      const elem = document.createElement(type);
      elem.append(innerHTML);
      if (append) document.body.appendChild(element);
      return elem;
    })
    .add(["string"], (type) => {
      return this.createElement(type, "");
    })
    .add(["string", "boolean"], (type, append) => {
      return this.createElement(type, "", append);
    })
    .add(["string", "string"], (type, innerHTML) => {
      const elem = document.createElement(type);
      elem.innerHTML = innerHTML;
      return elem;
    })
    .add(["string", "string", "boolean"], (type, innerHTML, append) => {
      const element = this.createElement(type, innerHTML);
      if (append) document.body.appendChild(element);
      return element;
    })
    .compile();
});
