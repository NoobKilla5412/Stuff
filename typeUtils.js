define(async function (req, module) {
  let stack = [];

  function addStack(name) {
    stack.push(name);
    // writeObj(stack);
  }

  function popStack(returnValue) {
    stack.pop();
    // writeObj(stack.concat([returnValue]));
  }

  async function debugCall(func, ...args) {
    return new Promise(async (resolve) => {
      addStack(`${func.name}(${args.map((arg) => JSON.stringify(arg)).join(", ")})`);
      setTimeout(async () => {
        let res = await func(...args);
        popStack(res);
        resolve(res);
      }, 100);
    });
  }
  this.debugCall = debugCall;

  function testInstanceOfArray(test, types) {
    for (let i = 0; i < types.length; i++) {
      const element = types[i];
      if (!isType(test, element)) {
        return false;
      }
    }
    return true;
  }

  function objLength(obj) {
    let i = 0;
    for (const key in obj) {
      i++;
    }
    return i;
  }

  /**
   * @param {string} type
   * @param {string} check
   * @returns {boolean}
   */
  function unionTypeHas(type, check) {
    type = fromString(type);
    check = fromString(check);
    if (type && check) {
      if (isTypeArray(type) && isTypeArray(check)) {
        return check.every((v) => unionTypeHas(v, check));
      } else if (isTypeArray(type)) {
        if (type.includes(check)) return true;
      } else return type == check;
    }
    return false;
  }
  this.unionTypeHas = unionTypeHas;

  let customTypes = new Map();
  const classSymbol = Symbol("class");

  this.customTypes = customTypes;
  function typedef(name, type, isClass = false) {
    if (isClass) {
      customTypes.set(name, { [classSymbol]: type });
    } else customTypes.set(name, typeof type == "function" ? type : fromString(type));
  }
  this.typedef = typedef;

  function evalType(name) {
    if (customTypes.has(name)) return customTypes.get(name);
    else throw new ReferenceError(name + " is not defined.");
  }
  this.evalType = evalType;

  function instanceOf(arg, type, partial = false) {
    type = fromString(type);
    if (!type) throw new TypeError("Argument type is null or undefined at instanceOf");
    if (typeof type == "function" && arg instanceof type) return true;
    if (typeof arg != "object" || arg == null) return false;
    if (!partial) {
      // if (objLength(arg) == objLength(type)) {
      for (const key in type) {
        if (Object.hasOwnProperty.call(type, key)) {
          const element = type[key];
          if (!(Object.hasOwnProperty.call(arg, key) || unionTypeHas(element, "undefined")) || !isType(arg[key], element)) return false;
        }
      }
      // } else return false;
      return true;
    } else {
      for (const key in arg) {
        if (Object.hasOwnProperty.call(arg, key)) {
          const element = arg[key];
          if (!(key in type) || !isType(element, type[key])) return false;
        }
      }
      return true;
    }
  }
  this.instanceOf = instanceOf;

  const primitaves = ["string", "number", "function", "object", "bigint", "boolean", "undefined", "symbol"];

  const indexSignutaureSymbol = Symbol("index");
  function checkIndex(arg, type) {
    if (JSON.stringify(arg) == "{}") {
      popStack();
      return true;
    }
    type = fromString(type);
    // if (!type) throw new TypeError("Argument type is null or undefined at checkIndex");
    if (!type) return true;
    if (!Object.hasOwnProperty.call(type, indexSignutaureSymbol)) return true;
    let [, indexKey, indexValue] = type[indexSignutaureSymbol];

    if (isType(arg, "object")) {
      for (const key in arg) {
        if (Object.hasOwnProperty.call(arg, key)) {
          const element = arg[key];
          if (!isType(key, indexKey) || !isType(element, indexValue)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * @param type a string of a primitave type or a class or an object with an index signature of `[key: string]: typeof test`.
   *             The values of the object have the same type as `type`.
   */
  function isType(arg, type, partial = false) {
    // if (!type) throw new TypeError("Argument type is null or undefined at isType");

    type = fromString(type);

    if (type == "null" && arg === null) return true;
    else if (type == "null") return false;

    if (type == "any") return true;

    if (!checkIndex(arg, type)) return false;

    if (typeof type === "string" && (/^\d+$/.test(type) || /^".*"$/.test(type))) return arg === eval(type);

    if (typeof type == "string" && primitaves.includes(type)) {
      return typeof arg === type;
    } else if (customTypes.has(type)) {
      const _type = evalType(type);
      if (typeof _type == "object" && classSymbol in _type) {
        return arg instanceof _type[classSymbol];
      }
      if (typeof _type == "function") {
        return _type(arg);
      } else {
        let res = isType(arg, _type);
        return res;
      }
    } else if (typeof type == "function") {
      return arg instanceof type;
    } else if (isTypeArray(type)) {
      if (type.length == 2 && type[0] == "Array") {
        return isTypeArray(arg, type[1]);
      } else if (type.length == 2 && type[0] == "Tuple") {
        if (arg.length == type[1].length) {
          for (let i = 0; i < arg.length; i++) {
            const element = arg[i];
            if (!isType(element, type[1][i])) return false;
          }
        } else return false;
        return true;
      } else if (type.length == 2 && type[0] == "Partial") {
        return isType(arg, type[1], true);
      }
      for (const _type of type) {
        if (isType(arg, _type)) return true;
      }
      return false;
    } else if (isObj(type)) {
      return instanceOf(arg, type, partial);
    } else {
      return isType(arg, eval(type), partial);
    }
    // else if (isTypeArray(type, ["function", "string"])) {
    //   for (const currentType of type) {
    //     if (isType(currentType, ["function", "string"])) {
    //       if (isType(arg, currentType)) return true;
    //       else return false;
    //     }
    //   }
    //   return false;
    // } else if (isTypeArray(type)) {
    //   return testInstanceOfArray(arg, type);
    // } else if (typeof type == "object") {
    //   return typeObj(arg, type);
    // }
    throw new TypeError("isType");
  }
  this.isType = isType;

  function isObj(arg) {
    return typeof arg == "object";
  }

  function typeOf(arg) {
    if (typeof arg == "undefined") return "undefined";
    if (isObj(arg)) return arg.constructor.name == "Object" ? "object" : arg.constructor.name;
    return typeof arg;
  }
  this.typeOf = typeOf;

  function checkType(data, type) {
    if (!type) type = getType(data);
    if (isType(type, "string")) type = fromString(type);
    if (!isType(data, type)) {
      throw new Error(`Type "${toString(getType(data))}" is not assignable to type "${toString(type)}".`);
    }
    if (isArray(type)) {
      let push = data.push.bind(data);
      data.push = (...items) => {
        for (const item of items) {
          checkType(item, type[1]);
        }
        push(...items);
      };
    }
    return data;
  }
  this.checkType = checkType;

  function assignType(type, data) {
    type = fromString(type);
    if (!type) throw new TypeError("Argument type is null or undefined at assignType");
    if (data) {
      checkType(data, type);
    }
    if (isArray(type)) {
      let push = data.push;
      data.push = (...items) => {
        for (const item of items) {
          checkType(item, type[1]);
        }
        push(...items);
      };
    }
    return {
      get value() {
        return data;
      },
      get type() {
        return toString(type);
      },
      set set(value) {
        checkType(value, type);
        data = value;
      }
    };
  }
  this.assignType = assignType;

  function isArray(type) {
    type = fromString(type);
    if (!type) throw new TypeError("Argument type is null or undefined at isArray");
    if (isTypeArray(type)) return type[0] == "Array";
  }

  function equVal(obj, other) {
    if (isObj(obj) && isObj(other)) {
      if (objLength(obj) == objLength(other)) {
        for (const key in obj) {
          if (Object.hasOwnProperty.call(obj, key)) {
            const element = obj[key];
            const otherElement = other[key];
            if (!equVal(element, otherElement)) return false;
          }
        }
      } else return false;
      return true;
    } else {
      return obj === other;
    }
  }

  function includes(array, arg) {
    if (isTypeArray(array)) {
      for (const item of array) {
        if (equVal(item, arg)) return true;
      }
    }
    return false;
  }

  function equals(type, otherType) {
    return toString(fromString(toString(type))) == toString(fromString(toString(otherType)));
  }
  this.equals = equals;

  function format(type) {
    return toString(fromString(type));
  }
  this.format = format;

  const definedTypes = ["Partial", "Array", "Tuple"];

  function getType(arg, getExactType = false) {
    let res;
    if (arg == undefined) {
      return "undefined";
    }
    if (Array.isArray(arg)) {
      if (!getExactType) {
        res = ["Array"];
        let type = [];
        for (const item of arg) {
          if (!includes(type, getType(item))) type.push(getType(item));
        }
        res.push(type);
      } else {
        res = ["Tuple"];
        let type = [];
        for (const item of arg) {
          type.push(getType(item));
        }
        res.push(type);
      }
    } else if (((a) => a && typeof arg == "object" && a != "Object")(arg.constructor?.name)) {
      return arg.constructor?.name;
    } else if (isObj(arg)) {
      res = {};
      if (typeOf(arg)[0].toUpperCase() == typeOf(arg)[0]) {
        res = eval(typeOf(arg));
        return res;
      }
      for (const key in arg) {
        if (Object.hasOwnProperty.call(arg, key)) {
          const element = arg[key];
          res[key] = getType(element);
        }
      }
    } else if (typeof arg == "function") {
      return arg.name || "function";
    } else return typeOf(arg);
    return res;
  }
  this.getType = getType;

  function hasCustomTypesValue(value) {
    for (const [key, value1] of customTypes) {
      let value1_ = toString(value1, undefined, false, false);
      let value_ = toString(value, undefined, false, false);
      if (value1_ === value_) return key;
    }
    return undefined;
  }

  /**
   * @returns {string}
   */
  function toString(type, hasParen = false, format = true, doReverseEval = true) {
    if (!type) {
      return type;
      throw new TypeError("Argument type is null or undefined at toString");
    }
    if (typeof type == "string" && format && false) return toString(fromString(type), undefined, false, doReverseEval);
    else if (typeof type == "string") return type;
    if (Array.isArray(type)) {
      if (type[0] == "Array") {
        return `${toString(type[1], true, undefined, doReverseEval)}[]`;
      } else if (type[0] == "Tuple") {
        return `[${type[1].map((v) => toString(v, undefined, undefined, doReverseEval)).join(", ")}]`;
      } else if (isType(type[0], "string") && type[0][0].toUpperCase() == type[0][0]) {
        return `${type[0]}<${toString(type[1], undefined, undefined, doReverseEval)}>`;
      } else {
        return `${hasParen && type.length > 1 ? "(" : ""}${type.map((t) => toString(t, undefined, undefined, doReverseEval)).join(" | ")}${
          hasParen && type.length > 1 ? ")" : ""
        }`;
      }
    } else if (isObj(type)) {
      let res = "{";
      if (indexSignutaureSymbol in type) {
        let [indexName, indexKey, indexValue] = type[indexSignutaureSymbol];
        res += `  [${indexName}: ${indexKey}]: ${indexValue};\n`;
      }
      for (const key in type) {
        if (Object.hasOwnProperty.call(type, key)) {
          const element = type[key];
          let quotes = /[\W\s]/.test(key) ? '"' : "";
          res += `\n  ${quotes}${key}${quotes}: ${toString(element, undefined, undefined, doReverseEval).replace(/\n/g, "\n  ")};`;
        }
      }

      let res1 = (res + (res != "{" ? "\n" : "") + "}").replace(/: ([^;]*)/g, (x, type) => {
        if (!type) {
          return x;
          throw new TypeError("Argument type is null or undefined at res1.replace");
        }
        type = fromString(type);
        if (!Array.isArray(type)) type = [type];
        if (unionTypeHas(type, "undefined")) {
          type.splice(type.indexOf("undefined"), 1);
          return `?: ${toString(type, undefined, undefined, doReverseEval)}`;
        } else return x;
      });
      // if (doReverseEval) {
      //   let val = hasCustomTypesValue(res1);
      //   if (val) return val;
      // }
      return res1;
      // return `{ ${res}${JSON.stringify(type, undefined, 2)
      //   .replace(/"/g, "")
      //   .replace(/: (.*)/g, (x, type) => {
      //     type = fromString(type);
      //     if (unionTypeHas(type, "undefined")) {
      //       type.splice(type.indexOf("undefined"), 1);
      //       return `?: ${toString(type)}`;
      //     } else return x;
      //   })
      //   .replace(/,/g, ";")
      //   .replace(/(\w)(\n*\s*)}/g, (x, data, otherData) => {
      //     if (data) {
      //       return `${data};${otherData}}`;
      //     }
      //   })
      //   .slice(1)}`;
    } else if (typeof type == "function" && type) {
      return "function";
    } else {
      return type;
    }
  }
  this.toString = toString;

  function fromString(typeString) {
    if (typeof typeString != "string") return typeString;
    if (primitaves.concat(["any"]).includes(typeString)) return typeString;
    // if (customTypes.has(typeString)) return fromString(evalType(typeString));
    let pos = 0;
    let res = [];
    /** @type {number} */
    let len = typeString.length;

    function consumeWhitespace() {
      while (/[ \n]/.test(typeString[pos])) pos++;
    }

    consumeWhitespace();

    while (pos < len) {
      let element = typeString[pos];
      if (element == '"') {
        let value = "";
        pos++;
        while (typeString[pos] != '"' && pos < len) {
          if (typeString[pos] == "\\") {
            value += "\\" + typeString[++pos];
            pos++;
          } else value += typeString[pos++];
        }
        if (typeString[pos] != '"') throw new SyntaxError("'\"' expected at pos " + pos);
        pos++;
        res.push(`"${value}"`);
      }
      if (element == "<") {
        let value = "";
        let parenCount = 1;
        pos++;
        while (parenCount > 0 && pos < len) {
          value += typeString[pos];
          pos++;
          if (typeString[pos] == "<") parenCount++;
          if (typeString[pos] == ">") parenCount--;
        }
        let val = fromString(value);
        val = Array.isArray(val) ? val : [val];
        res.push([res.pop(), val]);
      } else if (element == "(") {
        let value = "";
        let parenCount = 1;
        pos++;
        while (parenCount > 0 && pos < len) {
          value += typeString[pos];
          pos++;
          if (typeString[pos] == "(") parenCount++;
          if (typeString[pos] == ")") parenCount--;
        }
        pos++;
        res.push(fromString(value));
        continue;
      } else if (element == "{") {
        pos++;
        consumeWhitespace();
        let stuff = {};
        let parenCount = 1;
        let value = "";
        while (parenCount > 0 && pos < len) {
          value += typeString[pos];
          // writeObj(value);
          pos++;
          consumeWhitespace();
          if (typeString[pos] == "{") parenCount++;
          if (typeString[pos] == "}") parenCount--;
        }
        // writeLn(value.slice(0, 25));
        if (value.endsWith("}")) value = value.slice(0, -1);
        {
          let typeString = value;
          let pos = 0;
          let len = typeString.length;
          let parenCount = 1;

          let consumeWhitespace = () => {
            while (/[ \n]/.test(typeString[pos]) && pos < len) pos++;
          };

          while (parenCount > 0 && pos < len) {
            if (typeString[pos] == "[") {
              let indexKey = "";
              let indexValue = "";
              let indexName = "";
              pos++;
              consumeWhitespace();
              while (typeString[pos] != ":" && pos < len) indexName += typeString[pos++];
              consumeWhitespace();
              pos++;
              consumeWhitespace();
              while (typeString[pos] != "]" && pos < len) indexKey += typeString[pos++];
              for (let i = 0; i < 2; i++) {
                consumeWhitespace();
                pos++;
                consumeWhitespace();
              }
              while (typeString[pos] != ";" && typeString[pos] != "}" && pos < len) indexValue += typeString[pos++];
              // Object.defineProperty(stuff, indexSignutaureSymbol, {
              //   enumerable: true,
              //   value: [indexName, indexKey, indexValue]
              // });
              stuff[indexSignutaureSymbol] = [indexName, indexKey, indexValue];
              pos++;
              consumeWhitespace();
            } else {
              let key = "";
              let value = "";
              while (typeString[pos] != ":" && pos < len) {
                key += typeString[pos++];
              }
              consumeWhitespace();
              pos++;
              consumeWhitespace();
              {
                let parenCount = 1;
                const getDone = () => {
                  if (parenCount > 1) return true;
                  return typeString[pos] != ";";
                };
                while (getDone() && parenCount > 0 && pos < len) {
                  if (typeString[pos] == "{") parenCount++;
                  if (typeString[pos] == "}") parenCount--;
                  value += typeString[pos];
                  pos++;
                }
              }
              // writeObj(value);
              // writeObj(typeString);
              if (key.endsWith("?")) {
                value += "|undefined";
                key = key.slice(0, -1);
              }
              if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
              stuff[key] = fromString(value);
              // writeObj(stuff[key]);
              if (typeString[pos] == ";") pos++;
              consumeWhitespace();
              consumeWhitespace();
            }
          }
        }
        consumeWhitespace();
        // writeObj(typeString.slice(pos - 25));
        // writeObj(stack);
        // if (typeString[pos] != "}") throw new SyntaxError(`Expected "}" at position ${pos}`);
        if (stuff) res.push(stuff);
        pos++;
        continue;
      } else if (element == "[") {
        if (typeString[pos + 1] == "]") {
          let types = res.pop();
          types = Array.isArray(types) ? types : [types];
          for (let i = 0; i < types.length; i++) {
            const element = types[i];
            types[i] = fromString(element);
          }
          res.push(["Array", types]);
          pos += 2;
          continue;
        } else {
          pos++;
          consumeWhitespace();
          let tmp = ["Tuple"];
          let types = [];

          let parenCount = 1;
          let value = "";
          while (parenCount > 0 && pos < len) {
            if (typeString[pos] == "[") parenCount++;
            if (typeString[pos] == "]") parenCount--;
            value += typeString[pos];
            pos++;
            consumeWhitespace();
          }
          {
            let pos = 0;
            let parenCount = 1;
            let str = value;
            let len = str.length;

            const consumeWhitespace = () => {
              while (/[ \n]/.test(str[pos]) && pos < len) pos++;
            };

            while (parenCount > 0 && pos < len) {
              let value = "";
              consumeWhitespace();
              {
                let parenCount = 1;
                while (str[pos] != "," && parenCount > 0 && pos < len) {
                  value += str[pos];
                  pos++;
                  if (str[pos] == "[") parenCount++;
                  if (str[pos] == "]") parenCount--;
                }
              }
              // writeObj(value);
              pos++;
              types.push(fromString(value));
              if (str[pos] == "]") parenCount--;
              if (str[pos] == "[") parenCount++;
            }
          }
          pos--;
          if (typeString[pos] != "]") throw new SyntaxError('Expected "]" at position ' + pos);
          tmp.push(types);
          res.push(tmp);
          pos++;
          continue;
        }
      } else if (element == "|") {
        pos++;
        let tmp = [res.shift()];
        // consumeWhitespace();
        let rest = typeString.slice(pos);
        let newElement = fromString(rest);
        newElement = Array.isArray(newElement) && !isArray(newElement) ? newElement : [newElement];
        tmp.push(...newElement);
        pos += rest.length;
        res.push(tmp);
        continue;
      } else if (/[A-Z0-9]/i.test(element)) {
        let stuff = "";
        while (/[A-Z0-9]/i.test(typeString[pos]) && pos < len) {
          stuff += typeString[pos++];
        }
        res.push(stuff);
        continue;
      } /* else if (element == "<") {
        let stuff = "";
        pos++;
        while (typeString[pos] != ">") {
          stuff += typeString[pos++];
        }
        res.push(fromString(stuff));
        pos++;
        continue;
      }  */
      pos++;
    }

    if (Array.isArray(res) && res.length == 1) return res[0];

    return res;

    // if (typeof typeString != "string") return typeString;
    // typeString = typeString.replace(/\n*\s*/g, "").trim();
    // let res;
    // if (!typeString.startsWith("{") && !typeString.endsWith("}")) {
    //   let types = typeString.split(/\s*\|\s*/);
    //   if (types.length > 1) {
    //     return types.map((t) => fromString(t));
    //   }
    // }
    // if (typeString.endsWith("[]")) {
    //   let arrayType = fromString(typeString.slice(0, -2));
    //   return [
    //     "array",
    //     Array.isArray(arrayType) && !["tuple", "array"].includes(arrayType[0])
    //       ? arrayType
    //       : [arrayType]
    //   ];
    // } else if (typeString.startsWith("(") && typeString.endsWith(")")) {
    //   let types = typeString.slice(1, -1).split(/\s*\|\s*/);
    //   return types.map((t) => fromString(t));
    // } else if (typeString.startsWith("[") && typeString.endsWith("]")) {
    //   let types = typeString.slice(1, -1).split(/\s*,\s*/);
    //   return ["tuple", types];
    // } else if (typeString.startsWith("{") && typeString.endsWith("}")) {
    //   typeString = typeString
    //     .replace(/;/g, ",")
    //     .replace(/(\?|):\s*([^,}]*)/g, (x, optional, data) => {
    //       if (optional == "?") data += " | undefined";
    //       return `: "${data}"`;
    //     })
    //     .replace(/\n?\s*({|,)([^ ",]*):/g, '$1"$2": ')
    //     .replace(/,}/g, "}");
    //   let res = JSON.parse(typeString);
    //   for (const key in res) {
    //     if (Object.hasOwnProperty.call(res, key)) {
    //       const element = res[key];
    //       res[key] = fromString(element);
    //     }
    //   }
    //   return res;
    // } else if (typeString.startsWith("Partial")) {
    //   let types = fromString(typeString.slice("Partial".length + 1, typeString.indexOf(">")));
    //   return [
    //     "partial",
    //     Array.isArray(types) && !["tuple", "array"].includes(types[0]) ? types : [types]
    //   ];
    // } else {
    //   return typeString;
    // }
    // return res;
  }
  this.fromString = fromString;

  /**
   * @param {any} array
   * @param {any=} type
   * @returns {array is any[]}
   */
  function isTypeArray(array, type = "any") {
    if (Array.isArray(array)) {
      return array.every((v) => isType(v, type));
    }
    return false;
  }
  this.isTypeArray = isTypeArray;
  typedef("int", (arg) => isType(arg, "number") && arg % 1 === 0);
});
