define(async () => {
  const sleep = async (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

  function openListener() {
    if (!openActive) openFilePicker();
  }

  setInterval(openListener, 10);
  openListener();

  addEventListener("click", openListener);
  addEventListener("keydown", (e) => e.key == "Escape" && openListener());
}, true);
