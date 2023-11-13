// @ts-check

define(async function (req, module, args) {
  const overload = await req("./overload");
  const { typedef } = await req("./typeUtils");
  typedef("Vec2", "{ x: number; y: number }");

  function lerp(A, B, t) {
    return A + (B - A) * t;
  }

  class Vec2 {
    /** @type {number} */ x;
    /** @type {number} */ y;

    constructor() {
      overload(arguments)
        .add([], () => {
          this.x = 0;
          this.y = 0;
        })
        .add(["number", "number"], (x, y) => {
          this.x = x;
          this.y = y;
        })
        .add(["Vec2"], (vec2) => {
          this.x = vec2.x;
          this.y = vec2.y;
        })
        .run();
    }

    get angle() {
      return Math.atan2(this.y, this.x);
    }
    set angle(angle) {
      let magnitude = this.magnitude;
      this.x = Math.cos(angle) * magnitude;
      this.y = Math.sin(angle) * magnitude;
    }

    setAngle() {
      overload(arguments)
        .add(["number", "number"], (angle, magnitude) => {
          this.x = Math.cos(angle) * magnitude;
          this.y = Math.sin(angle) * magnitude;
        })
        .add(["number"], (angle) => {
          this.angle = angle;
        })
        .run();
    }

    get magnitude() {
      return Math.hypot(this.x, this.y);
    }
    set magnitude(val) {
      this.x = Math.cos(this.angle) * val;
      this.y = Math.sin(this.angle) * val;
    }

    static getCanvas() {
      const canvas = document.createElement("canvas");
      canvas.height = canvas.width = 20;
      return canvas;
    }

    /**
     * @param {CanvasRenderingContext2D} c
     */
    renderAngle(c, maxMagnitude = 10) {
      if (c.canvas.width != c.canvas.height) {
        c.canvas.width = c.canvas.height = Math.max(c.canvas.height, c.canvas.width);
      }

      c.beginPath();
      let angle = this.angle;
      let x1 = c.canvas.width / 2;
      let y1 = c.canvas.width / 2;
      let r = lerp(0, c.canvas.width / 2, this.magnitude / maxMagnitude);
      if (Math.abs(r) > c.canvas.width / 2) r = (Math.sign(r) * c.canvas.width) / 2;
      c.moveTo(x1, y1);
      let x2 = x1 + r * Math.cos(angle);
      let y2 = y1 + r * Math.sin(angle);
      let _x2 = x1 - r * Math.cos(angle);
      let _y2 = y1 - r * Math.sin(angle);
      c.lineTo(x2, y2);
      c.moveTo(x1, y1);
      c.lineTo(_x2, _y2);
      c.moveTo(x2, y2);
      c.lineTo(x1 + (r / 2) * Math.cos(angle - Math.PI / 4), y1 + (r / 2) * Math.sin(angle - Math.PI / 4));
      c.moveTo(x2, y2);
      c.lineTo(x1 + (r / 2) * Math.cos(angle + Math.PI / 4), y1 + (r / 2) * Math.sin(angle + Math.PI / 4));
      c.stroke();
    }

    add() {
      let res = new Vec2(this);
      overload(arguments)
        .add(["number"], (v) => {
          res.x += v;
          res.y += v;
        })
        .add(["number", "number"], (x, y) => {
          res.x += x;
          res.y += y;
        })
        .add(["Vec2"], (vec2) => {
          res.x += vec2.x;
          res.y += vec2.y;
        })
        .run();
      return res;
    }

    sub() {
      let res = new Vec2(this);
      overload(arguments)
        .add(["number"], (v) => {
          res.x -= v;
          res.y -= v;
        })
        .add(["number", "number"], (x, y) => {
          res.x -= x;
          res.y -= y;
        })
        .add(["Vec2"], (vec2) => {
          res.x -= vec2.x;
          res.y -= vec2.y;
        })
        .run();
      return res;
    }

    mul() {
      let res = new Vec2(this);
      overload(arguments)
        .add(["number"], (v) => {
          res.x *= v;
          res.y *= v;
        })
        .add(["number", "number"], (x, y) => {
          res.x *= x;
          res.y *= y;
        })
        .add(["Vec2"], (vec2) => {
          res.x *= vec2.x;
          res.y *= vec2.y;
        })
        .run();
      return res;
    }

    div() {
      let res = new Vec2(this);
      overload(arguments)
        .add(["number"], (v) => {
          res.x /= v;
          res.y /= v;
        })
        .add(["number", "number"], (x, y) => {
          res.x /= x;
          res.y /= y;
        })
        .add(["Vec2"], (vec2) => {
          res.x /= vec2.x;
          res.y /= vec2.y;
        })
        .run();
      return res;
    }

    toString() {
      return `(${this.x}, ${this.y})`;
    }
  }
  this.Vec2 = Vec2;
});
