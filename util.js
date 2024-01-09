define(async (req, exports, module, args) => {
  exports.isString = (arg) => {
    return typeof arg == "string";
  };
});
