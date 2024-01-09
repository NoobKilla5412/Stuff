define(async (req, exports, module) => {
  class InputStream {
    /**
     * @private
     */
    pos = 0;
    /**
     * @private
     */
    line = 1;
    /**
     * @private
     */
    col = 0;
    /**
     * @private
     * @type {string}
     */
    input;
    /**
     * @private
     * @type {(err: Error) => void}
     */
    onError;

    /**
     * @public
     * @param {string} input
     * @param {(err: Error) => void} onError
     */
    constructor(input, onError = (err) => {}) {
      this.input = input;
      this.onError = onError;
    }

    /**
     * @public
     */
    next() {
      let ch = this.input.charAt(this.pos++);
      if (ch == "\n") this.line++, (this.col = 0);
      else this.col++;
      return ch;
    }

    /**
     * @public
     */
    peek() {
      return this.input.charAt(this.pos);
    }

    /**
     * @public
     */
    eof() {
      return this.peek() == "";
    }

    /**
     * @public
     * @param {string} msg
     */
    croak(msg) {
      let err = new Error(`${msg} (${this.line}:${this.col})
  ${"" ?? `${this.input.slice(0, this.pos)}|${this.input.slice(this.pos)}`}`);
      console.error(err);
      this.onError(err);
      return err;
    }
  }
  exports.InputStream = InputStream;
});
