class QuestionLogic {
  private static str: string[] = [];
  private static res: string[] = [];
  private static pos: number[] = [];
  private static length1: number[] = [];
  private static count = 0;
  private static unanswered = 0;
  private static done1 = false;
  public static assignment = false;
  private static initiated = false;
  private static canvas1 = "https://csd509j.instructure.com/";
  // var OSName = "Unknown";
  // if (window.navigator.userAgent.includes("Windows NT 10.0")) OSName = "Windows 10";
  // if (window.navigator.userAgent.includes("Windows NT 6.3")) OSName = "Windows 8.1";
  // if (window.navigator.userAgent.includes("Windows NT 6.2")) OSName = "Windows 8";
  // if (window.navigator.userAgent.includes("Windows NT 6.1")) OSName = "Windows 7";
  // if (window.navigator.userAgent.includes("Windows NT 6.0")) OSName = "Windows Vista";
  // if (window.navigator.userAgent.includes("Windows NT 5.1")) OSName = "Windows XP";
  // if (window.navigator.userAgent.includes("Windows NT 5.0")) OSName = "Windows 2000";
  // if (window.navigator.userAgent.includes("Mac")) OSName = "Mac/iOS";
  // if (window.navigator.userAgent.includes("X11")) OSName = "UNIX";
  // if (window.navigator.userAgent.includes("Linux")) OSName = "Linux";
  // var oldConsoleLog = (str1) => {
  //   console.log(str1);
  // }
  public static write = (str1: string | number) => {
    console.log(str1);
  };
  // if (OSName != 'Windows 10') {
  //   console.log = (str1) => {
  //     var element = document.createElement('pre');
  //     element.innerHTML = str1;
  //     element.style.display = 'block';
  //     document.body.appendChild(element);
  //   };
  // } else {
  //   oldConsoleLog = console.log;
  //   write = (str1) => {
  //     var element = document.createElement('pre');
  //     element.innerHTML = str1;
  //     element.style.display = 'block';
  //     document.body.appendChild(element);
  //   };
  // }
  // function logError(err) {
  // console.error(err);
  // write(`<span style="color:red">${err}</span>`);
  // console.log(`<span style="color:red">${err}</span>`);
  // }
  public static makeHead({
    favicon,
    canvas = this.canvas1,
    title,
    done = false
  }: {
    favicon: string;
    canvas?: string;
    title: string;
    done?: boolean;
  }) {
    this.done1 = done;
    var elem = document.createElement("link");
    (elem.rel = "shortcut icon"),
      (elem.type = "image/x-icon"),
      (elem.href = favicon),
      document.head.appendChild(elem),
      (this.canvas1 = canvas),
      (document.title = title),
      (this.assignment = true),
      (this.initiated = true);
    if (!this.done1) {
      const a = document.createElement("a");
      a.href = this.canvas1;
      a.innerHTML = "Canvas";
      a.target = "_blank";
      document.body.appendChild(a);
    }
  }

