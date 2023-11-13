define(async () => {
  function stringContent(fn) {
    let string = fn.toString().split("\n");
    string.shift();
    string.pop();
    string = string.join("\n");
    return string;
  }
});
