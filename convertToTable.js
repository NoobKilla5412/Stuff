// @ts-check

define(async (req, exports, module, args) => {
  const overload = await req("./overload");
  const { isType } = await req("typeUtils");

  const toTable = overload()
    .add(["object"], (data) => {
      let res = [["(index)"]];

      function getProps(obj) {
        let keys = [];
        let props = [];
        if (typeof obj == "object")
          for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
              const element = obj[key];
              res[0].push(key);
              props.push(JSON.stringify(element));
            }
          }
        else props.push(obj);

        let _props = props.flat(100);

        _props.forEach((element, i, arr) => {
          if (typeof element == "object" && "keys" in element && "props" in element) {
            keys.push(...element.keys);
            arr[i] = element.props;
          }
        });

        return { keys, props: _props };
      }

      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const element = data[key];
          let props = getProps(element);
          res[0].push(...props.keys);
          let row = [key, ...props.props];
          res.push(row);
        }
      }
      return toTable(res);
    })
    .add(["any[][]"], (data) => {
      let res = `<table><thead><tr>`;
      if (!data[0]) throw new Error("Invalid table");
      for (let i = 0; i < data[0].length; i++) {
        if (!isType(data[0], "any[]")) throw new Error("Invalid table");
        const element = data[0][i];
        res += `<th>${element}</th>`;
      }
      res += "</tr></thead><tbody>";
      for (let i = 1; i < data.length; i++) {
        res += "<tr>";
        if (!isType(data[i], "any[]")) throw new Error("Invalid table");
        for (let j = 0; j < data[i].length; j++) {
          const element = data[i][j];
          res += `<td>${element}</td>`;
        }
        res += "</tr>";
      }
      res += "</tbody></table>";

      return res;
    })
    .compile();

  exports.toTable = toTable;

  function writeTable(...args) {
    writeLn(toTable(...args));
  }
  exports.writeTable = writeTable;

  console.table = writeTable;
});
