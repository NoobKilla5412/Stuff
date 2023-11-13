define(async (req, exports, module) => {
  const { isTypeArray } = await req("./typeUtils");

  class String1 {
    /** @private @type {ArrayBuffer} */ chars;
    /** @private @type {DataView} */ dataView;
    /** @private */ currentChar = 0;
    /** @private @type {number} */ byteLength;
    /** @private @type {boolean} */ resizable;
    get length() {
      return this.currentChar;
    }

    /**
     * @param {(number | string | number[])=} length
     */
    constructor(length = 0, resizable = true) {
      let arrayLength = length;
      if (typeof length != "number") {
        arrayLength = 0;
      }
      this.chars = new ArrayBuffer(arrayLength);
      this.dataView = new DataView(this.chars);
      this.byteLength = arrayLength;
      this.resizable = resizable;
      if (typeof length == "string" || isTypeArray(length, "number")) {
        this.set(length);
      }
    }

    /**
     * @param {string | number[]} str
     */
    add(str) {
      if (typeof str == "string") {
        if (str.length + this.currentChar > this.byteLength && this.resizable) {
          let str1 = this.toString();
          this.byteLength += str.length;
          this.dataView = null;
          this.chars = new ArrayBuffer(this.byteLength);
          this.dataView = new DataView(this.chars);
          this.currentChar -= str1.length;
          this.add(str1);
        }
        for (let i = 0; i < str.length; i++) {
          const element = str[i];
          this.dataView.setUint8(i + this.currentChar, element.charCodeAt(0));
          // writeLn(i + this.currentChar);
          // writeLn(this.length);
          // writeLn(JSON.stringify(this.toString()));
        }
        this.currentChar += str.length;
        return this;
      } else if (isTypeArray(str, "number")) {
        let newStr = "";
        for (const num of str) {
          newStr += String.fromCharCode(num);
        }
        this.add(newStr);
        return this;
      } else if (typeof str == "number") {
        this.add(String.fromCharCode(str));
        return this;
      } else if (String1.isString(str)) {
        this.add(str.toString());
        return this;
      }
      throw new TypeError();
    }

    set(str) {
      this.currentChar = 0;
      this.add(str);
    }

    /**
     * @param {number} i
     */
    charCodeAt(i) {
      return this.dataView.getUint8(i);
    }

    /**
     * @param {number} i
     */
    charAt(i) {
      return String.fromCharCode(this.charCodeAt(i));
    }

    toString() {
      let str = "";
      for (let i = 0; i < this.length; i++) {
        const letter = this.dataView.getUint8(i);
        if (letter) str += String.fromCharCode(letter);
      }
      return str;
    }

    toCodeArray() {
      return Array.from(this.toString(), (val) => val.charCodeAt(0));
    }

    static fromCharCode(code) {
      return String.fromCharCode(code);
    }

    /**
     * @param {any} arg
     * @returns {arg is String1}
     */
    static isString(arg) {
      return arg instanceof String1;
    }
  }
  module.exports = String1;
});
