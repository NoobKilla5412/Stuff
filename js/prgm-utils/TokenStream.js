define(async (req, exports, module) => {
  const { InputStream } = await req("./InputStream");

  /**
   * @typedef TokenTypes
   * @prop {{type: "num", value: number}} num
   * @prop {{type: "str", value: string}} str
   * @prop {{type: "kw", value: string}} kw
   * @prop {{type: "var", value: string}} var
   * @prop {{type: "punc", value: string}} punc
   * @prop {{type: "op", value: string}} op
   * @prop {{type: "char", value: string}} char
   */

  /**
   * @typedef {TokenTypes[keyof TokenTypes]} Token
   */

  class TokenStream {
    /**
     * @private
     * @type {(Token | undefined)[]}
     */
    current = [];
    /**
     * @private
     * @type {string[]}
     */
    keywords = [
      "if",
      "then",
      "else",
      "do",
      "_while",
      "while",
      "function",
      "object",
      "class",
      "static",
      "operator",
      "constructor",
      "extends",
      "import",
      "true",
      "false",
      "null"
    ];
    opChars = ".+-*/%=&|<>!";
    idStart = /[a-z_]/i;
    id = "?!-+/*%<>=0123456789";
    punc = ",:;(){}[]";
    /**
     * @private
     * @readonly
     * @type {{ [ch: string]: string }}
     */
    escapeChars = {
      n: "\n"
    };
    /**
     * @private
     * @type {InputStream}
     */
    input;

    /**
     * @param {InputStream} input
     * @param {Partial<{
     *  keywords: string[];
     *  opChars: string;
     *  idStart: RegExp;
     *  id: string;
     *  punc: string;
     *  escapeChars: { [ch: string]: string }
     *  }>} options
     */
    constructor(input, options) {
      this.input = input;
      let _options = Object.assign(
        {},
        {
          keywords: this.keywords,
          opChars: this.opChars,
          idStart: this.idStart,
          id: this.id,
          punc: this.punc,
          escapeChars: this.escapeChars
        },
        options
      );
      Object.assign(this, _options);
    }

    /**
     * @private
     * @param {string} x
     */
    is_keyword(x) {
      return this.keywords.includes(x);
    }
    /**
     * @private
     * @param {string} x
     */
    is_digit(ch) {
      return /[0-9]/i.test(ch);
    }
    /**
     * @private
     * @param {string} x
     */
    is_id_start(ch) {
      return /[a-z_]/i.test(ch);
    }
    /**
     * @private
     * @param {string} x
     */
    is_id(ch) {
      return this.is_id_start(ch) || this.id.includes(ch);
    }
    /**
     * @private
     * @param {string} x
     */
    is_op_char(ch) {
      return this.opChars.indexOf(ch) >= 0;
    }
    /**
     * @private
     * @param {string} x
     */
    is_punc(ch) {
      return this.punc.indexOf(ch) >= 0;
    }
    /**
     * @private
     * @param {string} ch
     */
    is_whitespace(ch) {
      return " \t\n\r".indexOf(ch) >= 0;
    }
    /**
     * @private
     * @param {(ch: string) => boolean} predicate
     */
    read_while(predicate) {
      var str = "";
      while (!this.input.eof() && predicate(this.input.peek())) str += this.input.next();
      return str;
    }
    /**
     * @private
     * @returns {TokenTypes["num"]}
     */
    read_number() {
      var has_dot = false;
      var number = this.read_while((ch) => {
        if (ch == ".") {
          if (has_dot) return false;
          has_dot = true;
          return true;
        }
        return this.is_digit(ch);
      });
      return {
        type: "num",
        value: parseFloat(number)
      };
    }
    /**
     * @private
     * @returns {TokenTypes["kw" | "var"]}
     */
    read_ident() {
      var id = this.read_while(this.is_id.bind(this));
      return {
        type: this.is_keyword(id) ? "kw" : "var",
        value: id
      };
    }

    /**
     * @private
     * @param {string} end
     */
    read_escaped(end) {
      var escaped = false,
        str = "";
      this.input.next();
      while (!this.input.eof()) {
        var ch = this.input.next();
        if (escaped) {
          if (ch in this.escapeChars) {
            str += this.escapeChars[ch];
          } else str += ch;
          escaped = false;
        } else if (ch == "\\") {
          escaped = true;
        } else if (ch == end) {
          break;
        } else {
          str += ch;
        }
      }
      return str;
    }
    /**
     * @returns {TokenTypes["str"]}
     */
    read_string() {
      return { type: "str", value: this.read_escaped('"') };
    }
    /**
     * @returns {TokenTypes["char"]}
     */
    read_char() {
      return { type: "char", value: this.read_escaped("'") };
    }
    /**
     * @private
     */
    skip_comment() {
      this.read_while((ch) => {
        return ch != "\n";
      });
      this.input.next();
    }
    /**
     * @private
     * @returns {Token | undefined}
     */
    read_next() {
      this.read_while(this.is_whitespace);
      if (this.input.eof()) return;
      var ch = this.input.peek();
      if (ch == "#") {
        this.skip_comment();
        return this.read_next();
      }
      if (ch == '"') return this.read_string();
      if (ch == "'") return this.read_char();
      if (this.is_digit(ch)) return this.read_number();
      if (this.is_id_start(ch)) return this.read_ident();
      if (this.is_punc(ch))
        return {
          type: "punc",
          value: this.input.next()
        };
      if (this.is_op_char(ch))
        return {
          type: "op",
          value: this.read_while(this.is_op_char)
        };
      this.input.croak(`Can't handle character: "${ch}" (Code: ${ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")})`);
      return;
    }
    /**
     * @public
     * @param {number=} offset
     */
    peek(offset) {
      if (offset) {
        if (this.current.length >= offset) return this.current[offset];
        while (offset > 0) {
          this.current.push(this.read_next());
        }
        return this.current[offset];
      }
      return this.current[0] || (this.current.push(this.read_next()), this.current[0]);
    }
    /**
     * @public
     */
    next() {
      var tok = this.current.shift();
      return tok || this.read_next();
    }
    /**
     * @public
     */
    eof() {
      return this.peek() == null;
    }
    /**
     * @public
     * @param {string} msg
     */
    croak(msg) {
      return this.input.croak(msg);
    }
  }
  exports.TokenStream = TokenStream;
});
