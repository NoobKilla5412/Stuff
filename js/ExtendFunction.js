// @ts-check

define(async function (req, exports, module, args) {
  this.ExtendFunction = class ExtendFunction extends Function {
    constructor() {
      super("...args", "return this.__self__.__call__(...args)");
      var self = this.bind(this);
      this.__self__ = self;
      return self;
    }

    __call__(...args) {}
  };
});
