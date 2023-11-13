// @ts-check

define(async (req, exports, module, args) => {
  const { roundTo } = await req("./js/MathUtils");
  const overload = await req("./js/overload");

  class Range {
    /** @type {number} */ start;
    /** @type {number} */ end;
    /** @type {number} */ inc;

    constructor() {
      const con = overload()
        .add(["number", "number", "number"], (start, end, inc) => {
          this.start = start;
          this.end = end;
          this.inc = inc;
        })
        .add(["number", "number", "undefined"], (start, end) => {
          con(start, end, 1);
        })
        .compile();

      con(...arguments);
    }

    toArray() {
      /**
       * @type {number[]}
       */
      let res = [];
      for (let i = this.start; i <= this.end; i += this.inc) {
        res.push(roundTo(i, 0.001));
      }
      return res;
    }
  }

  let ranges = []

    .map((v) => new Range(v[0], v[1], v?.[2]))
    .map((v) => v.toArray())
    .flat(2)
    .sort((a, b) => a - b);

  writeLn(ranges);

  let res = [];

  //   for (let i = 1; i <= 29; i += 2) {
  //     res += `${i}.

  // $$ $$

  // `;
  //   }

  //   for (let i = 1; i <= 7; i++) {
  //     res += `${i}.
  // `;
  //   }
});
