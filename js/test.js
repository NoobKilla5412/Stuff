define(async (req, exports, module, args) => {
  const { test, font } = await req("font");
  //const overload = await req("overload.js");
  //const { isType, getType, toString, fromString, unionTypeHas, equals } = req("./typeUtils");

  //writeObj(toString(fromString("({} | string)[]")));
  test();
  //writeLn(font("hello, can you read this?"));
});