  public static loopStrHTML(symbol: string, tag: string, name: string, id: number) {
    if (!this.initiated) throw new Error("Not initiated");
    this.res[id] += `<${tag}>`;
    this.pos[id] += 3;
    while (
      this.str[id][this.pos[id]] +
        this.str[id][this.pos[id] + 1] +
        this.str[id][this.pos[id] + 2] !=
        symbol &&
      this.pos[id] < this.length1[id]
    ) {
      this.res[id] += this.str[id][this.pos[id]];
      this.pos[id]++;
    }
    if (
      this.str[id][this.pos[id]] +
        this.str[id][this.pos[id] + 1] +
        this.str[id][this.pos[id] + 2] !=
      symbol
    ) {
      throw new SyntaxError(`Unterminated ${name} at pos ${this.pos[id]} with an id of ${id}`);
    }
    this.res[id] += `</${tag}>`;
  }
  public static loopStr(
    symbol: string,
    tag: string,
    name: string,
    endTag: string = tag,
    id: number
  ) {
    if (!this.initiated) throw new Error("Not initiated");
    this.res[id] += tag;
    this.pos[id] += 1;
    while (
      this.str[id][this.pos[id]] /*  + this.str[id][pos + 1] */ != symbol &&
      this.pos[id] < this.length1[id]
    ) {
      this.res[id] += this.str[id][this.pos[id]];
      this.pos[id]++;
    }
    if (this.str[id][this.pos[id]] /*  + this.str[id][pos + 1] */ != symbol) {
      throw new SyntaxError(`Unterminated ${name} at pos ${this.pos[id]} with an id of ${id}`);
    }
    this.res[id] += endTag;
  }
  public static parseURL(url: string) {
    if (!this.initiated) throw new Error("Not initiated");
    // var id = this.count++;
    // this.str[id] = url;
    // this.str[id] = this.str[id].replaceAll('.', ' dot ').replaceAll('@', ' at ');
    return url.replace(/./g, " dot ").replace(/@/g, " at ");
  }
  private static i = 0;
  // const ;
  public static parseOptions = {
    spellCheck: true,
    spellWords: {
      "abrige": "abridge",
      "auther": "author",
      "Avocadoe*s": "Avocados",
      "Beatle": "Beetle",
      "chromebook[’']s": "Chromebook's",
      "conco*i*liatory": "conciliatory",
      "flamingoe+s": "flamingos",
      "me*t+ings": "meetings",
      "Me+t+ings": "Meetings",
      "napoleon": "Napoleon",
      "Rain\\s*forests": "Rain forests",
      "s*dismantled": "dismantled",
      "sgortened": "shortened",
      "sin+m*ging": "singing",
      "tgat": "that",
      "thier": "their",
      "twinkies": "Twinkies",
      "Vagas": "Vegas",
      "Vocan*b*n*ulary": "Vocabulary"
    },
    numbers: [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
      "twenty"
    ],
    numbersToWords: true,
    usePercentAsFunction: true,
    useDollorAsReturnCode: true,
    useUnderscoreAsCode: true,
    useEscaping: true
  };
  public static parse(str1: string, lineSpacing: number = 1, test: boolean = false): string {
    // if (!this.initiated)
    //   throw new Error('Not initiated');
    var id = this.count++;
    this.str[id] = str1;
    this.pos[id] = 0;
    if (lineSpacing == 0) {
      var returnChar = "&nbsp;";
    } else {
      var returnChar = "<br>".repeat(lineSpacing);
    }
    this.str[id] = this.str[id].replace(/\n/g, returnChar);
    // this.str[id] = this.str[id].replaceAll('1st', 'first');
    // spell-check
    // if (this.parseOptions.spellCheck)
    //   for (const key in this.parseOptions.spellWords) {
    //     if (Object.hasOwnProperty.call(this.parseOptions.spellWords, key)) {
    //       const element = this.parseOptions.spellWords[key];
    //       var regex = '\\b';
    //       regex += key;
    //       regex += '\\b';
    //       this.str[id] = this.str[id].replace(RegExp(regex, 'g'), `${this.done1 ? '' : '<span class=\\"misspelled\\">'}${element}${this.done1 ? '' : '</span>'}`);
    //     }
    //   }
    // /spell-check
    // Numbers
    // if (this.parseOptions.numbersToWords)
    //   this.parseOptions.numbers.forEach((number, i, array) => {
    //     var regex = '\\b';
    //     regex += i;
    //     regex += '\\b';
    //     this.str[id] = this.str[id].replace(RegExp(regex, 'g'), number);
    //   });
    // numbers.forEach((number, i, array) => {
    //   var regex = '\\b\\';
    //   regex += number;
    //   regex += '\\b';
    //   this.str[id] = this.str[id].replace(RegExp(regex, 'g'), i);
    // });
    this.length1[id] = this.str[id].length;
    this.res[id] = "";
    this.code = "";
    while (this.pos[id] < this.length1[id]) {
      var element = this.str[id][this.pos[id]];
      var letter = element + this.str[id][this.pos[id] + 1];
      if (element == "\\" && this.parseOptions.useEscaping) {
        this.res[id] += this.str[id][this.pos[id] + 1];
        this.pos[id] += 2;
      } else if (element == "%" && this.parseOptions.usePercentAsFunction) {
        var symbol = this.str[id][this.pos[id] + 1] + this.str[id][this.pos[id] + 2];
        if (symbol == "ol") {
          this.res[id] += ++this.i;
        } else if (symbol == "oi") {
          this.res[id] += this.i;
        } else if (symbol == "eo") {
          this.i = 0;
        } else if (symbol == "io") {
          this.i++;
        } else if (symbol == "bo") {
          this.loopStrHTML("%bo", "b", "bold", id);
        } else if (symbol == "bu") {
          this.res[id] += "&#x2022;";
        } else if (symbol == "h1") {
          this.loopStrHTML("%h1", "h1", "header", id);
        } else if (symbol == "h2") {
          this.loopStrHTML("%h2", "h2", "header", id);
        } else if (symbol == "h3") {
          this.loopStrHTML("%h3", "h3", "header", id);
        } else if (symbol == "it") {
          this.loopStrHTML("%it", "i", "italics", id);
        } else {
          throw new TypeError(
            `%${symbol} is not a valid % sequence. (at pos ${this.pos[id]}) with an id of ${id}`
          );
        }
        this.pos[id] += 3;
      } else if (element == "'") {
        this.res[id] += "&rsquo;";
        this.pos[id]++;
      } else if (letter == "--") {
        this.res[id] += "&mdash;";
        this.pos[id] += 2;
      } /*  else if ("0123456789".includes(element)) {
      if ("0123456789".includes(this.str[id][this.pos[id] + 1]) && letter <= 20) {
        this.res[id] += numbers[letter];
        this.pos[id]++;
      } else if (letter <= 20)
        this.res[id] += numbers[element];
      else
        this.res[id] += element;
      this.pos[id]++;
    } */ else if (element == '"') {
        var quot = "&ldquo;";
        this.pos[id]++;
        quot += this.str[id][this.pos[id]].toUpperCase();
        this.pos[id]++;
        while (this.str[id][this.pos[id]] != '"' && this.pos[id] < this.length1[id]) {
          quot += this.str[id][this.pos[id]];
          this.pos[id]++;
        }
        if (this.str[id][this.pos[id]] != '"') {
          throw new SyntaxError(`Unterminated quote at pos ${this.pos[id]}`);
        }
        this.res[id] += this.parse(quot) + "&rdquo;";
        this.pos[id]++;
      } else if (element == "_" && this.parseOptions.useUnderscoreAsCode) {
        let code = "";
        this.pos[id]++;
        while (this.str[id][this.pos[id]] != "_" && this.pos[id] < this.length1[id]) {
          code += this.str[id][this.pos[id]];
          this.pos[id]++;
        }
        if (this.str[id][this.pos[id]] != "_") {
          throw new SyntaxError(`Unterminated code at pos ${this.pos[id]}`);
        }
        this.pos[id]++;
        function out(text: string) {
          QuestionLogic.res[id] += text;
        }
        if (!test) eval(code);
      } else if (element == "$" && this.parseOptions.useDollorAsReturnCode) {
        let code = "";
        this.pos[id]++;
        while (this.str[id][this.pos[id]] !== "$" && this.pos[id] < this.length1[id]) {
          code += this.str[id][this.pos[id]];
          this.pos[id]++;
        }
        if (this.str[id][this.pos[id]] != "$") {
          throw new SyntaxError(`Unterminated return-code at pos ${this.pos[id]}`);
        }
        this.pos[id]++;
        function out(text: string) {
          QuestionLogic.res[id] += text;
        }
        this.res[id] += eval(code);
      } else {
        this.res[id] += element;
        this.pos[id]++;
      }
      // pos++;
    }

    // if (".?!".includes(this.str[id][this.pos[id]]))
    return this.res[id];
    // else
    //   if (!test)
    //     throw new Error(`No period at the end at pos ${this.pos[id]} and id ${id}`);
  }
  public static testParse() {
    if (!this.initiated) throw new Error("Not initiated");
    console.assert(
      true,
      '\\% \\$ \\_ \\\\ %ol %oi %eo %boHi%bo %un %heHi%he %itHi%it \' "Hi" _out("Hi")_ $"Hi"$\n' +
        this.parse(
          '\\% \\$ \\_ \\\\ %ol %oi %eo %boHi%bo %un %heHi%he %itHi%it \' "Hi" _out("Hi")_ $"Hi"$\n'
        )
    );
  }
  public static parseText(text: string, type = "div") {
    if (!this.initiated) throw new Error("Not initiated");
    var textHTML = document.createElement(type || "div");
    textHTML.innerHTML = this.parse(text);
    document.body.appendChild(textHTML);
  }
  public static parseList(text: string[], type = "ol") {
    if (!this.initiated) throw new Error("Not initiated");
    var listHTML = document.createElement("ol");
    if (type == "ol") {
      listHTML = document.createElement("ol");
    } else if (type == "ul") {
      // @ts-ignore
      listHTML = document.createElement("ul");
    }
    text.forEach((currentItem) => {
      listHTML.innerHTML += `<li>${this.parse(currentItem)}</li>`;
    });
    document.body.appendChild(listHTML);
  }
  private static defaultOptions = {
    text: {
      bold: true
    },
    p: {
      list: false,
      bold: false
    },
    ol: {
      type: "1",
      bold: true
    },
    ul: {
      bold: true
    },
    link: {
      target: ""
    }
  };
  public static makeList(
    list: object,
    type = "ol",
    options = { type: "1", lineSpacing: 1, id: "" }
  ) {
    if (!this.initiated) throw new Error("Not initiated");
    var listHTML = document.createElement("ol");
    var isDiv = false;
    if (options.id) {
      // @ts-ignore
      listHTML = document.getElementById(options.id);
    } else if (type == "ol") {
      // @ts-ignore
      listHTML = document.createElement("ol");
    } else if (type == "ul") {
      // @ts-ignore
      listHTML = document.createElement("ul");
    } else if (type == "div") {
      isDiv = true;
      // @ts-ignore
      listHTML = document.createElement("div");
    }
    listHTML.type = options.type;
    var answers = "";
    for (const question in list) {
      if (Object.hasOwnProperty.call(list, question)) {
        let value = list[question];
        if (value.type != "link" && !(/* this.parse( */ value.answer) /* , true) */) {
          value.answer = `${
            this.done1 ? "" : '<span style=\\"color:blue;\\">'
          }I don\'t know the answer.${this.done1 ? "" : "</span>"}`;
          this.unanswered++;
          var answered = false;
        } else var answered = true;
        if (value.type == "ul") {
          if (!value.options) value.options = this.defaultOptions.ul;
          answers = `<${isDiv ? "p" : "li"}>${this.parse(question)}<ul>`;
          value.answer.forEach((answer: string) => {
            answers += `<li>${value.options.bold ? "<b>" : ""}${this.parse(
              answer,
              options.lineSpacing,
              !answered
            )}${value.options.bold ? "</b>" : ""}</li>`;
          });
          listHTML.innerHTML += answers + `</ul></${isDiv ? "p" : "li"}>`;
        } else if (value.type == "ol") {
          if (!value.options) value.options = this.defaultOptions.ol;
          answers = `<${isDiv ? "p" : "li"}>${this.parse(question)}<ol type="${
            value.options.type
          }">`;
          value.answer.forEach((answer: string) => {
            answers += `<li>${value.options.bold ? "<b>" : ""}${this.parse(
              answer,
              options.lineSpacing,
              !answered
            )}${value.options.bold ? "</b>" : ""}</li>`;
          });
          listHTML.innerHTML += answers + `</ol></${isDiv ? "p" : "li"}>`;
        } else if (value.type == "p") {
          if (!value.options) value.options = this.defaultOptions.p;
          if (!value.options.list)
            listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${isDiv ? this.parse(question) : ""}${
              isDiv ? "" : "<br>"
            }${value.options.bold ? "<b>" : ""}<p>${this.parse(
              value.answer,
              options.lineSpacing,
              !answered
            )}${value.options.bold ? "</b>" : ""}</p></${isDiv ? "p" : "li"}>`;
          else {
            answers = `<${isDiv ? "p" : "li"}>${this.parse(question)}<br>`;
            value.answer.forEach((answer: string) => {
              answers += `<p>${value.options.bold ? "<b>" : ""}${this.parse(
                answer,
                options.lineSpacing,
                !answered
              )}${value.options.bold ? "</b>" : ""}</p>`;
            });
            listHTML.innerHTML += answers + `</${isDiv ? "p" : "li"}>`;
          }
        } else if (value.type == "link") {
          if (!value.options) value.options = this.defaultOptions.link;
          listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${isDiv ? this.parse(question) : ""}${
            isDiv ? "" : "<br>"
          }${value.options.bold ? "<b>" : ""}<a href="${value.link}" target="${
            value.options.target
          }">${this.parse(value.text, options.lineSpacing, !answered) || "link"}</a>${
            value.options.bold ? "</b>" : ""
          }</${isDiv ? "p" : "li"}>`;
        } else {
          if (!value.options) value.options = this.defaultOptions.text;
          listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${isDiv ? this.parse(question) : ""}${
            isDiv ? "" : "<br>"
          }${value.options.bold ? "<b>" : ""}${this.parse(
            value.answer,
            options.lineSpacing,
            !answered
          )}${value.options.bold ? "</b>" : ""}</${isDiv ? "p" : "li"}>`;
        }
      }
    }
    this.done1 || console.log(`unanswered: ${this.unanswered}`);
    options.id || document.body.appendChild(listHTML);
    this.done1 || console.log(`unanswered: ${this.unanswered}`);
  }

  public static parseLink(link: string, text: string, options = this.defaultOptions.link) {
    if (!this.initiated) throw new Error("Not initiated");
    if (!options) options = this.defaultOptions.link;
    return `${options.bold ? "<b>" : ""}<a href="${link}" target="${options.target}">${
      this.parse(text, 1, false) || "link"
    }</a>${options.bold ? "</b>" : ""}`;
  }

  public static parseQuote(str1: string, level: string) {
    if (!this.initiated) throw new Error("Not initiated");
    var id = this.count++;
    this.str[id] = "";
    if (level == "'") {
      this.str[id] += "&lsquo;";
      this.str[id] += this.parse(str1);
      this.str[id] += "&rsquo;";
    } else if (level == '"') {
      this.str[id] += "&ldquo;";
      this.str[id] += this.parse(str1);
      this.str[id] += "&rdquo;";
    } else {
      throw new TypeError("That is not a valid quote char");
    }
    return this.str[id];
  }
  // this.done1 && window.print();

  /* const defaultTableOptions = {
  border: '1px'
};
function makeTable(list, tableId, options = defaultTableOptions) {
  var table = document.createElement('table');
  if (tableId)
    table = document.getElementById(table);
  table.border = options.border;
  for (let question in list) {
    if (Object.hasOwnProperty.call(list, question)) {
      let answer = list[question];
      if (question != 'title') {
        let defaultAnswer = "I can't find the answer.";
        if (list == words) {
          if (answer != '') {
            table.innerHTML += `<tr><td>${this.parse(question)} (dictionary)</td><td>${this.parse(answer)}</td></tr>`;
          } else {
            table.innerHTML += `<tr><td>${this.parse(question)} (dictionary)</td><td>${this.parse(defaultAnswer)}</td></tr>`;
          }
        } else {
          if (answer != '') {
            table.innerHTML += `<tr><td>${this.parse(question)}</td><td>${this.parse(answer)}</td></tr>`;
          } else {
            table.innerHTML += `<tr><td>${this.parse(question)}</td><td>${this.parse(defaultAnswer)}</td></tr>`;
          }
        }
      } else {
        
      }
    }
  }
  if (!tableId)
    document.body.appendChild(table);
} */
}
