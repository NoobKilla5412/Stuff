define(async function (req) {
  const overload = await req("overload.js");
  const KaTeX = await req("KaTeX");

  window.r = String.raw;

  this.render = overload()
    .add(["string"], (text) => {
      KaTeX.render(text, document.body, { throwOnError: false });
    })
    .add(["string", "any"], (text, element) => {
      KaTeX.render(text, element, { throwOnError: false });
    })
    .compile();
  this.renderToString = overload()
    .add(["string"], (text) => {
      return KaTeX.renderToString(text, { throwOnError: false });
    })
    .compile();

  function getValue(exp) {
    return overload([exp], ["number"], () => {
      let string = "1" + "0".repeat(exp);
      return BigInt(string);
    });
  }

  this.equals = overload()
    .add(["number", "number", "number"], (x, y, cutoff) => {
      return Math.abs(x - y) < cutoff;
    })
    .add(["number", "number"], (x, y) => {
      return equals(x, y, 0.00005);
    })
    .compile();

  const values = [
    {
      key: getValue(3),
      value: "K",
      ext: "Thousand"
    },
    {
      key: getValue(6),
      value: "M",
      ext: "Million"
    },
    {
      key: getValue(9),
      value: "B",
      ext: "Billion"
    },
    {
      key: getValue(12),
      value: "T",
      ext: "Trillion"
    },
    {
      key: getValue(15),
      value: "q",
      ext: "Quadrillion"
    },
    {
      key: getValue(18),
      value: "Q",
      ext: "Quintillion"
    },
    {
      key: getValue(21),
      value: "s",
      ext: "Sextillion"
    },
    {
      key: getValue(24),
      value: "S",
      ext: "Septillion"
    }
  ];

  // writeLn(BigInt(values[7].key));

  function weight(arr) {
    return overload([arr], ["({ value: string | number; chance: number })[]"], () => {
      return [].concat(...arr.map((obj) => Array(Math.ceil(obj.chance * 100)).fill(obj)));
    });
  }

  /**
   * @param {readonly ({ value: string | number; chance: number })[]} table
   */
  function lootTable(table) {
    return overload([table], ["({ value: string | number; chance: number })[]"], () => {
      let random = Math.random();
      let weighted = weight(table);

      return weighted[Math.floor(Math.random() * weighted.length)].value;
    });
  }
  this.lootTable = lootTable;

  /**
   * @param {number} x
   * @param {number} to
   */
  function roundTo(x, to = 1) {
    return overload([x, to], ["number", "number"], () => {
      let rec = 1 / to;
      return Math.round(+x.toString() * rec) / rec;
    });
  }
  this.roundTo = roundTo;
  /**
   * @param {number} x
   * @param {number} to
   */
  function floorTo(x, to = 1) {
    return overload([x, to], ["number", "number"], () => {
      let rec = 1 / to;
      return Math.floor(x * rec) / rec;
    });
  }
  this.floorTo = floorTo;
  /**
   * @param {number} x
   * @param {number} to
   */
  function ceilTo(x, to = 1) {
    return overload([x, to], ["number", "number"], () => {
      let rec = 1 / to;
      return Math.ceil(x * rec) / rec;
    });
  }
  this.ceilTo = ceilTo;

  /**
   * @param {number} x
   */
  function toValues(x) {
    return overload([x], ["number"], () => {
      for (let i = values.length - 1; i >= 0; i--) {
        const element = values[i];
        if (x >= element.key) {
          return fancyNumber(roundTo(x / element.key, 0.01)) + element.value;
        }
      }
      return fancyNumber(roundTo(x, 0.01));
    });
  }
  this.toValues = toValues;

  /**
   * @param {string} x
   */
  function fromValues(x) {
    return overload([x], ["string"], () => {
      for (let i = values.length - 1; i >= 0; i--) {
        const element = values[i];
        if (x.endsWith(element.value)) {
          return BigInt(~~x.replace(/[^\d.]/g, "")) * element.key;
        }
      }
      return BigInt(~~+x);
    });
  }
  this.fromValues = fromValues;

  /**
   * @param {bigint} x
   */
  function toValuesExt(x) {
    return overload([x], ["bigint | number"], () => {
      // writeLn(x);
      for (let i = values.length - 1; i >= 0; i--) {
        const element = values[i];
        if (+x >= +element.key) {
          return fancyNumber(roundTo(+x / +element.key, 0.01)) + " " + element.ext;
        }
      }
      return fancyNumber(roundTo(+x, 0.01));
    });
  }
  this.toValuesExt = toValuesExt;

  /**
   * @param {number} x
   */
  function OoM_Ext(x) {
    return overload([x], ["number"], () => {
      for (let i = values.length - 1; i >= 0; i--) {
        const element = values[i];
        if (x >= element.key) {
          return element.ext;
        }
      }
      return "";
    });
  }
  this.OoM_Ext = OoM_Ext;

  /**
   * @param {number} x
   */
  function OoM(x) {
    return overload([x], ["number"], () => {
      for (let i = values.length - 1; i >= 0; i--) {
        const element = values[i];
        if (BigInt(x) >= element.key) {
          return element.value;
        }
      }
      return "";
    });
  }
  this.OoM = OoM;

  /**
   * @param {string} x
   */
  function fromValuesExt(x) {
    return overload([x], ["string"], () => {
      for (let i = values.length - 1; i >= 0; i--) {
        const element = values[i];
        if (x.endsWith(element.ext)) {
          return +x.replace(/[^\d.]/g, "") * +element.key.toString();
        }
      }
      return +x;
    });
  }
  this.fromValuesExt = fromValuesExt;

  /**
   * @param {bigint | number} x
   */
  function fancyNumber(x) {
    return overload([x], ["bigint | number"], () => {
      let rem = +x.toString() % 1;
      let string = BigInt(x - rem).toString();
      let res = "";
      let count = 0;
      for (let i = string.length - 1; i >= 0; i--) {
        const element = string[i];
        res += element;
        if (count == 2 && i != 0) {
          res += ",";
          count = 0;
        } else count++;
      }

      return res.split("").reverse().join("") + (rem ? roundTo(rem, 0.0001).toString().slice(1) : "");
    });
  }
  this.fancyNumber = fancyNumber;

  /**
   * @param {string} x
   */
  function unFancyNumber(x) {
    return overload([x], ["string"], () => +x.replace(/,/g, ""));
  }
  this.unFancyNumber = unFancyNumber;

  /**
   * @param {number} millis
   */
  function millisToHMS(millis) {
    return overload([millis], ["number"], () => {
      let s = roundTo((millis / 1000) % 60, 0.1);
      let m = Math.floor(millis / 1000 / 60) % 60;
      let h = Math.floor(millis / 1000 / 60 / 60);
      return `${h}:${m}:${s}`;
    });
  }
  this.millisToHMS = millisToHMS;

  /**
   * @param {number} a
   * @param {number} b
   */
  function gcd(a, b) {
    return overload([a, b], ["number", "number"], () => {
      var _ref;
      while (b) {
        (_ref = [b, a % b]), (a = _ref[0]), (b = _ref[1]);
      }
      return a;
    });
  }
  this.gcd = gcd;

  /**
   * @param {number} a
   * @param {number} b
   */
  function lcm(a, b) {
    return overload([a, b], ["number", "number"], () => {
      return (a / gcd(a, b)) * b;
    });
  }
  this.lcm = lcm;
});
