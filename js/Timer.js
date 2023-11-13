// @ts-check

define(async (req, exports, module, args) => {
  const overload = await req("./overload");

  function convertMsToTime(ms) {
    let seconds = ms / 1000;
    let minutes = seconds / 60;
    let hours = minutes / 60;
    return `${~~hours}:${~~(minutes % 60)}:${~~(seconds % 60)}`;
  }
  function convertTimeToMs(time) {
    const times = time.split(":");
    const hours = +times[0];
    const minutes = +times[1];
    const seconds = +times[2];
    return seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000;
  }

  const timer = overload()
    .add(["number"], (_time) => {
      const elem = writeLn("");
      let currentTime = _time;
      let lastTime = new Date().getTime();
      let intervalRunning = true;
      let running = false;
      let done = false;

      function run() {
        currentTime -= new Date().getTime() - lastTime;
        lastTime = new Date().getTime();
        if (currentTime <= 0) {
          done = true;
        }
      }
      function main() {
        elem.innerHTML = "";
        if (running && !done) {
          run();
        }
        elem.innerHTML += convertMsToTime(currentTime);
        if (done) {
          elem.innerHTML += " Done";
          currentTime = 0;
        }
      }
      let interval = setInterval(main, 100);
      return {
        start() {
          if (!intervalRunning) {
            interval = setInterval(main, 100);
            intervalRunning = true;
          }
          if (!running) {
            lastTime = new Date().getTime();
            running = true;
          }
        },
        pause() {
          running = false;
        },
        stop() {
          clearInterval(interval);
          intervalRunning = false;
        }
        // set() {
        //   overload(arguments)
        //     .add(["number"], (time) => {
        //       _time = time;
        //       currentTime = _time;
        //     })
        //     .add([], () => {
        //       currentTime = _time;
        //     })
        //     .run();
        // }
      };
    })
    .add(["string"], (time) => {
      return timer(convertTimeToMs(time));
    })
    .compile();

  module.exports = timer;
});
