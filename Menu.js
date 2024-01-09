// @ts-check

define(async function (req, exports, module, args) {
  const overload = await req("./overload");

  this.open = overload()
    .add([], () => {})
    .compile();
});
