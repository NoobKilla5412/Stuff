define("/js/customLanguage.js", async (req, exports, module, args) => {
  const overload = await req("/js/overload.js");
  const { typedef, fromString, assignType, isType, evalType } = await req("typeUtils");

  /** @typedef {{ type: string; value: string | Command[]; }} Command */
  typedef("Command", `{ type: string; value: string | Command[]; }`);
  // typedef("Var", `{ [name: string]: { type: string; value: string } }`);

  // writeObj(isType({}, "Var"));

  /**
   * @param {string} str
   * @returns {Command[]}
   */
  function lexer(str) {
    const validCharacters = /[a-zA-Z_]/;
    const validNumbers = /[0-9]/;
    const validKeywords = ["var", "print"];
    const validOperators = ["+", "="];

    if (str == undefined) return [];

    return overload([str], ["string"], () => {
      let res = assignType(`Command[]`, []);
      let pos = 0;
      let len = str.length;

      function consumeWhitespace() {
        while (/[ \n]/.test(str[pos]) && pos < len) pos++;
      }

      consumeWhitespace();

      while (pos < len) {
        consumeWhitespace();
        let element = str[pos];

        if (element == ";") {
          res.value.push({
            type: "end",
            value: ";"
          });
        }

        if (element == "/" && str[pos + 1] == "/") {
          while (!";\n".includes(str[pos]) && pos < len) pos++;
        } else if (validCharacters.test(element)) {
          let keyword = "";
          while (validCharacters.test(str[pos]) && pos < len) keyword += str[pos++];
          // if (validKeywords.includes(keyword)) {
          res.value.push({
            type: "keyword",
            value: keyword
          });
          // }
        } else if (element == '"') {
          let value = "";
          pos++;
          while (str[pos] != '"' && pos < len) {
            if (str[pos] == "\\") pos++;
            value += str[pos++];
          }
          if (str[pos] != '"') throw new SyntaxError("'\"' expected at pos " + pos);
          pos++;
          // if (str[pos] != ";") throw new SyntaxError('";" expected at pos ' + pos);
          value ||= "";
          res.value.push({
            type: "string",
            value
          });
        } else if (validNumbers.test(element)) {
          let num = "";
          while (validNumbers.test(str[pos]) && pos < len) num += str[pos++];
          res.value.push({
            type: "number",
            value: num
          });
          // writeObj(str.slice(pos--));
        } else if (validOperators.includes(element)) {
          let op = "";
          while (validOperators.includes(str[pos]) && pos < len) op += str[pos++];
          res.value.push({
            type: "operator",
            value: op
          });
        } else if (element == "(") {
          let value = "";
          let parenCount = 1;
          pos++;
          while (parenCount > 0 && pos < len) {
            value += str[pos];
            pos++;
            if (str[pos] == "(") parenCount++;
            if (str[pos] == ")") parenCount--;
          }
          if (str[pos] != ")") throw new SyntaxError('")" expected at pos ' + pos);
          res.value.push({
            type: "group",
            value
          });
        } else if (element == "{") {
          let value = "";
          let parenCount = 1;
          pos++;
          while (parenCount > 0 && pos < len) {
            value += str[pos];
            pos++;
            if (str[pos] == "{") parenCount++;
            if (str[pos] == "}") parenCount--;
          }
          if (str[pos] != "}") throw new SyntaxError('"}" expected at pos ' + pos);
          res.value.push({
            type: "block",
            value: lexer(value)
          });
        }

        // writeObj(str.slice(pos));
        else pos++;
        consumeWhitespace();
      }

      // writeObj(res.value);
      return res.value;
    });
  }

  function evaluate(str) {
    return overload([str])
      .add("string", () => {
        let a = lexer(str);
        let res = [];
        let pos = 0;
        let len = a.length;

        while (pos < len) {
          if (a[pos].type == "string") {
            res.push(`"${a[pos].value}"`);
          } else if (a[pos].type == "operator") {
            if (a[pos].value == "+") {
              let one = lexer(res.pop())[0];
              let two = a[++pos];
              if (one.type == "string" && two.type == "string") {
                res.push(one.value + two.value);
              } else if (one.type == "number" && two.type == "number") {
                res.push(+one.value + +two.value);
              } else {
                throw new TypeError(`Type "${one.type}" is not assignable to type "${two.type}"`);
              }
            }
          }

          pos++;
        }

        return res.join("");
      })
      .add("Command", (command) => {
        if (command.type == "string") return `"${command.value}"`;
        else return command.value;
      })
      .run();
  }

  /**
   * @param {string} str
   */
  function parse(str, secondVars) {
    return overload([str, secondVars])
      .add(["string", "undefined"], () => {
        let commands = lexer(str);
        writeObj(commands);
        return parse(commands);
      })
      .add(["Command[]", "undefined"], () => {
        return parse(str, {});
      })
      .add(["Command[]", "any"], (commands, secondVars) => {
        let vars = {};
        if (secondVars) {
          for (const key in secondVars) {
            if (Object.hasOwnProperty.call(secondVars, key)) {
              const value = secondVars[key];
              if (!(key in vars)) vars[key] = value;
            }
          }
        }
        let res = "";
        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];
          if (command.type == "keyword") {
            if (command.value == "var") {
              if (
                commands.length <= i + 2 ||
                commands[i + 1].type != "keyword" ||
                commands[i + 2].type != "keyword"
              ) {
                throw new Error("Expected type and name");
              }
              let type = commands[++i].value;
              let name = commands[++i].value;
              let value = undefined;
              let hasValue =
                commands.length >= i + 1 &&
                commands[i + 1].type == "operator" &&
                commands[i + 1].value == "=";
              if (hasValue) {
                i++;
                if (commands[++i].type != type && type != "auto")
                  throw new TypeError(
                    `Type "${commands[i].type}" is not assignable to type "${type}"`
                  );
                value = commands[i].value;
              }
              vars[name] = { type: type == "auto" ? commands[i].type : type, value };
            } else if (command.value == "print") {
              if (
                commands.length <= i + 1 ||
                !["string", "keyword"].includes(commands[i + 1].type)
              ) {
                throw new Error("Expected String or variable reference");
              }
              i++;
              let value = commands[i].value;
              if (commands[i].type == "keyword") {
                if (!(value in vars)) throw new ReferenceError(`Variable ${value} is not defined`);
                ({ value } = vars[value]);
              }
              res += value + "\n";
            } else if (command.value == "for") {
              if (
                commands.length <= i + 2 ||
                commands[i + 1].type != "group" ||
                commands[i + 2].type != "block"
              ) {
                throw new SyntaxError("Expected Group, Block");
              }
              i++;
              let count = +commands[i].value;
              let block = commands[i + 1].value;
              for (let _i = 0; _i < count; _i++) {
                res += parse(block, vars);
              }
            }
          }
          if (
            commands[i + 1] &&
            commands[i + 1].type == "operator" &&
            commands[i + 1].value == "="
          ) {
            const name = commands[i].value;
            i++;
            i++;
            let value = [];
            while (i < commands.length && commands[i].type != "end") {
              if (commands[i].type == "keyword") {
                if (!(commands[i].value in vars))
                  throw new ReferenceError(`Variable "${commands[i].value}" is not defined`);
                let currentVar = vars[commands[i].value];
                let val = currentVar.value;
                value.push(evaluate(currentVar));
              } else value.push(evaluate(commands[i]));
              i++;
            }
            vars[name].value = evaluate(value.join(" "));
          }
        }
        return res;
      })
      .run();
  }
  module.exports = parse;
});
