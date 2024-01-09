// @ts-check

define(async function (req, exports, module, args) {
  const { ExtendFunction } = await req("./ExtendFucntion");

  /**
   * @param {Function} fn
   */
  function extractFunction(fn) {
    let str = fn.toString();
    str = str.substring(str.indexOf("{") + 1, str.lastIndexOf("}")).trim();
    return str;
  }

  this.DynamicFunction = class DynamicFunction extends ExtendFunction {
    /**
     * @type {Function}
     */
    code = () => {};

    get codeString() {
      return extractFunction(this.code);
    }

    __call__() {
      return this.code();
    }

    run() {
      this();
      return this;
    }

    /**
     * @param {Function} code
     */
    addCode(code) {
      let str = extractFunction(code);
      let originalCode = extractFunction(this.code);
      this.code = new Function(originalCode + str);

      return this;
    }

    /**
     * @param {Function} code
     */
    addCodeFront(code) {
      let str = extractFunction(code);
      let originalCode = extractFunction(this.code);
      this.code = new Function(str + originalCode);

      return this;
    }
  };
});
