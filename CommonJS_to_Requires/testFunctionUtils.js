define("/CommonJS_to_Requires/testFunctionUtils.js", async (req, exports, module) => {
  const { stringContent } = await req("functionUtils");

  writeLn(
    stringContent(() => {
      writeLn("test");
    })
  );
});
