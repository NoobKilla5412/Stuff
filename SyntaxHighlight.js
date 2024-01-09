define(async (req, exports, module) => {
  let pos = 0;
  let tempRes = "";
  let finalData = "";
  let tempData;

  /**
   * @param  {...string} data
   */
  function highlight(...data) {
    let i = 0;
    do {
      const element = data[i];
      tempData = element;
      if (tempData != undefined) {
        while (pos < tempData.length) {
          const element = tempData[pos];
          if (element == '"') {
            parseString();
          } else if (/\d/.test(element)) {
            tempRes += `<font color="#B5CEA8">${element}</font>`;
            pos++;
          } else if (element == "t" || element == "f") {
            parseBool(element == "t");
          } else if (element == "\n") {
            tempRes += "<br>";
            pos++;
          } else {
            tempRes += element;
            pos++;
          }
        }
      }
      finalData += `${tempRes}`;
      i++;
      pos = 0;
      tempRes = "";
    } while (i < data.length);
    // const date = new Date();
    // const dateText =
    //   (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +
    //   "." +
    //   (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
    //   "." +
    //   (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
    // pre!.innerHTML += `[${dateText}] ${finalData}\n`;
    return finalData;
  }
  function parseString() {
    tempRes += '<font color="#CE9178">"';
    pos++;
    while (tempData[pos] != '"') {
      if (tempData[pos] == "\\") {
        tempRes += `<font color="#D7BA7D">${tempData[pos]}${tempData[pos + 1]}</font>`;
        pos += 2;
      } else {
        tempRes += tempData[pos];
        pos++;
      }
    }
    tempRes += '"</font>';
    pos++;
  }
  function parseBool(bool) {
    if (bool) {
      tempRes += `<font color="#569CD6">true</font>`;
      pos += 4;
    } else {
      tempRes += `<font color="#569CD6">false</font>`;
      pos += 5;
    }
  }
  module.exports = highlight;
});
