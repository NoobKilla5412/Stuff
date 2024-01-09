// @ts-check

define(async (req, exports, module, args) => {
  const { openGUI, prompt } = await req("./js/GUI");
  const { Button, ButtonRef } = await req("./js/Button");
  const { createElement } = await req("./js/HTMLUtils");

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

  function convert(text) {
    return text.replace(/\w/g, (x) => {
      return (alphabet[x.toLowerCase()] || x) + " ";
    });
  }

  Button("button", "Enter Text", {
    async onclick() {
      const text = await prompt("Enter the text");
      const gui = await openGUI();
      gui.addElement(createElement("div", convert(text)));
      gui.addCancel("Close");
    }
  });
});
