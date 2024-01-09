define((req, exports, module) => {
  "use strict";
  class Question {
    constructor(type, question, answer, options, text, link) {
      this.question = question;
      this.type = type;
      this.options = options;
      this.answer = answer;
      this.text = text;
      this.link = link;
    }
  }
  module.exports = Question;
});
