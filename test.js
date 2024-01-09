// @ts-check

define(async function (req) {
  const { Vec2 } = await req("./js/Vec2");
  const overload = await req("./js/overload");
  // const { equals } = await req("./js/MathUtils");

  /** @type {HTMLLinkElement} */
  let favicon = document.head.appendChild(document.createElement("link"));
  favicon.rel = "icon";

  const canvas = document.createElement("canvas");
  // canvas.style.cursor = "none";
  document.body.append(canvas);
  canvas.width = canvas.height = 500;
  const image = new Image(canvas.width, canvas.height);
  // document.body.append(image);
  /**
   * @type {CanvasRenderingContext2D}
   */
  const c = canvas.getContext("2d");

  const canvas1 = document.createElement("canvas");
  canvas1.height = canvas1.width = 20;
  /** @type {CanvasRenderingContext2D} */
  const c1 = canvas1.getContext("2d");

  const data = writeLnMono("");
  const data1 = document.createElement("span");
  data.append(canvas1);
  data.append(data1);

  /**
   * @type {{ [key: string]: boolean }}
   */
  const keys = {};

  window.addEventListener("keydown", (e) => {
    if (e.key == " ") {
      running = !running;
      if (running) played = true;
    }
    keys[e.key] = true;
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  const mouseCoord = { x: 0, y: 0 };

  addEventListener("mousemove", (e) => {
    mouseCoord.x = e.pageX - canvas.offsetLeft ?? mouseCoord.x;
    mouseCoord.y = e.pageY - canvas.offsetTop ?? mouseCoord.y;
  });

  class Player {
    v = new Vec2(0, 0);
    pos = new Vec2(canvas.width / 2, canvas.height / 2);
    acc = 1;
    color = "black";
    speed = 0;
    bounceConstant = 1.1;
    friction = 1;
    /**
     * @type {() => { x: number; y: number }}
     */
    eqn;
    /**
     * @type {{ x: number; y: number }}
     */
    lastPt = null;

    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {typeof this.eqn} eqn
     */
    constructor(x, y, eqn) {
      this.pos = new Vec2(x, y);
      this.eqn = eqn;
      // const constr = (...args) => {
      //   overload(args)
      //     .add([], () => {})
      //     .add(["number"], (speed) => {
      //       this.speed = speed;
      //     })
      //     .add(["number", "string"], (speed, color) => {
      //       constr(speed);
      //       this.color = color;
      //     })
      //     .add(["number", "number"], (x, y) => {
      //       this.pos.x = x;
      //       this.pos.y = y;
      //     })
      //     .add(["number", "number", "string"], (x, y, color) => {
      //       constr(x, y);
      //       this.color = color;
      //     })
      //     .add(["number", "number", "number"], (speed, x, y) => {
      //       constr(x, y);
      //       this.speed = speed;
      //     })
      //     .add(["number", "number", "number", "string"], (speed, x, y, color) => {
      //       constr(speed, x, y);
      //       this.color = color;
      //     })
      //     .run();
      // };

      // constr(...arguments);

      Player.players.push(this);
    }

    // update() {
    //
    //   // if (Math.abs(this.v.magnitude) > this.speed * 10) {
    //   //   this.v.magnitude = this.speed * 10;
    //   // }
    //   // if (!keys.a && !keys.d) this.v.x *= this.bounceConstant;

    //   this.pos.add(this.v);
    //   // this.vel.add(new Vec2(0.1, 0.1));
    //   // this.v.setAngle(Math.atan2(mouseCoord.y - this.pos.y, mouseCoord.x - this.pos.x), this.vel.magnitude);

    //   this.v.y += 0.1;

    //
    //   // c.fillRect(this.pos.x - 5 / 2, this.pos.y - 5 / 2, 5, 5);
    //   const angle = Math.atan2(this.v.y, this.v.x);

    // }

    bounce() {
      if (this.pos.x < 0) {
        this.pos.x = 0;
        this.v.x *= -this.bounceConstant;
        this.v.x *= this.friction;
      }
      if (this.pos.y < 0) {
        this.pos.y = 0;
        this.v.y *= -this.bounceConstant;
        this.v.x *= this.friction;
      }
      if (this.pos.x > canvas.width) {
        // this.pos.x = 0;
        this.pos.x = canvas.width;
        this.v.x *= -this.bounceConstant;
        this.v.x *= this.friction;
      }
      if (this.pos.y > canvas.height) {
        this.pos.y = canvas.height;
        this.v.y *= -this.bounceConstant;
        this.v.x *= this.friction;
      }
    }

    lastFrame = -1;

    update() {
      if (keys.w) this.v.y += -this.acc;
      if (keys.s) this.v.y += this.acc;
      // if (!keys.w && !keys.s) this.v.y *= this.bounceConstant;
      if (keys.a) this.v.x += -this.acc;
      if (keys.d) this.v.x += this.acc;

      if (Math.abs(this.v.x) > this.speed) {
        this.v.x = Math.sign(this.v.x) * this.speed;
      }
      if (Math.abs(this.v.y) > this.speed) {
        this.v.y = Math.sign(this.v.y) * this.speed;
      }

      // Round the velocity to zero to stop
      if (Math.abs(this.v.x) <= 0.00005) this.v.x = 0;
      if (Math.abs(this.v.y) <= 0.00005) this.v.y = 0;

      // Gravity
      // this.v.y += 0.1;

      // Render

      if (this.lastFrame > 0) this.lastFrame--;
      if (played) {
        this.lastFrame = -1;
        played = false;
        i--;
      }
      if (this.lastFrame == 0) {
        running = false;
        return;
      }

      // Star
      // const smoothness = 1 / (Math.PI * 1.201);
      // const currentPos = {
      //   x: this.pos.x + Math.cos(i / smoothness) * 100,
      //   y: this.pos.y + Math.sin(i / smoothness) * 100 + Math.cos((i * 10) / smoothness) * 100
      // };
      // const smoothness = 1 / (Math.PI * 1.226);
      // const currentPos = {
      //   x: this.pos.x + Math.cos(i / smoothness) * 100,
      //   y: this.pos.y + Math.sin(i / smoothness) * 100 + Math.cos((i * 10) / smoothness) * 100
      // };
      // const smoothness = 1 / (Math.PI * 1.501);
      // const currentPos = {
      //   x: this.pos.x + Math.cos(i / smoothness) * 100,
      //   y: this.pos.y + Math.sin(i / smoothness) * 100 + Math.cos((i * 10) / smoothness) * 100
      // };

      // Cool 3
      // const smoothness = 1 / 1.3;
      // const currentPos = {
      //   x: this.pos.x + Math.cos(i / smoothness) * 100,
      //   y: this.pos.y + Math.sin(i / smoothness) * 100 + Math.cos((i * 10) / smoothness) * 100
      // };

      // Cool 4
      // const smoothness = 1.6;
      // const currentPos = {
      //   x: this.pos.x + Math.cos(i / smoothness) * 100,
      //   y: this.pos.y + Math.sin(i / smoothness) * 100 + Math.cos((i * 10) / smoothness) * 100
      // };

      // Cool 5
      // const smoothness = 1.8;
      // const currentPos = {
      //   x: this.pos.x + Math.cos(i / smoothness) * 100,
      //   y: this.pos.y + Math.sin(i / smoothness) * 100 + Math.cos((i * 10) / smoothness) * 100
      // };

      // Cool 6
      // const smoothness = 1.9;
      // const currentPos = {
      //   x: this.pos.x + Math.cos(i / smoothness) * 100,
      //   y: this.pos.y + Math.sin(i / smoothness) * 100 + Math.cos((i * 10) / smoothness) * 100
      // };

      // Cool 7
      // const smoothness = 2;
      // const currentPos = {
      //   x: this.pos.x + Math.cos(i / smoothness) * 100,
      //   y: this.pos.y + Math.sin(i / smoothness) * 100 + Math.cos((i & 2) / smoothness) * 100
      // };

      // Cool 8
      // const smoothness = 1;
      // const currentPos = {
      //   x: this.pos.x + Math.cos(i / smoothness) * 100,
      //   y: this.pos.y + Math.sin(i / smoothness) * 100 + Math.cos((i & 2) / smoothness) * 100
      // };

      // Cool 9
      // const smoothness = 1;
      // let res = (i * 5) / smoothness;
      // const currentPos = {
      //   x: this.pos.x + Math.cos(i / smoothness) * 100 + Math.sin(res) * 100,
      //   y: this.pos.y + Math.sin(i / smoothness) * 100 + Math.cos(res) * 100
      // };

      // const currentPos = {
      //   x: mouseCoord.x,
      //   y: mouseCoord.y
      // };
      const currentPos = new Vec2(this.eqn()).add(this.pos);

      // if (equals((i / smoothness) % (Math.PI * 2), 0, 0.025)) {
      //   this.lastFrame = 3;
      //   // i++;
      // }

      // this.pos.add(this.v);
      // this.bounce();
      this.v = currentPos.sub(new Vec2(this.lastPt?.x ?? 0, this.lastPt?.y ?? 0));

      let x = currentPos.x;
      let y = currentPos.y;
      let x1 = this.lastPt?.x ?? x;
      let y1 = this.lastPt?.y ?? y;
      this.pts.push({ x, y, x1, y1 });
      this.pts.forEach(({ x, y, x1, y1 }) => {
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x, y);
        c.strokeStyle = `hsl(${((x + x1) / 2 + (y + y1) / 2) % 360}, 50%, 50%)`;
        c.stroke();
      });
      if (this.pts.length > 20) this.pts.shift();

      // c.fillStyle = this.color;
      // c.drawImage(canvas1, this.pos.x - canvas1.width / 2, this.pos.y - canvas1.height / 2);

      // Draw the velocity vector
      c1.clearRect(0, 0, canvas1.width, canvas1.height);
      this.v.renderAngle(c1, this.speed);
      data1.innerHTML = this.v;
      this.lastPt = currentPos;
    }

    /**
     * @type {{ x: number; y: number; x1: number; y1: number }[]}
     */
    pts = [];

    /**
     * @type {Player[]}
     */
    static players = [];
  }

  // new Player();
  // new Player(canvas.width / 2, canvas.height / 2, () => {
  //   const smoothness = 100;
  //   const x = Math.sin((i * 1) / smoothness) * 100 + Math.tan((i * 3) / smoothness) * 100;
  //   return {
  //     x,
  //     y:
  //       Math.sin((i * 1) / smoothness) * 100 +
  //       Math.tan((i * 2) / smoothness) * 100 /* Math.sin((i * 1) / smoothness) * 100 + Math.sin((i * 2) / smoothness) * 100 */
  //   };
  // });
  new Player(canvas.width / 2, canvas.height / 2, () => {
    const smoothness = 100;
    return {
      x: Math.cos((i * 1) / smoothness) * 100 + Math.cos((i * 3) / smoothness) * 100,
      y: Math.sin((i * 1) / smoothness) * 100 + Math.sin((i * 4) / smoothness) * 50
    };
  });
  // player.v.x = 8;

  function update() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    Player.players.forEach((player) => player.update());

    // image.src = favicon.href = canvas.toDataURL();
  }

  let i = 1;

  let running = true;
  let played = false;

  this.title = "Test";

  setInterval(() => {
    if (running) {
      update();
      i++;
    }
  }, 1000 / 60);
});
