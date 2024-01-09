define(async (req, _exports, module) => {
  const { isType, assignType, isTypeArray, unionTypeHas, getType, toString } = await req("./typeUtils");

  var exports = (module.exports = overload);

  /**
   * @template Return
   * @param {any[]} args
   */
  function _overload(args) {
    let _args = args;
    let cb_s = [];
    function getArgTypeLength(args) {
      let maxLen = args.length;
      let minLen = 0;
      for (let i = 0; i < args.length; i++) {
        const element = args[i];
        if (!unionTypeHas(element, "undefined")) minLen++;
        // len++;
      }
      let res = [minLen, maxLen];
      return res;
    }
    function getArgLength(args) {
      // let len = 0;
      // for (let i = 0; i < args.length; i++) {
      //   const element = args[i];
      //   if (typeof element != "undefined") len++;
      // }
      // return len;
      return args.length;
    }
    let len = getArgLength(args);
    let /** @type {() => Return} */ _cb = () => {
        let argTypes = [];
        for (let i = 0; i < args.length; i++) {
          const element = args[i];
          argTypes.push(getType(element));
        }
        throw new TypeError(
          `No overload matches this call (${argTypes
            .map((v) => {
              return toString(v);
            })
            .join(", ")})
Possible overloads are:
${cb_s
  .map(
    (v) =>
      `(${v
        .map((v) => {
          return toString(v);
        })
        .join(", ")})`
  )
  .join("\n")}`
        );
      };

    return {
      [Symbol.toStringTag]: "OverloadData",
      /**
       * @template T
       * @param {T[]} args
       * @param {() => Return} cb
       * @returns {typeof this}
       */
      add(args, cb) {
        if (!Array.isArray(args)) args = [args];
        cb_s.push(args);
        let [minLen, maxLen] = getArgTypeLength(args);
        let matches = true;
        if (len >= minLen && len <= maxLen) {
          // writeObj([len, [minLen, maxLen]]);
          for (let i = 0; i < args.length; i++) {
            const element = args[i];
            if (!isType(_args[i], element)) {
              matches = false;
              break;
            }
          }
        } else matches = false;
        if (matches) _cb = cb;
        return this;
      },
      run() {
        return _cb(...args);
      }
    };
  }

  function overload(args) {
    return _overload(arguments)
      .add(["any"], () => {
        return _overload(args);
      })
      .add(["any", "string", "function"], (args, typeArg, data) => {
        return overload(args, [typeArg], data);
      })
      .add(["any", "string[]", "function"], (args, typeArgs, data) => {
        return _overload(args).add(typeArgs, data).run();
      })
      .add(["any", `[any, function][]`], (args, addCalls) => {
        const overload = _overload(args);
        for (let i = 0; i < addCalls.length; i++) {
          const element = addCalls[i];
          if (element.length == 2) overload.add(element[0], element[1]);
        }
        return overload.run();
      })
      .add([], () => {
        /**
         * @type {[any[], Function][]}
         */
        let overloads = [];

        return {
          add(args, cb) {
            if (!Array.isArray(args)) args = [args];
            overloads.push([args, cb]);
            return this;
          },
          /**
           * @param {any=} thisArg
           */
          compile(thisArg) {
            if (thisArg) overloads = overloads.map((v) => [v[0], v[1].bind(thisArg)]);
            let res = function () {
              return overload(arguments, overloads);
            };
            if (thisArg) res = res.bind(thisArg);
            return res;
          }
        };
      })
      .run();
  }
});
