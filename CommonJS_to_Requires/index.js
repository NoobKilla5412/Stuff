define(async (req, exports, module) => {
  module.exports = (str) => {
    return `define(async (req, exports, module) => {
  ${toRequires(str).replace(/\n/g, "\n  ")}
});`;
  };
});
