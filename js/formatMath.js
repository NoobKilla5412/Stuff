define(async (req, exports) => {
  const overload = await req("overload.js");
  const { defineWords } = await req("./ExtendedWords.js");

  defineWords("pm", "putBar", "C");

  (0, eval)(`pm = ''; function sqrt(x) {return Math.sqrt(x);}`);
  /**
   * @param {string} str
   */
  function formatMath(str) {
    return overload([str], ["string"], () => {
      str = str
        .replace(/([^(])\+([^)])/g, "$1 &plus; $2")
        .replace(/([^(])\+([^)])/g, "$1 &plus; $2")
        .replace(/([^])- ([^])/g, "$1 &minus; $2")
        .replace(/([^(])\*([^)])/g, "$1 &bullet; $2")
        .replace(/([^(])\*([^)])/g, "$1 &bullet; $2")
        .replace(/([^(\\])=([^)>])/g, "$1 &equals; $2")
        .replace(/([^(\\])=([^)>])/g, "$1 &equals; $2")
        .replace(/sqrt\(([^]*?)\)/, '√<span class="putBar">$1</span>')
        .replace(/pm/, "&pm;")
        .replace(/\^([\d.]*?)/g, "<sup>$1</sup>")
        .replace(/n([PC])r\((\d+)\s*,\s*(\d+)\)/g, "_{$2}$1_{$3}")
        .replace(/fact\((\d+)\)/, "$1!");
      return str;
    });
  }
  exports.formatMath = formatMath;

  function fact(x) {
    return overload([x])
      .add(["number"], () => {
        if (x == 1 || x == 0) return 1;
        let res = x;
        x--;
        while (x > 0) {
          res *= x;
          x--;
        }
        return res;
      })
      .add(["string"], () => {
        return fact(parseFloat(x));
      })
      .run();
  }
  exports.fact = fact;

  function nPr(n, r) {
    return overload([n, r], ["number", "number"], () => {
      return fact(n) / fact(n - r);
    });
  }
  exports.nPr = nPr;

  function nCr(n, r) {
    return overload([n, r], ["number", "number"], () => {
      return fact(n) / (fact(n - r) * fact(r));
    });
  }
  exports.nCr = nCr;
});
