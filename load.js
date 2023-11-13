// @ts-check

define(async function (req, exports, module, args) {
  const { createElement } = await req("./js/HTMLUtils");

  /**
   * @type {HTMLFormElement}
   */
  const form = createElement("form", true);
  const input = form.appendChild(document.createElement("input"));
  input.focus();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
      open(joinPath(currentImportPath, "..", `_loadJS.html?file=${encodeURIComponent(input.value)}`));
      input.value = "";
    }
  });
});
