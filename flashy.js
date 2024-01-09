// @ts-check

define(async function (req, exports, module, args) {
  let colors = ["white", "blue", "purple", "black", "yellow"];

  let sequence = "⸻";

  // writeLn((sequence + " ").repeat(~~(4096 / (sequence.length + 1))));
  writeLn(sequence.repeat(~~(4096 / sequence.length)));

  // for (let i = 0; ; i += 5) {
  //   let max = 50;
  //   for (let j = 0; j < max * 2; j += 0.5) {
  //     // for (let k = 0; k < max * 2; k++) {
  //     document.body.style.background = `hsl(${i % 360}, 100%, ${j > max ? max * 2 - j : j}%)`;
  //     await sleep();
  //     // }
  //   }
  // }
});
