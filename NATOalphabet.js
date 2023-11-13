// @ts-check

define(async (req, exports, module, args) => {
  const alphabet = {
    a: "alpha",
    b: "bravo",
    c: "charlie",
    d: "delta",
    e: "echo",
    f: "foxtrot",
    g: "golf",
    h: "hotel",
    i: "india",
    j: "juliet",
    k: "kilo",
    l: "lima",
    m: "mike",
    n: "november",
    o: "oscar",
    p: "papa",
    q: "quebec",
    r: "romeo",
    s: "sierra",
    t: "tango",
    u: "uniform",
    v: "victor",
    w: "whiskey",
    x: "xray",
    y: "yankee",
    z: "zulu"
  };

  const text = "";

  writeLn(
    text.replace(/\w/g, (x) => {
      return (alphabet[x.toLowerCase()] || x) + " ";
    })
  );
});
