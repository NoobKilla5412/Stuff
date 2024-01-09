// @ts-check

define(async (req, exports, module, args) => {
  const { roundTo } = await req("./js/MathUtils");
  const overload = await req("./js/overload");

  // class Range {
  //   /** @type {number} */ start;
  //   /** @type {number} */ end;
  //   /** @type {number} */ inc;

  //   constructor() {
  //     const con = overload()
  //       .add(["number", "number", "number"], (start, end, inc) => {
  //         this.start = start;
  //         this.end = end;
  //         this.inc = inc;
  //       })
  //       .add(["number", "number", "undefined"], (start, end) => {
  //         con(start, end, 1);
  //       })
  //       .compile();

  //     con(...arguments);
  //   }

  //   toArray() {
  //     /**
  //      * @type {number[]}
  //      */
  //     let res = [];
  //     for (let i = this.start; i <= this.end; i += this.inc) {
  //       res.push(roundTo(i, 0.001));
  //     }
  //     return res;
  //   }
  // }

  // let ranges = []
  //   .map((v) => new Range(v[0], v[1], v?.[2]))
  //   .map((v) => v.toArray())
  //   .flat(2)
  //   .sort((a, b) => a - b);

  // writeLn(ranges);

  let res = "";

  class Range1 {
    start = 0;
    end = 0;
    inc = 1;

    /**
     * @param {number} start
     * @param {number} end
     * @param {number} inc
     */
    constructor(start, end, inc = 1) {
      this.start = start;
      this.end = end;
      this.inc = inc;
    }

    toArray() {
      let res = [];
      for (let i = this.start; i <= this.end; i += this.inc) {
        res.push(i);
      }
      return res;
    }
  }

  /** @type {(number | [start: number, end: number] | [start: number, end: number, inc: number])[]} */
  let ranges = [
    [1, 23],
    [1, 6]
  ];

  /**
   * @param {number | [start: number, end: number] | [start: number, end: number, inc: number]} range
   */
  function parseRange(range) {
    if (typeof range == "number") {
      return new Range1(range, range);
    } else if (range.length == 3) {
      return new Range1(range[0], range[1], range[2]);
    } else {
      return new Range1(range[0], range[1]);
    }
  }

  const arr = ranges.map((val) => parseRange(val).toArray()).flat();

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (Math.abs((arr?.[i + 1] ?? arr[i]) - arr[i]) > 1)
      res += `${element}.

$$ $$

`;
    else
      res += `${element}.
`;
  }

  console.log(res);

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
