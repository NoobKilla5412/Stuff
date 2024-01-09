let modules = {};
let exports = {};

/**
 * @param {string} file
 * @param {(exports, require: (file: string) => any) => void} main
 * @param {boolean | undefined} run
 */
function define(file, main, run) {
  modules[file] = main;
  if (run) Load(file);
}

/**
 * @internal
 * @param {string} file
 */
function Load(file) {
  if (!modules[file]) {
    let error = new ReferenceError(`Module ${file} can not found`);
    // document.write('<span style="color: red">' + error + "</span><br>");
    // navigator.clipboard.writeText(file);
    throw error;
  }
  // else if (!file.endsWith(".js") && !modules[file]) {
  //   eval(`if (typeof ${file} === 'undefined') {
  //           let error = '${file} is not found';
  //           document.write('<span style="color: red">' + error + "</span><br>");
  //           navigator.clipboard.writeText("${file}");
  //           throw error;
  //         }`);
  else
    try {
      modules[file]((exports[file] = exports[file] || {}), (file) => {
        if (typeof exports[file] == "undefined") Load(file);
        return exports[file];
      });
    } catch (e) {
      document.write('<span style="color: red">' + e + "</span><br>");
    }
}
