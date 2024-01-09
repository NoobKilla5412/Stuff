//                                   ___     _
//                                  |__ \   | |
//    _ __    __ _  _ __  ___   ___    ) |  | |_  ___
//   | '_ \  / _` || '__|/ __| / _ \  / /   | __|/ __|
//   | |_) || (_| || |   \__ \|  __/ / /_  _| |_ \__ \
//   | .__/  \__,_||_|   |___/ \___||____|(_)\__||___/
//   | |
//   |_|
// loaded["parse2.js"] = true;
class Parse2 {
  public static csvToTable(csv_string: string, element_to_insert_table: HTMLElement) {
    let rows: string[] = csv_string.trim().split(/\r?\n|\r/); // Regex to split/separate the CSV rows
    let table: string = "";
    let table_rows: string = "";
    let table_header: string = "";

    rows.forEach((row, row_index) => {
      let table_columns: string = "";
      let columns: string[] = row.split(","); // split/separate the columns in a row
      columns.forEach((column, column_index) => {
        table_columns += row_index == 0 ? "<th>" + column + "</th>" : "<td>" + column + "</td>";
      });
      if (row_index == 0) {
        table_header += "<tr>" + table_columns + "</tr>";
      } else {
        table_rows += "<tr>" + table_columns + "</tr>";
      }
    });

    // table += "<table>";
    // table += "<thead>";
    // table += table_header;
    // table += "</thead>";
    // table += "<tbody>";
    // table += table_rows;
    // table += "</tbody>";
    // table += "</table>";
    table += `<thead>${table_header}</thead><tbody>${table_rows}</tbody>`;

    element_to_insert_table.innerHTML += table;
  }
  /**
   * @param html An html string
   * @returns Escaped html string
   */
  public static escapeHTML(html: string) {
    return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  public static write<K extends keyof HTMLElementTagNameMap>(
    type: K,
    options?: HTMLElementTagNameMap[K],
    ...data: string[]
  ): void {
    // const type = ...args[0];
    for (let i: number = 0; i < data.length; i++) {
      const element = data[i];
      const elem = document.createElement(type);
      if (options)
        for (const option in options) {
          if (Object.prototype.hasOwnProperty.call(options, option)) {
            if (typeof options[option] == "object" && option == "style") {
              for (const key in option) {
                if (Object.prototype.hasOwnProperty.call(option, key)) {
                  const element2 = option[key];
                  if (key == "textAlign") elem.style.textAlign = element2;
                }
              }
            } else {
              const element1 = options[option];
              elem[option] = element1;
            }
          }
        }
      // if (elem.tagName == 'HTMLTableElement') elem.border = options.border;
      elem.innerHTML = element;
      document.body.append(elem);
    }
    return void 0;
  }
  public static logError(err: any): void {
    console.error(err);
    this.log(`<span style="color:red">${err}</span>`);
    console.log(`<span style="color:red">${err}</span>`);
  }
  public static log(...data: any[]): void {
    for (let i: number = 0; i < data.length; i++) {
      const elem = document.createElement("pre");
      let date: Date = new Date();
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
  private static parse2Data: {
    numbersLt10: string[];
    numbersGt10: {
      [index: number]: string;
      10: string;
      11: string;
      12: string;
      13: string;
      14: string;
      15: string;
      16: string;
      17: string;
      18: string;
      19: string;
      20: string;
    };
    spellWords: { [index: string]: string };
    grammarFixes: { [index: string]: string };
  } = {
    numbersLt10: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"],
    numbersGt10: {
      10: "ten",
      11: "eleven",
      12: "twelve",
      13: "thirteen",
      14: "fourteen",
      15: "fifteen",
      16: "sixteen",
      17: "seventeen",
      18: "eighteen",
      19: "nineteen",
      20: "twenty"
    },
    spellWords: {
      "Avocadoe*s": "Avocados",
      // "Bea+tle": "Beetle",
      "Me+t+ings": "Meetings",
      "Rain\\s*forests": "Rain forests",
      "Va+gas": "Vegas",
      "Vocan*b*n*ulary": "Vocabulary",
      "teh|hte|het|eth|eht": "the",
      "abrige": "abridge",
      "achie*ve": "achieve",
      "alot": "a lot",
      "asses+ment": "assessment",
      "auth[eu]r": "author",
      "aw*kward": "awkward",
      "belie*ve": "believe",
      "biog[ro]*pha*y": "biography",
      "chro+mebook[’']s": "Chromebook's",
      "conco*i*liatory": "conciliatory",
      "cool+y": "coolly",
      "defin[aeiou]*tely": "definitely",
      "end[aeiou]*vour": "endeavour",
      "flamingoe+s": "flamingos",
      "gr[ea]*t[ae]*ful": "grateful",
      "lo+king": "looking",
      "me*t+ings": "meetings",
      "napoleon": "Napoleon",
      "s*dismantled": "dismantled",
      "sg+ortened": "shortened",
      "sin+m*ging": "singing",
      "t[ri]+nomi[la]*(s*)": "trinomial$1",
      "tgat": "that",
      "thier": "their",
      "tom*or+ow": "tomorrow",
      "twinkies": "Twinkies",
      "wierd": "weird",
      "coeffici*ent(s*)": "coefficient$1",
      "eqn(s*)": "equation$1",
      "mole*[uc]*lu*[le]*s": "molecules",
      "wat[er]*": "water",
      "dis+ap+e+a*r": "disappear",
      "su[pr]{2}is[ea]*d": "surprised",
      "heavear": "heavier",
      "enegry": "energy",
      "fules": "fuels"
    },
    grammarFixes: {
      "i": "I",
      ",([^ ])": ", $1"
    }
  };
  // console.log = (str1) => {
  //  let element: HTMLPreElement = document.createElement('pre');
  //  element.innerHTML = str1;
  //  element.style.display = 'block';
  //  document.body.appendChild(element);
  // };
  public static assignment = false;
  private static done1 = false;
  private static canvas1 = "https://csd509j.instructure.com/";

  public static makeHead({
    favicon = "",
    canvas,
    title,
    styles = "",
    done = false,
    editable = false
  }: {
    favicon?: string;
    canvas?: string;
    title: string;
    styles?: string;
    done?: boolean;
    editable?: boolean;
  }) {
    this.done1 = done;
    let elem: HTMLLinkElement = document.createElement("link");
    elem.rel = "shortcut icon";
    elem.type = "image/x-icon";
    elem.href = favicon;
    document.head.appendChild(elem);
    this.canvas1 = canvas || this.canvas1;
    document.title = title;
    this.assignment = true;
    if (!this.done1) {
      const a = document.createElement("a");
      a.href = this.canvas1;
      a.innerHTML = "Canvas";
      a.target = "_blank";
      a.style.display = "block";
      a.style.width = "fit-content";
      document.body.appendChild(a);
    }
    if (editable) document.querySelector("html")!.contentEditable = "true";
    const stylesElem = document.createElement("style");
    stylesElem.innerHTML = styles || "";
    document.head.append(stylesElem);
  }
  public static parse2DefaultOptions: parse2Options = {
    "formatMath": false,
    "lineSpacing": 1,
    "replaceExponents": true,
    "replaceHTML%Codes": true,
    "replaceNewLines": true,
    "replaceNumbers": true,
    "replaceSubScript": true,
    "replaceTabs": true,
    "spellCheck": true,
    "tabSize": 2,
    "useDoubleDashes": true,
    "useFancyQuotes": true,
    "deleteChars": {
      enable: false,
      chars: ["a", "e", "i", "o", "u"]
    },
    "customReplace": {
      enable: false,
      values: []
    },
    "fixGrammar": true
  };
  public static objectIncludes<K>(obj: K, key: keyof K, mode: "key" | "value" = "key") {
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
  /**
   * @param {string} str The string to parse
   */
  public static parse(str: string, options: parse2Options = this.parse2DefaultOptions) {
    if (options.spellCheck && !this.done1) {
      let wordsArr = str.split(" ");
      wordsArr.forEach((word, i) => {
        if (
          !Dictatory.words.includes(
            word
              .toLowerCase()
              .replace(/[^\w]/g, "")
              .replace(/<[^<>]*>/, "")
          ) &&
          word &&
          !/\d/.test(word) &&
          !/<\w>/.test(word) &&
          !/<\/\w>/.test(word) &&
          !this.objectIncludes(this.parse2Data.spellWords, word)
        ) {
          wordsArr[i] = `<span class=incorrect>${word}</span>`;
        }
      });
      str = wordsArr.join(" ");
    }
    if (options.deleteChars.enable) {
      str = str
        .replace(/style/g, "!1!")
        .replace(/href/g, "!2!")
        .replace(RegExp(`\\B[${options.deleteChars.chars}]`, "gi"), "")
        .replace(/!1!/g, "style")
        .replace(/!2!/g, "href");
    }
    if (options.customReplace.enable)
      options.customReplace.values.forEach((value) => {
        value.flags = value.flags || "";
        if (!value.flags?.includes("g")) {
          value.flags += "g";
        }
        str = str.replace(RegExp(value.searchValue, value.flags), value.replaceValue);
      });
    if (Array.isArray(str)) str = str.join("");
    if (options.useDoubleDashes) str = str.replace(/--/g, "&mdash;");
    if (options.formatMath) {
      str = str
        .replace(/([^(])\+([^\)])/g, "$1 &plus; $2")
        .replace(/([^(])\+([^\)])/g, "$1 &plus; $2")
        .replace(/([^])- ([^])/g, "$1 &minus; $2")
        .replace(/([^(])\*([^\)])/g, "$1 &bullet; $2")
        .replace(/([^(])\*([^\)])/g, "$1 &bullet; $2")
        .replace(/([^(\\])\=([^\)>])/g, "$1 &equals; $2")
        .replace(/([^(\\])\=([^\)>])/g, "$1 &equals; $2");
    }
    str = str.replace(/\\=/g, "=");
    if (options["replaceHTML%Codes"]) {
      str = str
        .replace(/%h1\n/, "%h1")
        .replace(/%h1\[style=\"([^]*)\"\]([^]*)%h1/g, `<h1 style=\\"$1">$2</h1>`)
        .replace(/%h2\[style=\"([^]*)\"\]([^]*)%h2/g, `<h2 style=\\"$1">$2</h2>`)
        .replace(/%h3\[style=\"([^]*)\"\]([^]*)%h3/g, `<h3 style=\\"$1">$2</h3>`)
        .replace(/%div\[style=\"([^]*)\"\]([^]*)%div/g, `<div style=\\"$1">$2</div>`)
        .replace(/%a\[href=\"([^]*)\"\]([^]*)%a/g, `<a href=\\"$1">$2</a>`)
        .replace(/%br/g, "<br>");
      for (const key in HTMLElementTagNames) {
        if (Object.prototype.hasOwnProperty.call(HTMLElementTagNames, key)) {
          const element = HTMLElementTagNames[key];
          str = str.replace(new RegExp(`%${key}([^]*?)%${key}`, "g"), `<${key}>$1</${key}>`);
        }
      }
      // .replace(/%p([^]*)%p/g, '<p>$1</p>');
    }
    if (options.replaceNumbers) {
      this.parse2Data.numbersLt10.forEach((num, i) => {
        let regex: string = `([^\\\\])%${i}`;
        str = str.replace(RegExp(regex, "g"), `$1${num}`);
      });
      // this.parse2Data.numbersLt10.forEach((num, i) => {
      //   let regex: string = '\\\\%';
      //   regex += i;
      //   // regex += '';
      //   str = str
      //     .replace(RegExp(regex, 'g'), `%${i}`);
      // });
      str = str.replace(/\\%(\d)/g, "%$1");
      this.parse2Data.numbersLt10.forEach((num, i) => {
        let regex: string = `%_${i}`;
        str = str.replace(RegExp(regex, "g"), num[0].toUpperCase() + num.slice(1));
      });
      for (const i in this.parse2Data.numbersGt10) {
        if (Object.hasOwnProperty.call(this.parse2Data.numbersGt10, i)) {
          const num = this.parse2Data.numbersGt10[i];
          let regex: string = "([^\\\\])%\\{";
          regex += i;
          regex += "\\}";
          str = str.replace(RegExp(regex, "g"), `$1${num}`);
        }
      }
      // for (const i in this.parse2Data.numbersGt10) {
      //   if (Object.hasOwnProperty.call(this.parse2Data.numbersGt10, i)) {
      //     const num = this.parse2Data.numbersGt10[i];
      //     let regex = '\\\\%\\{';
      //     regex += i;
      //     regex += '\\}';
      //     str = str
      //       .replace(RegExp(regex, 'g'), `%{${i}}`);
      //   }
      // }
      for (const i in this.parse2Data.numbersGt10) {
        if (Object.hasOwnProperty.call(this.parse2Data.numbersGt10, i)) {
          const num = this.parse2Data.numbersGt10[i];
          let regex = "%_\\{";
          regex += i;
          regex += "\\}";
          str = str.replace(RegExp(regex, "g"), num[0].toUpperCase() + num.slice(1));
        }
      }
      str = str.replace(
        /([^\\])%\{\d*\}/g,
        `$1<font color="red">That number is greater than 20</font>`
      );
      str = str.replace(/\\%\{(\d+)\}/g, "%{$1}");
    }
    if (options.replaceSubScript) {
      str = str.replace(/_\{([^]*)\}/g, "<sub>$1</sub>").replace(/_(\d)/g, "<sub>$1</sub>");
    }
    if (options.replaceExponents) {
      str = str.replace(/\^\{([^]*)\}/g, "<sup>$1</sup>").replace(/\^(\d)/g, "<sup>$1</sup>");
    }
    if (options.useFancyQuotes) {
      str = str
        // .replace(/([^\\])\{"([^"“”]*)"\}/g, "$1&ldquo;$2&rdquo;")
        .replace(/([^\\])"([^"“”]*)"/g, "$1&ldquo;$2&rdquo;")
        .replace(/([^\\])\{'([^\{\}]*)'\}/g, "$1&lsquo;$2&rsquo;")
        .replace(/([^\\])'/g, "$1&rsquo;")
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\\{'([^]*)'\}/g, "{'$1'}");
    }
    if (options.replaceTabs) {
      str = str.replace(/\t/g, "&nbsp;".repeat(options.tabSize));
    }
    str = str.replace(/\\"([^]*)"/g, '"$1"');
    if (options.spellCheck) {
      for (const key in this.parse2Data.spellWords) {
        if (Object.hasOwnProperty.call(this.parse2Data.spellWords, key)) {
          const element = this.parse2Data.spellWords[key];
          let regex = `\\b${key}\\b`;
          str = str.replace(
            RegExp(regex, "g"),
            (this.done1 ? "" : "<span class=misspelled>") + element + (this.done1 ? "" : "</span>")
          );
        }
      }
    }
    if (options.replaceNewLines) {
      str = str.replace(/\n/g, "<br>".repeat(options.lineSpacing));
    }

    if (options.fixGrammar) {
      for (const key in this.parse2Data.grammarFixes) {
        if (Object.prototype.hasOwnProperty.call(this.parse2Data.grammarFixes, key)) {
          const element = this.parse2Data.grammarFixes[key];
          let regex: string = `\\b${key}\\b`;
          str = str.replace(RegExp(regex, "g"), element);
        }
      }

      function fixSentences(seperator: string | RegExp, joiningString?: string) {
        let sentences = str.split(seperator);
        sentences.forEach((sentence, i) => {
          sentences[i] = sentence[0].toUpperCase() + sentence.slice(1);
        });
        str = sentences.join(seperator instanceof RegExp ? joiningString : seperator);
      }
      fixSentences(". ");
      fixSentences("! ");
      fixSentences("? ");
      fixSentences('." ');
    }

    // console.log("Words: ", str.split(' '));
    // console.log(str.split(' ').filter(value => value).join(' '));
    // console.log(str.split(/[aeiou]/).filter(value => value).join(''));
    // str.split(' ').filter(value => value)
    // return ;
    // return str.split(' ').filter(value => value).join(' ');
    return str.replace(/([^\\])%space/, "$1 ");
  }

  public static defaultOptions = {
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

  public static makeList<type extends keyof questionTypes>(
    list: Question<type>[],
    options: {
      type?: "ol" | "ul";
      lineSpacing?: number;
      parseOptions?: parse2Options;
    } = {
      type: "ol",
      lineSpacing: 1,
      parseOptions: this.parse2DefaultOptions
    }
  ): void {
    let unanswered = 0;
    // if (!initiated)
    //   throw new Error('Not initiated')
    let listHTML: HTMLOListElement | HTMLUListElement | HTMLDivElement =
      document.createElement<"ol">("ol");
    let isDiv: boolean = false;
    /* if (options.id) {
    listHTML = document.getElementById(options.id);
  } else  */ if (options.type == "ol") {
      isDiv = false;
      listHTML = document.createElement<"ol">("ol");
    } else if (options.type == "ul") {
      isDiv = false;
      listHTML = document.createElement("ul");
    } /* else if (type == 'div') {
    isDiv = true;
    listHTML = document.createElement<'div'>('div');
  } */
    listHTML.type = options!.type || "1";
    let answers = "";
    list.forEach((value) => {
      let question = value.question;
      if (value.type != "link" && !(/* this.parse( */ value.answer) /* , true) */) {
        value.answer = `${
          this.done1 ? "" : '<span style=\\"color:blue;\\">'
        }I don't have an answer.${this.done1 ? "" : "</span>"}`;
        unanswered++;
        let answered = false;
      } else var answered = true;
      if (value.type == "ul") {
        if (!value.options) value.options = this.defaultOptions.ul;
        answers = `<${isDiv ? "p" : "li"}>${this.parse(question, options.parseOptions)}<ul>`;
        if (Array.isArray(value.answer))
          value.answer.forEach((answer: string) => {
            // @ts-ignore
            answers += `<li>${value.options.bold ? "<b>" : ""}${this.parse(
              answer,
              options.parseOptions
            )}${value.options.bold ? "</b>" : ""}</li>`;
          });
        listHTML.innerHTML += answers + `</ul></${isDiv ? "p" : "li"}>`;
      } else if (value.type == "ol") {
        if (!value.options) value.options = this.defaultOptions.ol;
        // @ts-ignore
        answers = `<${isDiv ? "p" : "li"}>${this.parse(question, options.parseOptions)}<ol type="${
          value.options.type
        }">`;
        if (Array.isArray(value.answer))
          value.answer.forEach((answer: string) => {
            // @ts-ignore
            answers += `<li>${value.options.bold ? "<b>" : ""}${this.parse(
              answer,
              options.parseOptions
            )}${value.options.bold ? "</b>" : ""}</li>`;
          });
        listHTML.innerHTML += answers + `</ol></${isDiv ? "p" : "li"}>`;
      } else if (value.type == "p") {
        if (!value.options) value.options = this.defaultOptions.p;
        // @ts-ignore
        if (!value.options.list)
          listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${
            isDiv ? "" : this.parse(question, options.parseOptions)
          }${isDiv ? "" : "<br>"}${value.options.bold ? "<b>" : ""}<p>${this.parse(
            Array.isArray(value.answer) ? value.answer.join(", ") : value.answer,
            options.parseOptions
          )}${value.options.bold ? "</b>" : ""}</p></${isDiv ? "p" : "li"}>`;
        else {
          answers = `<${isDiv ? "p" : "li"}>${this.parse(question, options.parseOptions)}<br>`;
          if (Array.isArray(value.answer))
            value.answer.forEach((answer: string) => {
              // @ts-ignore
              answers += `<p>${value.options.bold ? "<b>" : ""}${this.parse(
                answer,
                options.parseOptions
              )}${value.options.bold ? "</b>" : ""}</p>`;
            });
          listHTML.innerHTML += answers + `</${isDiv ? "p" : "li"}>`;
        }
      } else if (value.type == "link") {
        if (!value.options) value.options = this.defaultOptions.link;
        // @ts-ignore
        listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${
          isDiv ? "" : this.parse(question, options.parseOptions)
        }${isDiv ? "" : "<br>"}${value.options.bold ? "<b>" : ""}<a href="${value.link}" target="${
          value.options.target
        }">${this.parse(value.text ? value.text : "") || "link"}</a>${
          value.options.bold ? "</b>" : ""
        }</${isDiv ? "p" : "li"}>`;
      } else {
        if (!value.options) value.options = this.defaultOptions.text;
        // @ts-ignore
        listHTML.innerHTML += `<${isDiv ? "p" : "li"}>${
          isDiv ? "" : this.parse(question, options.parseOptions)
        }${isDiv ? "" : "<br>"}${value.options.bold ? "<b>" : ""}${this.parse(
          Array.isArray(value.answer) ? value.answer.join(", ") : value.answer,
          options.parseOptions
        )}${value.options.bold ? "</b>" : ""}</${isDiv ? "p" : "li"}>`;
      }
    });
    this.done1 || this.log(`unanswered: ${unanswered < 10 ? "0" + unanswered : unanswered}`);
    document.body.appendChild(listHTML);
    this.done1 || this.log(`unanswered: ${unanswered < 10 ? "0" + unanswered : unanswered}`);
  }

  static TODO = class {
    text: string;
    constructor(text: string) {
      this.text = text;
    }
  };
} /*, The Mist Sanctum */
// class text {
//   parsed: string;
//   text: string;
//   constructor(text: any, options?: parse2Options) {
//     this.parsed = parse(text.toString(), options || undefined);
//     this.text = text.toString();
//   }
// }
type defaultTextOptions = {
  bold: boolean;
};
type defaultPOptions = {
  list: boolean;
  bold: boolean;
};
type defaultOlOptions = {
  type: string;
  bold: boolean;
};
type defaultUlOptions = {
  bold: boolean;
};
type defaultLinkOptions = {
  target: string;
};
type parse2Options = {
  "formatMath": boolean;
  "lineSpacing": number;
  "replaceExponents": boolean;
  "replaceHTML%Codes": boolean;
  "replaceNewLines": boolean;
  "replaceNumbers": boolean;
  "replaceSubScript": boolean;
  "replaceTabs": boolean;
  "spellCheck": boolean;
  "tabSize": number;
  "useDoubleDashes": boolean;
  "useFancyQuotes": boolean;
  "deleteChars": {
    enable: boolean;
    chars: string | string[];
  };
  "customReplace": {
    enable: boolean;
    values: {
      searchValue: string | RegExp;
      replaceValue: string;
      flags?: string;
    }[];
  };
  "fixGrammar": boolean;
};
const HTMLElementTagNames = {
  a: HTMLAnchorElement,
  abbr: HTMLElement,
  address: HTMLElement,
  area: HTMLAreaElement,
  article: HTMLElement,
  aside: HTMLElement,
  audio: HTMLAudioElement,
  b: HTMLElement,
  base: HTMLBaseElement,
  bdi: HTMLElement,
  bdo: HTMLElement,
  blockquote: HTMLQuoteElement,
  body: HTMLBodyElement,
  br: HTMLBRElement,
  button: HTMLButtonElement,
  canvas: HTMLCanvasElement,
  caption: HTMLTableCaptionElement,
  cite: HTMLElement,
  code: HTMLElement,
  col: HTMLTableColElement,
  colgroup: HTMLTableColElement,
  data: HTMLDataElement,
  datalist: HTMLDataListElement,
  dd: HTMLElement,
  del: HTMLModElement,
  details: HTMLDetailsElement,
  dfn: HTMLElement,
  dialog: HTMLDialogElement,
  div: HTMLDivElement,
  dl: HTMLDListElement,
  dt: HTMLElement,
  em: HTMLElement,
  embed: HTMLEmbedElement,
  fieldset: HTMLFieldSetElement,
  figcaption: HTMLElement,
  figure: HTMLElement,
  footer: HTMLElement,
  form: HTMLFormElement,
  h1: HTMLHeadingElement,
  h2: HTMLHeadingElement,
  h3: HTMLHeadingElement,
  h4: HTMLHeadingElement,
  h5: HTMLHeadingElement,
  h6: HTMLHeadingElement,
  head: HTMLHeadElement,
  header: HTMLElement,
  hgroup: HTMLElement,
  hr: HTMLHRElement,
  html: HTMLHtmlElement,
  i: HTMLElement,
  iframe: HTMLIFrameElement,
  img: HTMLImageElement,
  input: HTMLInputElement,
  ins: HTMLModElement,
  kbd: HTMLElement,
  label: HTMLLabelElement,
  legend: HTMLLegendElement,
  li: HTMLLIElement,
  link: HTMLLinkElement,
  main: HTMLElement,
  map: HTMLMapElement,
  mark: HTMLElement,
  menu: HTMLMenuElement,
  meta: HTMLMetaElement,
  meter: HTMLMeterElement,
  nav: HTMLElement,
  noscript: HTMLElement,
  object: HTMLObjectElement,
  ol: HTMLOListElement,
  optgroup: HTMLOptGroupElement,
  option: HTMLOptionElement,
  output: HTMLOutputElement,
  p: HTMLParagraphElement,
  picture: HTMLPictureElement,
  pre: HTMLPreElement,
  progress: HTMLProgressElement,
  q: HTMLQuoteElement,
  rp: HTMLElement,
  rt: HTMLElement,
  ruby: HTMLElement,
  s: HTMLElement,
  samp: HTMLElement,
  script: HTMLScriptElement,
  section: HTMLElement,
  select: HTMLSelectElement,
  slot: HTMLSlotElement,
  small: HTMLElement,
  source: HTMLSourceElement,
  span: HTMLSpanElement,
  strong: HTMLElement,
  style: HTMLStyleElement,
  sub: HTMLElement,
  summary: HTMLElement,
  sup: HTMLElement,
  table: HTMLTableElement,
  tbody: HTMLTableSectionElement,
  td: HTMLTableCellElement,
  template: HTMLTemplateElement,
  textarea: HTMLTextAreaElement,
  tfoot: HTMLTableSectionElement,
  th: HTMLTableCellElement,
  thead: HTMLTableSectionElement,
  time: HTMLTimeElement,
  title: HTMLTitleElement,
  tr: HTMLTableRowElement,
  track: HTMLTrackElement,
  u: HTMLElement,
  ul: HTMLUListElement,
  var: HTMLElement,
  video: HTMLVideoElement,
  wbr: HTMLElement
};
