// @ts-check

define(async (req, exports, module, args) => {
  // const Timer = await req("./js/Timer");
  // const Button = await req("./js/Button");

  const canvas = document.body.appendChild(document.createElement("canvas"));
  const c = canvas.getContext("2d");

  /**
   * @param {string} data
   * @param {CanvasRenderingContext2D} c
   */
  async function generateBarcode(data, c) {
    const size = 1;

    c.canvas.width =
      data
        .split("")
        .map((v) => v.charCodeAt(0).toString(2).length)
        .reduce((acc, v) => acc + v * size, 0) +
      7 * size;
    c.canvas.height = 100;

    c.fillStyle = "white";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "black";

    let i = 0;

    /**
     * @param {boolean} data
     */
    function writeLine(data, _size = size) {
      if (data) {
        // c.fillStyle = "black";
        c.fillRect(i, 0, _size, 100);
      } /*  else {
        c.fillStyle = "gray";
      } */
      i += _size;
    }

    /**
     * @param {string} data
     */
    async function writeNumber(data, _size = size) {
      for (const char of data) {
        writeLine(char == "1", _size);
        await sleep();
      }
    }

    await writeNumber(size.toString(2).padStart(7, "0"), 1);

    for (const char of data) {
      // writeLn(char.charCodeAt(0).toString(2));
      await writeNumber(char.charCodeAt(0).toString(2).padStart(7, "0"));
    }
  }

  // writeLn((23653463463).toString(2));
  // const data = ('1'.charCodeAt(0)).toString(2);
  // writeLn(data);
  await generateBarcode("Hello", c);

  /**
   * @param {HTMLCanvasElement} canvas
   */
  function readBarcode(canvas) {
    /**
     * @type {CanvasRenderingContext2D}
     */
    const c = canvas.getContext("2d");
    const data1 = c.getImageData(0, 0, canvas.width, canvas.height).data;
    let data = [];
    for (let i = 0; i < canvas.width * 4; i += 4) {
      data.push(255 - (data1[i] + data1[i + 1] + data1[i + 2]) / 3 > 128 ? 1 : 0);
    }
    let tmpData = [...data];
    data = [];
    let sizeStr = "";
    for (let i = 0; i < 7; i++) {
      sizeStr += tmpData[i];
    }
    let size = parseInt(sizeStr, 2);

    for (let i = 7; i < tmpData.length; i += 7 * size) {
      let data1 = [];
      for (let j = 0; j < 7 * size; j += size) {
        write(tmpData[i + j]);
        data1.push(tmpData[i + j]);
      }
      writeLn("");
      data.push(data1.join(""));
    }

    return data.map((v) => String.fromCharCode(parseInt(v, 2))).join("");
  }

  writeLn(readBarcode(canvas));

  // await req("./js/convertToTable");
  // function extract(str) {
  //   let url = new URL(str);
  //   return decodeURIComponent(url.searchParams.get("url") || "");
  // }
  // const timer = Timer("0:1:0");
  // Button("Pause", () => timer.pause());
  // Button("Start", () => timer.start());
  // Button("Stop", () => timer.stop());
  // timer.start();
  // const list = `Antagonist
  // Foreshadowing
  // Imagery
  // Irony
  // Mood
  // Onomatopoeia
  // Personification
  // Point of view
  // Protagonist
  // Symbolism`.split("\n");
  // list.forEach((word) => {
  //   open(
  //     `https://www.google.com/search?q=${word}&sca_esv=568877829&hl=en&authuser=0&tbm=isch&source=hp&biw=1366&bih=617&ei=C3AUZfqjMIPx0PEPv4iPuAI&iflsig=AO6bgOgAAAAAZRR-G1RboQmESEvba9WD-8f9y1_iQE0Z&ved=0ahUKEwi61b_VscuBAxWDODQIHT_EAycQ4dUDCAc&uact=5&oq=${word}&gs_lp=EgNpbWciBHRlc3QyCBAAGIAEGLEDMggQABiABBixAzIIEAAYgAQYsQMyCBAAGIAEGLEDMggQABiABBixAzIIEAAYgAQYsQMyCBAAGIAEGLEDMggQABiABBixAzIIEAAYgAQYsQMyCBAAGIAEGLEDSIsGUP0BWLIEcAF4AJABAJgBYaABvgKqAQE0uAEDyAEA-AEBigILZ3dzLXdpei1pbWeoAgDCAggQABixAxiDAcICCxAAGIAEGLEDGIMBwgIEEAAYA8ICBRAAGIAE&sclient=img&safe=active&ssui=on`
  //   );
  // });
});
