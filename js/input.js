define(async (req, exports, module, args) => {
  "use strict";
  const overload = await req("./overload");
  const { typedef, assignType, isType } = await req("./typeUtils");

  module.exports = overload()
    .add("HTMLElement", () => {})
    .compile();
});
