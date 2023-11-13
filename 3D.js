// @ts-check

define(async function (req, exports, module, args) {
  /**
   * @template T
   * @param {T} x
   * @returns {Exclude<T, null>}
   */
  function nonNull(x) {
    if (x == null) throw new TypeError("Expected a value, but got null");
    return x;
  }

  const { createElement } = await req("./js/HTMLUtils");
  const overload = await req("./js/overload");
  const { Vec2 } = await req("./js/Vec2");

  /** @type {HTMLCanvasElement} */
  const canvas = createElement("canvas", true);
  canvas.width = 800;
  canvas.height = 500;
  const c = nonNull(canvas.getContext("2d"));

  class Vec3 {
    x = 0;
    y = 0;
    z = 0;

    constructor() {
      const constr = overload()
        .add(["number", "number", "number"], (x, y, z) => {
          this.x = x;
          this.y = y;
          this.z = z;
        })
        .compile();
      constr(...arguments);
    }

    /**
     * @param {Vec3} vec3
     */
    add(vec3) {
      this.x += vec3.x;
      this.y += vec3.y;
      this.z += vec3.z;
    }

    /**
     * @returns {Vec2}
     */
    toVec2() {
      const res = new Vec2(this.x, -this.y - this.z);

      return res;
    }

    toString() {
      return `(${this.x}, ${this.y}, ${this.z})`;
    }
  }

  // document.body.style.overflow = "hidden";

  const d = 10;

  /** @type {{ [key: string]: boolean }} */
  const keys = {};
  addEventListener("keydown", (e) => (keys[e.key] = true));
  addEventListener("keyup", (e) => (keys[e.key] = false));

  class Player {
    pos = new Vec3(0, 1, 1);
    vel = new Vec3(0, 0, 0);
    speed = 1;
    jumpHeight = 5;

    static gravity = 0.1;

    update() {
      if (keys.w) this.vel.z = this.speed;
      if (keys.s) this.vel.z = -this.speed;
      if (!keys.w && !keys.s) this.vel.z = 0;

      if (keys.a) this.vel.x = -this.speed;
      if (keys.d) this.vel.x = this.speed;
      if (!keys.a && !keys.d) this.vel.x = 0;

      if (keys[" "]) this.vel.y = this.jumpHeight;

      this.vel.y -= Player.gravity;

      this.pos.add(this.vel);
      if (this.pos.y < 1) {
        this.pos.y = 1;
        this.vel.y = 0;
      }
    }

    draw() {
      let pos = this.pos.toVec2();

      c.fillRect(pos.x, canvas.height - 10 + pos.y, 10, 10);
    }
  }

  const posDisp = writeLn("");

  const player = new Player();

  setInterval(() => {
    c.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.draw();
  }, 1000 / 60);
});
