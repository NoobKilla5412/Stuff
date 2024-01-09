// @ts-check

define(async function (req, exports, module, args) {
  const data = await (await fetch("./test.js")).text();
  writeLn(data);
});
