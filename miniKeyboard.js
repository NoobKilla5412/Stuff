// @ts-check

define(async function (req, exports, module, args) {
  const { dict } = await req("./js/ExtendedWords");

  const keys = {
    q: "qw",
    w: "er",
    e: "ty",
    r: "ui",
    t: "op",

    a: "as",
    s: "df",
    d: "gh",
    f: "jk",
    g: "l",

    z: "zx",
    x: "cv",
    c: "b",
    v: "n",
    b: "m"
  };

  function changeLetters(word) {
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!(char in keys)) throw new Error("Invalid key");
      for (let j = 0; j < keys[char].length; j++) {
        writeLn(keys[char][j]);
      }
    }
  }

  /**
   * @param {string} encWord
   */
  function generateCombinations(encWord) {
    for (let i = 0; i < encWord.length; i++) {
      const char = encWord[i];
      if (!(char in keys)) throw new Error("Invalid key");
      encWord = encWord.substring(0, i) + keys[char][0] + encWord.substring(i + 1);
    }

    return dict.lucky(encWord) == encWord;
  }

  /**
   * @param {string} words
   */
  function main(words) {
    let wordsArr = words.split(/\s/g);
    return wordsArr.map((val) => changeLetters(val)).join(" ");
  }

  writeLn(main("r ab dtts dtq"));
});
