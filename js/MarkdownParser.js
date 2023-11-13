define(async (req, exports, module) => {
  const overload = await req("overload.js");

  /**
   * @param {string} str
   */
  function parse(str) {
    return overload([str], ["string"], () => {
      let res = "";
      let pos = 0;
      let len = str.length;
      while (pos < len) {
        let element = str[pos];

        if (element == "\n") {
          if (str[pos + 1] == "#") {
            let heading = 0;
            pos++;
            while (str[pos] == "#") heading++, pos++;
            if (str[pos] != " ") throw new SyntaxError('" " expected at pos ' + pos);
            else pos++;
            let value = "";
            while (str[pos] != "\n" && pos < len) value += str[pos++];
            res += `<h${heading}>${value}</h${heading}>`;
          }
        } else if ("*" == element) {
          let type = "";
          while ("*" == str[pos]) type += str[pos++];
          let value = "";
          while ("*" != str[pos] && pos < len) value += str[pos++];
          if ("*" != str[pos]) throw new SyntaxError('"*" expected at pos ' + pos);
          let elem = type.length % 2 == 1 ? "b" : "i";
          res += `<${elem}>${value}</${elem}>`;
        } else res += element;
        pos++;
      }
      return res;
    });
  }
  module.exports = parse;
});
