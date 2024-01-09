// @ts-check

/**
 * @template T
 * @param {T} v
 * @returns {Exclude<T, null | undefined>}
 */
function nonNull(v) {
  if (v == null) {
    throw new TypeError("Expected a value, but got null");
  }
  return v;
}

function lerp(A, B, x) {
  return A + (B - A) * x;
}

define(async (req, exports, module, args) => {
  const overload = await req("./overload");

  const graph = overload()
    .add(["any[]", "function", "number", "number"], (data, valueFn, xScale, yScale) => {
      graph(
        data.map((v) => valueFn(v)),
        xScale,
        yScale
      );
    })
    .add(["number[]", "number", "number"], (data, xScale, yScale) => {
      const canvas = document.body.appendChild(document.createElement("canvas"));
      const c = nonNull(canvas.getContext("2d"));
      for (const y of data) {
        if (y * yScale > canvas.height) {
          canvas.height = y * yScale;
        }
      }
      canvas.width = data.length * xScale;
      c.beginPath();
      for (let x = 0; x < data.length; x++) {
        const y = data[x];
        c.lineTo(x * xScale, canvas.height - y * yScale);
      }
      c.stroke();
    })
    .add(["any[]", "function", "number"], (data, valueFn, xScale) => {
      graph(data, valueFn, xScale, 1);
    })
    .add(["any[]", "function"], (data, valueFn) => {
      graph(data, valueFn, 1, 1);
    })
    .add(["number[]", "number"], (data, xScale) => {
      graph(data, xScale, 1);
    })
    .add(["number[]"], (data) => {
      graph(data, 1, 1);
    })
    .compile();
  exports.graph = graph;
});
