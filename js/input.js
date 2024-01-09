// @ts-check

define(async function (req, exports, module, args) {
  const asyncOverload = await req("./asyncOverload");
  const { createElement } = await req("./HTMLUtils");

  this.Input = asyncOverload()
    .add([], async () => {
      const elem = createElement("input");

      return () => {
        return elem.value;
      };
    })
    .compile();
});
