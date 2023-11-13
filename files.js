// @ts-check

define(async function (req, exports, module, args) {
  const { Button } = await req("./js/Button");

  Button("Open", async () => {
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    writeLnMono(contents);
  });
});
