define("/js/autoReload.js", async () => {
  setInterval(() => {
    if (!openActive) location.reload();
  }, 450);
});
