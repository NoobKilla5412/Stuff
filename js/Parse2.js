"use strict";
//                                   ___     _
//                                  |__ \   | |
//    _ __    __ _  _ __  ___   ___    ) |  | |_  ___
//   | '_ \  / _` || '__|/ __| / _ \  / /   | __|/ __|
//   | |_) || (_| || |   \__ \|  __/ / /_  _| |_ \__ \
//   | .__/  \__,_||_|   |___/ \___||____|(_)\__||___/
//   | |
//   |_|
define(async (req, exports) => {
  const overload = await req("overload.js");
  // const Dictatory_1 = require("./Dictionary.js");
  const Parse_1 = await req("./Parse.js");
  const { isType } = await req("typeUtils");
  const objToHTML = await req("../objToHTML.js");

  function firstLetterToLowerCase(str) {
    return overload([str], ["string"], () => str.charAt(0).toLowerCase() + str.slice(1));
  }
  exports.firstLetterToLowerCase = firstLetterToLowerCase;

  // function underlineMisspelled() {
  //   document.body.innerHTML = document.body.innerHTML.replace(
  //     /([^:])\/\/([^]*?)([^:])\/\//g,
  //     `$1<span class=misspelled>//$2$3//</span>`
  //   );
  // }
  // exports.underlineMisspelled = underlineMisspelled;

  /**
   * @param {string} url
   */
  async function fetchCB(url) {
    return overload(
      [url],
      ["string"],
      () =>
        new Promise((resolve) => {
          let elem = document.createElement("iframe");
          elem.style.display = "none";
          elem.src = url;
          elem.onload = () => {
            resolve(elem.contentWindow.document.documentElement.innerHTML);
            elem.remove();
          };
          document.body.append(elem);
        })
    );
  }
  exports.fetchCB = fetchCB;

  function addStyles(styles) {
    return overload([styles], ["any"], () => {
      for (const selector in styles) {
        if (Object.prototype.hasOwnProperty.call(styles, selector)) {
          const element = document.querySelectorAll(selector);
          for (let i = 0; i < element.length; i++) {
            const htmlElement = element[i];
            for (const key in styles[selector]) {
              if (Object.prototype.hasOwnProperty.call(styles[selector], key)) {
                const element = styles[selector][key];
                if (element) htmlElement.style[key] = element;
              }
            }
          }
        }
      }
    });
  }
  exports.addStyles = addStyles;
  function hr() {
    return overload([], [], () => document.body.append(document.createElement("hr")));
  }
  exports.hr = hr;
  function br() {
    return overload([], [], () => document.body.append(document.createElement("br")));
  }
  exports.br = br;
  function anchorify(str) {
    return overload([str], ["string"], () => {
      var // http://, https://, ftp://
        urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#/%?=~_|!:,.;]*[a-z0-9-+&@#/%=~_|]/gim,
        // www., Sans http:// or https://
        pseudoUrlPattern = /(^|[^/])(www\.[\S]+(\b|$))/gim,
        // Email addresses
        emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;
      return str
        .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
        .replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&" target="_blank">$&</a>');
    });
  }
  exports.anchorify = anchorify;
  // export async function interval(handler: Function, timeout: number) {
  //   const i = setInterval(() => {
  //     let res = handler();
  //     if (!res && res != void 0) {
  //       clearInterval(i);
  //       return Promise.resolve();
  //     }
  //   }, timeout);
  // }
  // loaded["parse2.js"] = true;

  class Timer {
    startTime;
    startOffset;
    elem;
    /**
     * Makes a new Timer object
     * @param elem The element to display the clock
     * @param startTime in milliseconds
     */
    constructor(elem, startTime) {
      this.startTime = new Date().getTime();
      this.elem = elem;
      this.startOffset = startTime || 0;
      let seconds = Math.floor(((this.startOffset / 1000) % 60) * 1000) / 1000;
      elem.innerHTML =
        (Math.floor(this.startOffset / 1000 / 60) + "").padStart(2, "0") +
        "m " +
        (seconds + (seconds % 1 == 0 ? ".000" : "")).padEnd(5, "0") +
        "s";
    }
    interval;
    started = false;
    startStop() {
      if (!this.started) {
        let start = new Date().getTime() - this.startOffset;
        this.interval = setInterval(() => {
          this.elem.innerHTML =
            (Math.floor((new Date().getTime() - start) / 1000 / 60) + "").padStart(2, "0") +
            "m " +
            (Math.floor((((new Date().getTime() - start) / 1000) % 60) * 1000) / 1000 + "").padEnd(5, "0") +
            "s";
        });
        this.started = true;
      } else {
        clearInterval(this.interval);
        this.started = false;
      }
    }
  }
  exports.Timer = Timer;
  /**
   * @param {readonly string[][]} table
   * @param {Partial<any>=} options
   */
  function parseTable(table, options) {
    return overload([table, options], ["any[][]", "any | undefined"], () => {
      options = Parse_1.getOptions(options);
      let tableRes = [];
      table.forEach((row, y) => {
        tableRes[y] = [];
        row.forEach((col, x) => {
          tableRes[y][x] = objToHTML(col, (str) => Parse_1.parse(str, options));
        });
      });
      return tableRes;
    });
  }
  exports.parseTable = parseTable;
  function arrayToTable(array) {
    return csvToTable(tableToCSV(array));
  }
  exports.arrayToTable = arrayToTable;
  function tableToCSV(table) {
    let res = "";
    table.forEach((element) => {
      element = element.map((value) =>
        (isType(value, "string") ? value : objToHTML(value)).replace(/,/g, "&#44;").replace(/\n/g, "<br>")
      );
      res += element.join(",") + "\n";
    });
    return res;
  }
  exports.tableToCSV = tableToCSV;
  function csvToTable(csv_string) {
    let rows = csv_string.trim().split(/\r?\n|\r/); // Regex to split/separate the CSV rows
    let table_rows = "";
    let table_header = "";
    rows.forEach((row, row_index) => {
      let table_columns = "";
      let columns = row.split(","); // split/separate the columns in a row
      columns.forEach((column) => {
        table_columns += row_index == 0 ? "<th>" + column + "</th>" : "<td>" + column + "</td>";
      });
      if (row_index == 0) {
        table_header += "<tr>" + table_columns + "</tr>";
      } else {
        table_rows += "<tr>" + table_columns + "</tr>";
      }
    });
    return `<table border="1"><thead>${table_header}</thead><tbody>${table_rows}</tbody></table>`;
  }
  exports.csvToTable = csvToTable;
  /**
   * @param html An html string
   * @returns Escaped html string
   */
  function escapeHTML(html) {
    return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "\\n");
  }
  exports.escapeHTML = escapeHTML;
  function write(tagName, options, ...data) {
    // const type = ...args[0];
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const elem = document.createElement(tagName, options);
      // if (options)
      //   for (const option in options) {
      //     if (Object.prototype.hasOwnProperty.call(options, option)) {
      //       if (typeof options[option] == "object" && option == "style") {
      //         for (const key in option) {
      //           if (Object.prototype.hasOwnProperty.call(option, key)) {
      //             const element2 = option[key];
      //             if (key == "textAlign") elem.style.textAlign = element2;
      //           }
      //         }
      //       } else {
      //         const element1 = options[option];
      //         elem[option] = element1;
      //       }
      //     }
      //   }
      // if (elem.tagName == 'HTMLTableElement') elem.border = options.border;
      elem.innerHTML = element;
      document.body.append(elem);
      return elem;
    }
    const elem = document.createElement(tagName, options);
    document.body.append(elem);
    return elem;
  }
  exports.write = write;
  function logError(err) {
    console.error(err);
    log(`<span style="color:red">${err}</span>`);
    console.log(`<span style="color:red">${err}</span>`);
  }
  exports.logError = logError;
  function log(...data) {
    for (let i = 0; i < data.length; i++) {
      const elem = document.createElement("pre");
      let date = new Date();
      elem.innerHTML =
        (date.getHours() % 12) +
        ":" +
        (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
        ":" +
        (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()) +
        " " +
        (date.getHours() > 12 ? "PM" : "AM") +
        ": " +
        (typeof data[i] == "object" ? JSON.stringify(data[i]) : data[i]);
      document.body.append(elem);
    }
  }
  exports.log = log;

  /**
   * @param {HTMLElement} el
   */
  function textNodesUnder(el) {
    var n,
      a = [],
      walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    while ((n = walk.nextNode())) a.push(n);
    return a;
  }

  function parseAllHTML(elem) {
    let text = textNodesUnder(elem || document.body);
    Parse_1.parseOptions.replaceNewLines = false;
    for (let i = 0; i < text.length; i++) {
      const element = text[i];
      element.nodeValue = Parse_1.parse(element.nodeValue);
    }
  }
  exports.parseAllHTML = parseAllHTML;

  // console.log = (str1) => {
  //  let element: HTMLPreElement = document.createElement('pre');
  //  element.innerHTML = str1;
  //  element.style.display = 'block';
  //  document.body.appendChild(element);
  // };
  exports.done1 = false;
  let canvas1 = "https://csd509j.instructure.com/";
  function makeHead({ favicon = "", canvas, title, styles = "", done = false, editable = false }) {
    exports.done1 = done;
    if (favicon) {
      let elem = document.createElement("link");
      elem.rel = "shortcut icon";
      elem.type = "image/x-icon";
      elem.href = favicon;
      document.head.appendChild(elem);
    }
    canvas1 = canvas || canvas1;
    document.title = title;
    if (!exports.done1) {
      const a = document.createElement("a");
      a.href = canvas1;
      a.innerHTML = "Canvas";
      a.target = "_blank";
      a.style.display = "block";
      a.style.width = "fit-content";
      document.body.appendChild(a);
    }
    if (editable) document.querySelector("html").contentEditable = "true";
    const stylesElem = document.createElement("style");
    stylesElem.innerHTML = styles || "";
    document.head.append(stylesElem);
  }
  exports.makeHead = makeHead;

  function objectIncludes(obj, key, mode = "key") {
    var res = false;
    for (const key1 in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key1)) {
        if (mode == "key") {
          if (new RegExp(key1, "g").test(key.toString())) res = true;
        } else if (mode == "value") {
          if (obj[key1] == key) res = true;
        }
      }
    }
    return res;
  }
  exports.objectIncludes = objectIncludes;
  exports.defaultOptions = {
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
      target: "",
      bold: false
    }
  };
  function makeList(
    list,
    options = {
      type: "ol",
      lineSpacing: 1,
      logNumberOfUnanswered: true
    }
  ) {
    if (options.type == undefined) {
      options.type = "ol";
    }
    if (options.lineSpacing == undefined) {
      options.lineSpacing = 1;
    }
    if (options.logNumberOfUnanswered == undefined) {
      options.logNumberOfUnanswered = true;
    }
    let unanswered = 0;
    // if (!initiated)
    //   throw new Error('Not initiated')
    let listHTML = document.createElement("ol");
    let isDiv = false;
    /* if (options.id) {
      listHTML = document.getElementById(options.id);
    } else  */ if (options.type == "ol") {
      isDiv = false;
      listHTML = document.createElement("ol");
    } else if (options.type == "ul") {
      isDiv = false;
      listHTML = document.createElement("ul");
    } /* else if (type == 'div') {
      isDiv = true;
      listHTML = document.createElement<'div'>('div');
    } */
    listHTML.type = options.type || "1";
    let answers = "";
    list.forEach((value) => {
      let question = value.question;
      if (!isLink(value) && !(/* parse( */ value.answer) /* , true) */) {
        value.answer = `${exports.done1 ? "" : '<span\\_style=\\"color:blue;\\">'} I don't have an answer.${
          exports.done1 ? "" : "</span>"
        }`;
        unanswered++;
        console.log();
        listItemText(value, listHTML, isDiv, question);
        return;
      }
      if (isUL(value)) {
        if (!value.options) value.options = exports.questionOptions.ul;
        answers = `<${isDiv ? "p" : "li"}>${(0, Parse_1.parse)(question)}<ul>`;
        if (Array.isArray(value.answer))
          value.answer.forEach((answer) => {
            answers += `<li>${value.options?.bold ? "<b>" : ""}${(0, Parse_1.parse)(answer)}${
              value.options?.bold ? "</b>" : ""
            }</li>`;
          });
        listHTML.innerHTML += answers + `</ul></${isDiv ? "p" : "li"}>`;
      } else if (isOL(value)) {
        if (!value.options) value.options = exports.questionOptions.ol;
        // @ts-ignore
        answers = `<${isDiv ? "p" : "li"}>${(0, Parse_1.parse)(question)}<ol type="${value.options.type}">`;
        if (Array.isArray(value.answer))
          value.answer.forEach((answer) => {
            answers += `<li>${value.options?.bold ? "<b>" : ""}${(0, Parse_1.parse)(answer)}${
              value.options?.bold ? "</b>" : ""
            }</li>`;
          });
        listHTML.innerHTML += answers + `</ol></${isDiv ? "p" : "li"}>`;
      } else if (isP(value)) {
        if (!value.options) value.options = exports.questionOptions.p;
        // @ts-ignore
        if (!value.options.list)
          listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${isDiv ? "" : (0, Parse_1.parse)(question)}${isDiv ? "" : "<br>"}${
            value.options.bold ? "<b>" : ""
          }<p>${(0, Parse_1.parse)(Array.isArray(value.answer) ? value.answer.join(", ") : value.answer)}${
            value.options.bold ? "</b>" : ""
          }</p></${isDiv ? "p" : "li"}>`;
        else {
          answers = `<${isDiv ? "p" : "li"}>${(0, Parse_1.parse)(question)}<br>`;
          if (Array.isArray(value.answer))
            value.answer.forEach((answer) => {
              // @ts-ignore
              answers += `<p>${value.options.bold ? "<b>" : ""}${(0, Parse_1.parse)(answer)}${
                value.options.bold ? "</b>" : ""
              }</p>`;
            });
          listHTML.innerHTML += answers + `</${isDiv ? "p" : "li"}>`;
        }
      } else if (isLink(value)) {
        if (!value.options) value.options = exports.questionOptions.link;
        listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${isDiv ? "" : (0, Parse_1.parse)(question)}${isDiv ? "" : "<br>"}${
          value.options.bold ? "<b>" : ""
        }<a href="${value.link}" target="${value.options.target}">${
          (0, Parse_1.parse)(value.text ? value.text : "") || "link"
        }</a>${value.options.bold ? "</b>" : ""}</${isDiv ? "p" : "li"}>`;
      } else if (isText(value)) {
        listItemText(value, listHTML, isDiv, question);
      }
    });
    if (options.logNumberOfUnanswered && !exports.done1) log(`unanswered: ${unanswered < 10 ? "0" + unanswered : unanswered}`);
    document.body.appendChild(listHTML);
    if (options.logNumberOfUnanswered && !exports.done1) log(`unanswered: ${unanswered < 10 ? "0" + unanswered : unanswered}`);
  }
  exports.makeList = makeList;
  function listItemText(value, listHTML, isDiv, question) {
    if (!value.options) value.options = exports.questionOptions.text;
    listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${isDiv ? "" : (0, Parse_1.parse)(question)}${isDiv ? "" : "<br>"}${
      value.options.bold ? "<b>" : ""
    }${(0, Parse_1.parse)(Array.isArray(value.answer) ? value.answer.join(", ") : value.answer)}${
      value.options.bold ? "</b>" : ""
    }</${isDiv ? "p" : "li"}>`;
  }
  exports.questionOptions = {
    link: exports.defaultOptions.link,
    ol: exports.defaultOptions.ol,
    p: exports.defaultOptions.p,
    text: exports.defaultOptions.text,
    ul: exports.defaultOptions.ul
  };
  function isLink(arg) {
    return arg.type == "link";
  }
  function isUL(arg) {
    return arg.type == "ul";
  }
  function isOL(arg) {
    return arg.type == "ol";
  }
  function isP(arg) {
    return arg.type == "p";
  }
  function isText(arg) {
    return arg.type == "text" || !arg.type;
  }

  return;
});
// define("js/Parse2.js", (exports, require) => {
//   Requires("js/Dictatory.js");
//   exports.default = class Parse2 {
//     static csvToTable(csv_string, element_to_insert_table) {
//       let rows = csv_string.trim().split(/\r?\n|\r/); // Regex to split/separate the CSV rows
//       let table = "";
//       let table_rows = "";
//       let table_header = "";
//       rows.forEach((row, row_index) => {
//         let table_columns = "";
//         let columns = row.split(","); // split/separate the columns in a row
//         columns.forEach((column, column_index) => {
//           table_columns += row_index == 0 ? "<th>" + column + "</th>" : "<td>" + column + "</td>";
//         });
//         if (row_index == 0) {
//           table_header += "<tr>" + table_columns + "</tr>";
//         } else {
//           table_rows += "<tr>" + table_columns + "</tr>";
//         }
//       });
//       // table += "<table>";
//       // table += "<thead>";
//       // table += table_header;
//       // table += "</thead>";
//       // table += "<tbody>";
//       // table += table_rows;
//       // table += "</tbody>";
//       // table += "</table>";
//       table += `<thead>${table_header}</thead><tbody>${table_rows}</tbody>`;
//       element_to_insert_table.innerHTML += table;
//     }
//     /**
//      * @param html An html string
//      * @returns Escaped html string
//      */
//     static escapeHTML(html) {
//       return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
//     }
//     static write(type, options, ...data) {
//       // const type = ...args[0];
//       for (let i = 0; i < data.length; i++) {
//         const element = data[i];
//         const elem = document.createElement(type);
//         if (options)
//           for (const option in options) {
//             if (Object.prototype.hasOwnProperty.call(options, option)) {
//               if (typeof options[option] == "object" && option == "style") {
//                 for (const key in option) {
//                   if (Object.prototype.hasOwnProperty.call(option, key)) {
//                     const element2 = option[key];
//                     if (key == "textAlign") elem.style.textAlign = element2;
//                   }
//                 }
//               } else {
//                 const element1 = options[option];
//                 elem[option] = element1;
//               }
//             }
//           }
//         // if (elem.tagName == 'HTMLTableElement') elem.border = options.border;
//         elem.innerHTML = element;
//         document.body.append(elem);
//       }
//       return void 0;
//     }
//     static logError(err) {
//       console.error(err);
//       this.log(`<span style="color:red">${err}</span>`);
//       console.log(`<span style="color:red">${err}</span>`);
//     }
//     static log(...data) {
//       for (let i = 0; i < data.length; i++) {
//         const elem = document.createElement("pre");
//         let date = new Date();
//         elem.innerHTML =
//           (date.getHours() % 12) +
//           ":" +
//           (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
//           ":" +
//           (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()) +
//           " " +
//           (date.getHours() > 12 ? "PM" : "AM") +
//           ": " +
//           (typeof data[i] == "object" ? JSON.stringify(data[i]) : data[i]);
//         document.body.append(elem);
//       }
//     }
//     static {
//       this.parse2Data = {
//         numbersLt10: [
//           "zero",
//           "one",
//           "two",
//           "three",
//           "four",
//           "five",
//           "six",
//           "seven",
//           "eight",
//           "nine"
//         ],
//         numbersGt10: {
//           10: "ten",
//           11: "eleven",
//           12: "twelve",
//           13: "thirteen",
//           14: "fourteen",
//           15: "fifteen",
//           16: "sixteen",
//           17: "seventeen",
//           18: "eighteen",
//           19: "nineteen",
//           20: "twenty"
//         },
//         spellWords: {
//           "Avocadoe*s": "Avocados",
//           // "Bea+tle": "Beetle",
//           "Me+t+ings": "Meetings",
//           "Rain\\s*forests": "Rain forests",
//           "Va+gas": "Vegas",
//           "Vocan*b*n*ulary": "Vocabulary",
//           "teh|hte|het|eth|eht": "the",
//           "abrige": "abridge",
//           "achie*ve": "achieve",
//           "alot": "a lot",
//           "asses+ment": "assessment",
//           "auth[eu]r": "author",
//           "aw*kward": "awkward",
//           "belie*ve": "believe",
//           "biog[ro]*pha*y": "biography",
//           "chro+mebook[’']s": "Chromebook's",
//           "conco*i*liatory": "conciliatory",
//           "cool+y": "coolly",
//           "defin[aeiou]*tely": "definitely",
//           "end[aeiou]*vour": "endeavour",
//           "flamingoe+s": "flamingos",
//           "gr[ea]*t[ae]*ful": "grateful",
//           "lo+king": "looking",
//           "me*t+ings": "meetings",
//           "napoleon": "Napoleon",
//           "s*dismantled": "dismantled",
//           "sg+ortened": "shortened",
//           "sin+m*ging": "singing",
//           "t[ri]+nomi[la]*(s*)": "trinomial$1",
//           "tgat": "that",
//           "thier": "their",
//           "tom*or+ow": "tomorrow",
//           "twinkies": "Twinkies",
//           "wierd": "weird",
//           "coeffici*ent(s*)": "coefficient$1",
//           "eqn(s*)": "equation$1",
//           "mole*[uc]*lu*[le]*s": "molecules",
//           "wat[er]*": "water",
//           "dis+ap+e+a*r": "disappear",
//           "su[pr]{2}is[ea]*d": "surprised",
//           "heavear": "heavier",
//           "enegry": "energy",
//           "fules": "fuels"
//         },
//         grammarFixes: {
//           "i": "I",
//           ",([^ ])": ", $1"
//         }
//       };
//     }
//     // console.log = (str1) => {
//     //  let element: HTMLPreElement = document.createElement('pre');
//     //  element.innerHTML = str1;
//     //  element.style.display = 'block';
//     //  document.body.appendChild(element);
//     // };
//     static {
//       this.assignment = false;
//     }
//     static {
//       this.done1 = false;
//     }
//     static {
//       this.canvas1 = "https://csd509j.instructure.com/";
//     }
//     static makeHead({ favicon = "", canvas, title, styles = "", done = false, editable = false }) {
//       this.done1 = done;
//       let elem = document.createElement("link");
//       elem.rel = "shortcut icon";
//       elem.type = "image/x-icon";
//       elem.href = favicon;
//       document.head.appendChild(elem);
//       this.canvas1 = canvas || this.canvas1;
//       document.title = title;
//       this.assignment = true;
//       if (!this.done1) {
//         const a = document.createElement("a");
//         a.href = this.canvas1;
//         a.innerHTML = "Canvas";
//         a.target = "_blank";
//         a.style.display = "block";
//         a.style.width = "fit-content";
//         document.body.appendChild(a);
//       }
//       if (editable) document.querySelector("html").contentEditable = "true";
//       const stylesElem = document.createElement("style");
//       stylesElem.innerHTML = styles || "";
//       document.head.append(stylesElem);
//     }
//     static {
//       this.parse2DefaultOptions = {
//         "formatMath": false,
//         "lineSpacing": 1,
//         "replaceExponents": true,
//         "replaceHTML%Codes": true,
//         "replaceNewLines": true,
//         "replaceNumbers": true,
//         "replaceSubScript": true,
//         "replaceTabs": true,
//         "spellCheck": true,
//         "tabSize": 2,
//         "useDoubleDashes": true,
//         "useFancyQuotes": true,
//         "deleteChars": {
//           enable: false,
//           chars: ["a", "e", "i", "o", "u"]
//         },
//         "customReplace": {
//           enable: false,
//           values: []
//         },
//         "fixGrammar": true,
//         "highlightMisspelled": false
//       };
//     }
//     static objectIncludes(obj, key, mode = "key") {
//       var res = false;
//       for (const key1 in obj) {
//         if (Object.prototype.hasOwnProperty.call(obj, key1)) {
//           if (mode == "key") {
//             if (new RegExp(key1, "g").test(key)) res = true;
//           } else if (mode == "value") {
//             if (obj[key1] == key) res = true;
//           }
//         }
//       }
//       return res;
//     }
//     /**
//      * @param {string} str The string to parse
//      */
//     static parse(str, options = this.parse2DefaultOptions) {
//       if (options.highlightMisspelled && !this.done1) {
//         let wordsArr = str.split(" ");
//         wordsArr.forEach((word, i) => {
//           if (
//             !Dictatory.words.includes(word?.toLowerCase()?.replace(/[^\w]/g, "")) &&
//             word &&
//             !/\d/.test(word) &&
//             !/<\w>/.test(word) &&
//             !/<\/\w>/.test(word) &&
//             !this.objectIncludes(this.parse2Data.spellWords, word)
//           ) {
//             wordsArr[i] = `<span class=incorrect>${word}</span>`;
//           }
//         });
//         str = wordsArr.join(" ");
//       }
//       if (options.deleteChars.enable) {
//         str = str
//           .replace(/style/g, "!1!")
//           .replace(/href/g, "!2!")
//           .replace(RegExp(`\\B[${options.deleteChars.chars}]`, "gi"), "")
//           .replace(/!1!/g, "style")
//           .replace(/!2!/g, "href");
//       }
//       if (options.customReplace.enable)
//         options.customReplace.values.forEach((value) => {
//           value.flags = value.flags || "";
//           if (!value.flags?.includes("g")) {
//             value.flags += "g";
//           }
//           str = str.replace(RegExp(value.searchValue, value.flags), value.replaceValue);
//         });
//       if (Array.isArray(str)) str = str.join("");
//       if (options.useDoubleDashes) str = str.replace(/--/g, "&mdash;");
//       if (options.formatMath) {
//         str = str
//           .replace(/([^(])\+([^\)])/g, "$1 &plus; $2")
//           .replace(/([^(])\+([^\)])/g, "$1 &plus; $2")
//           .replace(/([^])- ([^])/g, "$1 &minus; $2")
//           .replace(/([^(])\*([^\)])/g, "$1 &bullet; $2")
//           .replace(/([^(])\*([^\)])/g, "$1 &bullet; $2")
//           .replace(/([^(\\])\=([^\)>])/g, "$1 &equals; $2")
//           .replace(/([^(\\])\=([^\)>])/g, "$1 &equals; $2");
//       }
//       str = str.replace(/\\=/g, "=");
//       if (options["replaceHTML%Codes"]) {
//         str = str
//           .replace(/%h1\n/, "%h1")
//           .replace(/%h1\[style=\"([^]*)\"\]([^]*)%h1/g, `<h1 style=\\"$1">$2</h1>`)
//           .replace(/%h2\[style=\"([^]*)\"\]([^]*)%h2/g, `<h2 style=\\"$1">$2</h2>`)
//           .replace(/%h3\[style=\"([^]*)\"\]([^]*)%h3/g, `<h3 style=\\"$1">$2</h3>`)
//           .replace(/%div\[style=\"([^]*)\"\]([^]*)%div/g, `<div style=\\"$1">$2</div>`)
//           .replace(/%a\[href=\"([^]*)\"\]([^]*)%a/g, `<a href=\\"$1">$2</a>`)
//           .replace(/%br/g, "<br>");
//         for (const key in HTMLElementTagNames) {
//           if (Object.prototype.hasOwnProperty.call(HTMLElementTagNames, key)) {
//             const element = HTMLElementTagNames[key];
//             str = str.replace(new RegExp(`%${key}([^]*?)%${key}`, "g"), `<${key}>$1</${key}>`);
//           }
//         }
//         // .replace(/%p([^]*)%p/g, '<p>$1</p>');
//       }
//       if (options.replaceNumbers) {
//         this.parse2Data.numbersLt10.forEach((num, i) => {
//           let regex = `([^\\\\])%${i}`;
//           str = str.replace(RegExp(regex, "g"), `$1${num}`);
//         });
//         // this.parse2Data.numbersLt10.forEach((num, i) => {
//         //   let regex: string = '\\\\%';
//         //   regex += i;
//         //   // regex += '';
//         //   str = str
//         //     .replace(RegExp(regex, 'g'), `%${i}`);
//         // });
//         str = str.replace(/\\%(\d)/g, "%$1");
//         this.parse2Data.numbersLt10.forEach((num, i) => {
//           let regex = `%_${i}`;
//           str = str.replace(RegExp(regex, "g"), (num[0]?.toUpperCase() || "") + num.slice(1));
//         });
//         for (const i in this.parse2Data.numbersGt10) {
//           if (Object.hasOwnProperty.call(this.parse2Data.numbersGt10, i)) {
//             const num = this.parse2Data.numbersGt10[i];
//             let regex = "([^\\\\])%\\{";
//             regex += i;
//             regex += "\\}";
//             str = str.replace(RegExp(regex, "g"), `$1${num}`);
//           }
//         }
//         // for (const i in this.parse2Data.numbersGt10) {
//         //   if (Object.hasOwnProperty.call(this.parse2Data.numbersGt10, i)) {
//         //     const num = this.parse2Data.numbersGt10[i];
//         //     let regex = '\\\\%\\{';
//         //     regex += i;
//         //     regex += '\\}';
//         //     str = str
//         //       .replace(RegExp(regex, 'g'), `%{${i}}`);
//         //   }
//         // }
//         for (const i in this.parse2Data.numbersGt10) {
//           if (Object.hasOwnProperty.call(this.parse2Data.numbersGt10, i)) {
//             const num = this.parse2Data.numbersGt10[i];
//             let regex = "%_\\{";
//             regex += i;
//             regex += "\\}";
//             str = str.replace(RegExp(regex, "g"), (num[0]?.toUpperCase() || "") + num.slice(1));
//           }
//         }
//         str = str.replace(
//           /([^\\])%\{\d*\}/g,
//           `$1<font color="red">That number is greater than 20</font>`
//         );
//         str = str.replace(/\\%\{(\d+)\}/g, "%{$1}");
//       }
//       if (options.replaceSubScript)
//         str = str.replace(/_\{([^]*)\}/g, "<sub>$1</sub>").replace(/_(\d)/g, "<sub>$1</sub>");
//       if (options.replaceExponents)
//         str = str.replace(/\^\{([^]*)\}/g, "<sup>$1</sup>").replace(/\^(\d)/g, "<sup>$1</sup>");
//       if (options.useFancyQuotes) {
//         str = str
//           // .replace(/([^\\])\{"([^"“”]*)"\}/g, "$1\u201C$2\u201D")
//           .replace(/([^\\])"([^"“”]*)"/g, "$1\u201C$2\u201D")
//           .replace(/([^\\])\{'([^\{\}]*)'\}/g, "$1\u2018$2\u2019")
//           .replace(/([^\\])'/g, "$1\u2019")
//           .replace(/\\'/g, "'")
//           .replace(/\\"/g, '"')
//           .replace(/\\\{'([^]*)'\}/g, "{'$1'}");
//       }
//       if (options.replaceTabs) {
//         str = str.replace(/\t/g, "&nbsp;".repeat(options.tabSize));
//       }
//       str = str.replace(/\\"([^]*)"/g, '"$1"');
//       if (options.spellCheck) {
//         for (const key in this.parse2Data.spellWords) {
//           if (Object.hasOwnProperty.call(this.parse2Data.spellWords, key)) {
//             const element = this.parse2Data.spellWords[key];
//             let regex = `\\b${key}\\b`;
//             str = str.replace(
//               RegExp(regex, "g"),
//               (this.done1 ? "" : "<span class=misspelled>") +
//                 element +
//                 (this.done1 ? "" : "</span>")
//             );
//           }
//         }
//       }
//       if (options.replaceNewLines) {
//         str = str.replace(/\n/g, "<br>".repeat(options.lineSpacing));
//       }
//       if (options.fixGrammar) {
//         for (const key in this.parse2Data.grammarFixes) {
//           if (Object.prototype.hasOwnProperty.call(this.parse2Data.grammarFixes, key)) {
//             const element = this.parse2Data.grammarFixes[key];
//             let regex = `\\b${key}\\b`;
//             str = str.replace(RegExp(regex, "g"), element);
//           }
//         }
//         function fixSentences(seperator) {
//           let sentences = str.split(seperator);
//           sentences.forEach((sentence, i) => {
//             sentences[i] = (sentence[0]?.toUpperCase() || "") + sentence.slice(1);
//           });
//           str = sentences.join(seperator);
//         }
//         str = str.replace(/([a-z])\s*\.\s*([a-z])/gi, "$1. $2");
//         fixSentences(". ");
//         fixSentences("! ");
//         fixSentences("? ");
//         fixSentences('." ');
//         str = str.replace(/(\w) \./gi, "$1. ").replace(/([a-z])\s*,\s*([a-z])/gi, "$1, $2");
//         str = str.trim().charAt(0).toUpperCase() + str.trim().slice(1);
//       }
//       // console.log("Words: ", str.split(' '));
//       // console.log(str.split(' ').filter(value => value).join(' '));
//       // console.log(str.split(/[aeiou]/).filter(value => value).join(''));
//       // str.split(' ').filter(value => value)
//       // return ;
//       // return str.split(' ').filter(value => value).join(' ');
//       str = str.replace(/([^\\])\\_/, "$1 ");
//       return str;
//     }

//     static parseAllHTML() {
//       let options = this.parse2DefaultOptions;
//       options.replaceNewLines = false;
//       var n,
//         a = [],
//         walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
//       while ((n = walk.nextNode())) a.push(n);
//       for (let i = 0; i < a.length; i++) {
//         a[i].textContent = this.parse(a[i].textContent);
//       }
//     }

//     static {
//       this.defaultOptions = {
//         text: {
//           bold: true
//         },
//         p: {
//           list: false,
//           bold: false
//         },
//         ol: {
//           type: "1",
//           bold: true
//         },
//         ul: {
//           bold: true
//         },
//         link: {
//           target: ""
//         }
//       };
//     }
//     static makeList(
//       list,
//       options = {
//         type: "ol",
//         lineSpacing: 1,
//         parseOptions: this.parse2DefaultOptions
//       }
//     ) {
//       let unanswered = 0;
//       // if (!initiated)
//       //   throw new Error('Not initiated')
//       let listHTML = document.createElement("ol");
//       let isDiv = false;
//       /* if (options.id) {
//           listHTML = document.getElementById(options.id);
//         } else  */ if (options.type == "ol") {
//         isDiv = false;
//         listHTML = document.createElement("ol");
//       } else if (options.type == "ul") {
//         isDiv = false;
//         listHTML = document.createElement("ul");
//       } /* else if (type == 'div') {
//           isDiv = true;
//           listHTML = document.createElement<'div'>('div');
//         } */
//       listHTML.type = options.type || "1";
//       let answers = "";
//       list.forEach((value) => {
//         let question = value.question;
//         if (value.type != "link" && !(/* this.parse( */ value.answer) /* , true) */) {
//           value.answer = `${
//             this.done1 ? "" : '<span style=\\"color:blue;\\">'
//           }I don't have an answer.${this.done1 ? "" : "</span>"}`;
//           unanswered++;
//           let answered = false;
//         } else var answered = true;
//         if (value.type == "ul") {
//           if (!value.options) value.options = this.defaultOptions.ul;
//           answers = `<${isDiv ? "p" : "li"}>${this.parse(question, options.parseOptions)}<ul>`;
//           if (Array.isArray(value.answer))
//             value.answer.forEach((answer) => {
//               // @ts-ignore
//               answers += `<li>${value.options.bold ? "<b>" : ""}${this.parse(
//                 answer,
//                 options.parseOptions
//               )}${value.options.bold ? "</b>" : ""}</li>`;
//             });
//           listHTML.innerHTML += answers + `</ul></${isDiv ? "p" : "li"}>`;
//         } else if (value.type == "ol") {
//           if (!value.options) value.options = this.defaultOptions.ol;
//           // @ts-ignore
//           answers = `<${isDiv ? "p" : "li"}>${this.parse(
//             question,
//             options.parseOptions
//           )}<ol type="${value.options.type}">`;
//           if (Array.isArray(value.answer))
//             value.answer.forEach((answer) => {
//               // @ts-ignore
//               answers += `<li>${value.options.bold ? "<b>" : ""}${this.parse(
//                 answer,
//                 options.parseOptions
//               )}${value.options.bold ? "</b>" : ""}</li>`;
//             });
//           listHTML.innerHTML += answers + `</ol></${isDiv ? "p" : "li"}>`;
//         } else if (value.type == "p") {
//           if (!value.options) value.options = this.defaultOptions.p;
//           // @ts-ignore
//           if (!value.options.list)
//             listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${
//               isDiv ? "" : this.parse(question, options.parseOptions)
//             }${isDiv ? "" : "<br>"}${value.options.bold ? "<b>" : ""}<p>${this.parse(
//               Array.isArray(value.answer) ? value.answer.join(", ") : value.answer,
//               options.parseOptions
//             )}${value.options.bold ? "</b>" : ""}</p></${isDiv ? "p" : "li"}>`;
//           else {
//             answers = `<${isDiv ? "p" : "li"}>${this.parse(question, options.parseOptions)}<br>`;
//             if (Array.isArray(value.answer))
//               value.answer.forEach((answer) => {
//                 // @ts-ignore
//                 answers += `<p>${value.options.bold ? "<b>" : ""}${this.parse(
//                   answer,
//                   options.parseOptions
//                 )}${value.options.bold ? "</b>" : ""}</p>`;
//               });
//             listHTML.innerHTML += answers + `</${isDiv ? "p" : "li"}>`;
//           }
//         } else if (value.type == "link") {
//           if (!value.options) value.options = this.defaultOptions.link;
//           // @ts-ignore
//           listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${
//             isDiv ? "" : this.parse(question, options.parseOptions)
//           }${isDiv ? "" : "<br>"}${value.options.bold ? "<b>" : ""}<a href="${
//             value.link
//           }" target="${value.options.target}">${
//             this.parse(value.text ? value.text : "") || "link"
//           }</a>${value.options.bold ? "</b>" : ""}</${isDiv ? "p" : "li"}>`;
//         } else {
//           if (!value.options) value.options = this.defaultOptions.text;
//           // @ts-ignore
//           listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${
//             isDiv ? "" : this.parse(question, options.parseOptions)
//           }${isDiv ? "" : "<br>"}${value.options.bold ? "<b>" : ""}${this.parse(
//             Array.isArray(value.answer) ? value.answer.join(", ") : value.answer,
//             options.parseOptions
//           )}${value.options.bold ? "</b>" : ""}</${isDiv ? "p" : "li"}>`;
//         }
//       });
//       this.done1 || this.log(`unanswered: ${unanswered < 10 ? "0" + unanswered : unanswered}`);
//       document.body.appendChild(listHTML);
//       this.done1 || this.log(`unanswered: ${unanswered < 10 ? "0" + unanswered : unanswered}`);
//     }
//   };
//   const HTMLElementTagNames = {
//     a: HTMLAnchorElement,
//     abbr: HTMLElement,
//     address: HTMLElement,
//     area: HTMLAreaElement,
//     article: HTMLElement,
//     aside: HTMLElement,
//     audio: HTMLAudioElement,
//     b: HTMLElement,
//     base: HTMLBaseElement,
//     bdi: HTMLElement,
//     bdo: HTMLElement,
//     blockquote: HTMLQuoteElement,
//     body: HTMLBodyElement,
//     br: HTMLBRElement,
//     button: HTMLButtonElement,
//     canvas: HTMLCanvasElement,
//     caption: HTMLTableCaptionElement,
//     cite: HTMLElement,
//     code: HTMLElement,
//     col: HTMLTableColElement,
//     colgroup: HTMLTableColElement,
//     data: HTMLDataElement,
//     datalist: HTMLDataListElement,
//     dd: HTMLElement,
//     del: HTMLModElement,
//     details: HTMLDetailsElement,
//     dfn: HTMLElement,
//     dialog: HTMLDialogElement,
//     div: HTMLDivElement,
//     dl: HTMLDListElement,
//     dt: HTMLElement,
//     em: HTMLElement,
//     embed: HTMLEmbedElement,
//     fieldset: HTMLFieldSetElement,
//     figcaption: HTMLElement,
//     figure: HTMLElement,
//     footer: HTMLElement,
//     form: HTMLFormElement,
//     h1: HTMLHeadingElement,
//     h2: HTMLHeadingElement,
//     h3: HTMLHeadingElement,
//     h4: HTMLHeadingElement,
//     h5: HTMLHeadingElement,
//     h6: HTMLHeadingElement,
//     head: HTMLHeadElement,
//     header: HTMLElement,
//     hgroup: HTMLElement,
//     hr: HTMLHRElement,
//     html: HTMLHtmlElement,
//     i: HTMLElement,
//     iframe: HTMLIFrameElement,
//     img: HTMLImageElement,
//     input: HTMLInputElement,
//     ins: HTMLModElement,
//     kbd: HTMLElement,
//     label: HTMLLabelElement,
//     legend: HTMLLegendElement,
//     li: HTMLLIElement,
//     link: HTMLLinkElement,
//     main: HTMLElement,
//     map: HTMLMapElement,
//     mark: HTMLElement,
//     menu: HTMLMenuElement,
//     meta: HTMLMetaElement,
//     meter: HTMLMeterElement,
//     nav: HTMLElement,
//     noscript: HTMLElement,
//     object: HTMLObjectElement,
//     ol: HTMLOListElement,
//     optgroup: HTMLOptGroupElement,
//     option: HTMLOptionElement,
//     output: HTMLOutputElement,
//     p: HTMLParagraphElement,
//     picture: HTMLPictureElement,
//     pre: HTMLPreElement,
//     progress: HTMLProgressElement,
//     q: HTMLQuoteElement,
//     rp: HTMLElement,
//     rt: HTMLElement,
//     ruby: HTMLElement,
//     s: HTMLElement,
//     samp: HTMLElement,
//     script: HTMLScriptElement,
//     section: HTMLElement,
//     select: HTMLSelectElement,
//     slot: HTMLSlotElement,
//     small: HTMLElement,
//     source: HTMLSourceElement,
//     span: HTMLSpanElement,
//     strong: HTMLElement,
//     style: HTMLStyleElement,
//     sub: HTMLElement,
//     summary: HTMLElement,
//     sup: HTMLElement,
//     table: HTMLTableElement,
//     tbody: HTMLTableSectionElement,
//     td: HTMLTableCellElement,
//     template: HTMLTemplateElement,
//     textarea: HTMLTextAreaElement,
//     tfoot: HTMLTableSectionElement,
//     th: HTMLTableCellElement,
//     thead: HTMLTableSectionElement,
//     time: HTMLTimeElement,
//     title: HTMLTitleElement,
//     tr: HTMLTableRowElement,
//     track: HTMLTrackElement,
//     u: HTMLElement,
//     ul: HTMLUListElement,
//     var: HTMLElement,
//     video: HTMLVideoElement,
//     wbr: HTMLElement
//   };
// });
