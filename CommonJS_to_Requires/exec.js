define(async (req, exports, module) => {
  const CommonJS_to_Requires = await req("./index");

  const form = createElement("form");
  const input = form.appendChild(document.createElement("textarea"));
  input.style.width = "50%";
  input.style.height = "40vh";
  input.value = localStorage.getItem("currentInput") || input.value;
  form.appendChild(document.createElement("br"));
  const submit = form.appendChild(document.createElement("button"));
  submit.type = "submit";
  submit.innerHTML = "Go";
  form.appendChild(document.createElement("br"));
  const output = form.appendChild(document.createElement("textarea"));
  output.style.width = "50%";
  output.style.height = "40vh";

  output.addEventListener("click", (e) => {
    e.preventDefault();
    output.focus();
    output.select();
  });

  function submitAction(e) {
    e?.preventDefault();

    output.value = CommonJS_to_Requires(input.value);

    if (e) {
      output.focus();
      output.select();
    }

    localStorage.setItem("currentInput", input.value);
  }

  form.addEventListener("submit", submitAction);

  input.addEventListener("input", () => {
    submitAction();
  });

  submitAction();

  exports.title = "CommonJS to Requires";
});
