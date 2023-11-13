define(async (require) => {
  const file = new URL(location.href).searchParams.get("file");
  if (file) {
    document.title = file.slice(file.lastIndexOf("/") + 1);
    if (document.title.includes(".")) document.title = document.title.slice(0, document.title.lastIndexOf("."));
    // writeLn(__path);
    try {
      const data = await require(file);
      if (typeof data == "object" && "title" in data && typeof data.title == "string") {
        document.title = data.title;
      }
    } catch (e) {
      /** @type {string} */
      let msg = e?.stack || e?.message || e;
      writeErr(msg);
      // if (msg.slice(msg.indexOf('"') + 1, msg.lastIndexOf('"')).includes(document.title)) {
      //   window.close();
      // }
    }
    // getScript("https://cdn.jsdelivr.net/gh/SnowLord7/devconsole@master/main.js");
  }
});
