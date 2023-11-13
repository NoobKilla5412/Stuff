define(async (req, _, module, args) => {
  const { parse, replaceSubScript, replaceExponents } = await req("./Parse.js");
  const overload = await req("./overload.js");
  // keepOpen();

  const letters = {
    A: "/\\",
    B: "ᗷ",
    C: "⼕",
    D: "|)",
    E: "∈",
    F: "Ƒ",
    G: "Ꮆ",
    H: "|-|",
    I: "I",
    J: "\\_|",
    K: "K",
    L: "|\\_",
    M: "/\\/\\",
    "N(?!bsp)": "|\\|",
    O: "0",
    "(?<!nbs)P": "|^)\\_",
    Q: "Q",
    R: "ᖇ",
    S: "⟆",
    T: "T",
    U: "|\\_|",
    V: "\\/",
    W: "\\/\\/",
    X: "ⵋ",
    Y: "^\\\\_/",
    Z: "Z",

    0: "0",
    1: "^/\\_|",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "^-\\_/",
    8: "8",
    9: "^0\\_|"
  };

  var exports = (module.exports = font);

  function font(string) {
    return overload([string])
      .add(["string"], () => {
        string = string.toUpperCase().split("").join("&nbsp;");
        for (const key in letters) {
          if (Object.hasOwnProperty.call(letters, key)) {
            const element = letters[key];
            string = string.replace(new RegExp(key, "g"), element);
          }
        }
        return replaceExponents(replaceSubScript(string));
      })
      .run();
  }

  exports.test = function () {
    return overload(arguments, [], () => {
      writeLn(
        Array.from(
          writeLn(
            font(Array.from(Array(26), (_v, i) => String.fromCharCode(i + 65)).join("") + "\n1234567890")
              .split("&nbsp;")
              .map((v) =>
                v.replace(/(?<!<\/?)\b[A-Z]/gi, (x, index) => {
                  return `<span style="background: yellow">${x}</span>`;
                  return x;
                })
              )
              .join("&nbsp;")
          ).innerText.matchAll(/[A-Z]/gi)
        ).length + "/26"
      );
    });
  };
});
