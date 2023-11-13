define(async (req, exports, module, args) => {
  const overload = await req("overload.js");
  const { isType, getType, toString, fromString, unionTypeHas, equals, format } = req("typeUtils");

  keepOpen();

  writeObj(toString("({} | string)[]"));

  writeLn(`<pre></pre>`);
});
