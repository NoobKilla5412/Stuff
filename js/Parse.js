define(async (req, exports, module, args) => {
  const overload = await req("./overload.js");
  const { typedef, assignType, isType } = await req("typeUtils");

  // args = defaultArgs(args, {
  //   highlightMisspelled: true
  // });

  /* eslint-disable eqeqeq */
  let dict = {};
  // if (args.highlightMisspelled) {
  ({ dict } = await req("./ExtendedWords.js"));
  // }

  const lineBreakChars = [" ", "-", ",", "."];

  const parseAndWrap = overload()
    .add(["string | String", "number | undefined"], (str, maxLineLength) => wrapString(parse(str), maxLineLength))
    .compile();
  exports.parseAndWrap = parseAndWrap;

  /**
   * Wrap the `text` to a certain `maxLineLength`.
   * @param {string} string
   * @param {number=} maxLineLength
   */
  function wrapString(text, maxLineLength = 70) {
    if (maxLineLength == -1 || text.parse === false) return text;
    let words = text.replace(/[\r\n]+/g, " ").split(" ");
    let lineLength = 0;
    let output = "";
    let i = 0;
    for (let word of words) {
      if (lineLength + word.length >= maxLineLength) {
        output += `\n${word} `;
        lineLength = word.length + 1;
      } else {
        output += `${word} `;
        lineLength += word.length + 1;
      }
      i++;
    }
    return output.replace(/ ([\r\n]+)/g, "$1").trim();
  }
  exports.wrapString = wrapString;

  typedef(
    "DefaultParseOptions",
    `
    {
      lineSpacing: number;
      replaceExponents: boolean;
      "replaceHTML%Codes": boolean;
      replaceNewLines: boolean;
      replaceNumbers: boolean;
      replaceSubScript: boolean;
      replaceTabs: boolean;
      spellCheck: boolean;
      tabSize: number;
      useDoubleDashes: boolean;
      useFancyQuotes: boolean;
      deleteChars: {
        enable: boolean;
        chars: string[] | string;
      };
      customReplace: {
        enable: boolean;
        values: {
          searchValue: string;
          flags: string;
        }[];
      };
      fixGrammar: boolean;
      highlightMisspelled: boolean;
    }`
  );
  let defaultParseOptions = assignType("DefaultParseOptions", {
    lineSpacing: 1,
    replaceExponents: true,
    "replaceHTML%Codes": true,
    replaceNewLines: true,
    replaceNumbers: true,
    replaceSubScript: true,
    replaceTabs: true,
    spellCheck: true,
    tabSize: 2,
    useDoubleDashes: true,
    useFancyQuotes: true,
    deleteChars: {
      enable: false,
      chars: ["a", "e", "i", "o", "u"]
    },
    customReplace: {
      enable: false,
      values: []
    },
    fixGrammar: true,
    highlightMisspelled: true
  }).value;
  exports.defaultParseOptions = defaultParseOptions;

  /**
   *
   * @param {Partial<typeof defaultParseOptions>=} options
   * @returns {typeof defaultParseOptions}
   */
  function getOptions(options) {
    return Object.assign({}, defaultParseOptions, options);
  }
  exports.getOptions = getOptions;
  const parse2Data = {
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
      hte: "the",
      abrige: "abridge",
      "achie*ve": "achieve",
      alot: "a lot",
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
      napoleon: "Napoleon",
      "s*dismantled": "dismantled",
      "sg+ortened": "shortened",
      "sin+m*ging": "singing",
      "t[ri]+nomi[la]*(s*)": "trinomial$1",
      tgat: "that",
      taht: "that",
      thier: "their",
      particulary: "particularly",
      timne: "time",
      releatives: "relatives",
      "d*[to]{2}": "to",
      happiely: "happily",
      "tom*or+ow": "tomorrow",
      twinkies: "Twinkies",
      wierd: "weird",
      "coeffici*ent(s?)": "coefficient$1",
      "eqn(s*)": "equation$1",
      "mole*[uc]*lu*[le]*s": "molecules",
      "wat[er]*": "water",
      "dis+ap+e+a*r": "disappear",
      "su[pr]{2}is[ea]*d": "surprised",
      heavear: "heavier",
      enegry: "energy",
      fules: "fuels",
      teh: "the",
      "gi[rl]{2}d*s": "girls",
      "alwa[sy]{2,}": "always",
      "rea*lly": "really",
      "(M|m)oste*ly": "$1ostly",
      "doo+r": "door",
      "w+[sa]{2}": "was",
      didnt: "didn't",
      gounds: "gowns",
      "col+[ae]ge": "college",
      "we*re": "were",
      typeist: "typist",
      werent: "weren't",
      "curt[ia]{2}ns": "curtains",
      "skate*ing": "skating",
      midwest: "Mid-west",
      "each\\s*other": "each other",
      "atti*e*n*t*ion": "attention",
      "high\\s*school": "high school",
      "fir+st": "first",
      "celebre*ated": "celebrated",
      ouat: "our",
      "mot[eh]{2}r": "mother",
      "general+y": "generally",
      compationant: "compassionate",
      manageageing: "managing",
      "super-*intendent": "superintendent",
      "player*d": "played",
      couldnt: "couldn't",
      "(R|r)o[ay]{2}l": "$1oyal",
      fo: "of",
      "flo[ro]{2}s": "floors",
      wsah: "wash",
      wasnt: "wasn't",
      detension: "detention",
      jumior: "junior",
      lvoed: "loved",
      exclenent: "excellent",
      shcool: "school",
      ive: "i've",
      im: "i'm",
      "broa*der": "broader",
      "devo*e*lo*e*ped": "developed",
      "sc[hj]*ool": "school",
      "mo[er]{2,}": "more",
      patiance: "patience",
      "anythi[gn]{2,}": "anything",
      dont: "don't",
      "ginormo+us": "ginormous",
      dirvers: "driver's",
      "fin+al+y": "finally",
      "o*utsi*de*": "outside",
      breesy: "breezy"
    },
    grammarFixes: {
      "\\bi\\b": "I",
      "\\b *, *([^ ])\\b": ", $1",
      "\\b *; *\\b": "; ",
      "(\\?!|!\\?)": "‽",
      "\\b[iI]dk\\b": "I don't know",
      "\\b[iI]dr\\b": "I don't remember",
      " *[.!?] *[a-zA-Z()]?": (x) => {
        let parts = x.split(/([.!?])/).filter((v) => v.trim());
        // writeLn(`<pre>${JSON.stringify(parts)}</pre>`);
        return parts[0] + (parts[1] ? " " + parts[1].trim().toUpperCase() : "");
      },
      "\\bdidnt\\b": "didn't",
      "\\bdont\\b": "don't",
      "\\bwasnt\\b": "wasn't",
      "\\bcouldnt\\b": "couldn't",
      "\\b(um|uh)\\b": "",
      '""': (x) => {
        return "\u201D".repeat(2);
      },
      '\\w"': (x) => {
        return x.slice(0, 1) + "\u201D";
      },
      '"\\w': (x) => {
        return "\u201C" + x.slice(1);
      },
      IPods: "iPods"
    }
  };
  exports.parse2Data = parse2Data;

  /**
   * @param {string} str
   */
  function markdown(str) {
    return overload([str])
      .add(["string | String"], () => {
        for (let i = 6; i > 0; i--) {
          str = str.replace(new RegExp(`^${"#".repeat(i)} (.*?)$`, "g"), `<h${i}>$1</h${i}>`);
        }
        str = str.replace(/^[\-*] (.*?)$/g, "<li>$1</li>");
        return str;
      })
      .run();
  }

  const doNotParseString = overload()
    .add("string | String", (str) => {
      const string = new String(str);
      string.parse = false;
      return string;
    })
    .compile();
  exports.doNotParseString = doNotParseString;

  function parseObj(obj) {
    let res = {};
    if (obj == null || obj == undefined || typeof obj == "boolean") {
      return obj;
    } else if (Array.isArray(obj)) {
      res = [].concat(obj).map((v) => parseObj(v));
    } else if (typeof obj == "function") {
      return obj;
    } else if (isType(obj, "String")) {
      if (obj.parse == false) {
        res = obj.toString();
      } else res = parseObj(obj.toString());
    } else if (typeof obj == "object") {
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          const element = obj[key];
          let parsedKey = parseObj(key);
          res[parsedKey] = parseObj(element);
        }
      }
    } else if (typeof obj == "string") {
      return parse(obj);
    } else {
      return obj;
    }
    return res;
  }
  exports.parseObj = parseObj;

  const parse = overload()
    .add("string | String", (str) => {
      return parse(str, defaultParseOptions);
    })
    .add(["string | String", `Partial<DefaultParseOptions>`], (str, options) => {
      const parseOptions = getOptions(options);
      if (!str || str.length == 1 || str.parse === false) return str;
      if (str.startsWith('"')) str = " " + str;
      str = markdown(str).trim();
      // str = str.replace(/\b[A-Z]+\b/g, (x) => x.toLowerCase());
      if (parseOptions["replaceHTML%Codes"]) str = replaceHTMLCodes(str);
      if (parseOptions.replaceSubScript) str = replaceSubScript(str);
      // if (parseOptions.spellCheck) str = spellCheck(str);
      if (parseOptions.fixGrammar) str = fixGrammar(str);
      if (parseOptions.highlightMisspelled) str = highlightMisspelled(str, parseOptions);
      if (parseOptions.replaceTabs) str = replaceTabs(str, parseOptions);
      if (parseOptions.deleteChars.enable) str = deleteChars(str, parseOptions);
      if (parseOptions.customReplace.enable) str = customReplace(parseOptions, str);
      if (Array.isArray(str)) str = str.join("");
      if (parseOptions.useDoubleDashes) str = str.replace(/--/g, "&mdash;");
      str = str.replace(/\\=/g, "=");
      if (parseOptions.replaceNumbers) str = replaceNumbers(str);
      if (parseOptions.replaceExponents) str = replaceExponents(str);
      // if (parseOptions.useFancyQuotes) {
      //   str = useFancyQuotes(str);
      // }
      // str = str.replace(/\\"([^]*?)"/g, '"$1"');
      // if (parseOptions.replaceNewLines) str = replaceNewLines(str, parseOptions);
      // console.log("Words: ", str.split(' '));
      // console.log(str.split(' ').filter(value => value).join(' '));
      // console.log(str.split(/[aeiou]/).filter(value => value).join(''));
      // str.split(' ').filter(value => value)
      // return ;
      // return str.split(' ').filter(value => value).join(' ');
      str = str.replace(/\\_/g, " ").replace(/\\(\w)/g, "$1");
      str = str.startsWith(" ") ? str.slice(1) : str;
      return str;
    })
    .compile();
  exports.parse = parse;
  /**
   * @param {string} str
   */
  function fixGrammar(str) {
    str = str[0].toUpperCase() + str.slice(1);
    str = str.replace(/\b([^\\])a ([aeiou])/g, "$1an $2").replace(/([a-z])\s*,\s*([a-z])/gi, "$1, $2");
    // fixSentences(". ");
    // fixSentences("! ");
    // fixSentences("? ");
    // fixSentences('." ');
    // if (!/[.!?"\u2018\u2019\u201C\u201D]/.test(str[str.length - 1])) str += ".";
    for (const key in parse2Data.grammarFixes) {
      if (Object.prototype.hasOwnProperty.call(parse2Data.grammarFixes, key)) {
        const element = parse2Data.grammarFixes[key];
        str = str.replace(RegExp(key, "g"), element);
      }
    }
    return str;
  }
  exports.fixGrammar = fixGrammar;
  function replaceNewLines(str, options) {
    str = str.replace(/\n/g, "<br>".repeat(options.lineSpacing));
    return str;
  }
  exports.replaceNewLines = replaceNewLines;
  function spellCheck(str) {
    for (const key in parse2Data.spellWords) {
      if (Object.hasOwnProperty.call(parse2Data.spellWords, key)) {
        const element = parse2Data.spellWords[key];
        str = str.replace(RegExp(`\\b${key}\\b`, "g"), element);
      }
    }
    return str;
  }
  exports.spellCheck = spellCheck;
  function replaceTabs(str, options) {
    str = str.replace(/(\t|\\t)\s*/g, "&nbsp;".repeat(options.tabSize));
    return str;
  }
  exports.replaceTabs = replaceTabs;
  function useFancyQuotes(str) {
    str = str
      // .replace(/([^\\])\{"([^]*?)"\}/g, "$1&ldquo;$2\u201D")
      .replace(/(?<!\\)"([^]*?)"/g, "\u201C$1\u201D")
      .replace(/(?<!\\)\['([^[\]]*?)'\]/g, "\u2018$1\u2019")
      .replace(/(?<!\\)'/g, "\u2019")
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\{'([^]*?)'\}/g, "{'$1'}");
    return str;
  }
  exports.useFancyQuotes = useFancyQuotes;
  function replaceExponents(str) {
    str = str
      .replace(/(?<!\\)\^([^ _]*)/g, "<sup>$1</sup>")
      .replace(/\\\^/g, "^")
      .replace(/<sup>([^ _]*?)<\/sup>_/g, "<sup>$1</sup>")
      .replace(/\\_/g, "_")
      .replace(/\^(\d)/g, "<sup>$1</sup>");
    return str;
  }
  exports.replaceExponents = replaceExponents;
  function replaceSubScript(str) {
    str = str
      .replace(/_(\d)/g, "<sub>$1</sub>")
      .replace(/(?<!\\)_([^ ^]*)/g, "<sub>$1</sub>")
      .replace(/<sub>([^ ^]*?)<\/sub>\^/g, "<sub>$1</sub>")
      .replace(/\\_/g, "_")
      .replace(/_(\d)/g, "<sub>$1</sub>");
    return str;
  }
  exports.replaceSubScript = replaceSubScript;
  function replaceNumbers(str) {
    parse2Data.numbersLt10.forEach((num, i) => {
      let regex = `([^\\\\])%${i}`;
      str = str.replace(RegExp(regex, "g"), `$1${num}`);
    });
    // parse2Data.numbersLt10.forEach((num, i) => {
    //   let regex: string = '\\\\%';
    //   regex += i;
    //   // regex += '';
    //   str = str
    //     .replace(RegExp(regex, 'g'), `%${i}`);
    // });
    str = str.replace(/\\%(\d)/g, "%$1");
    parse2Data.numbersLt10.forEach((num, i) => {
      let regex = `%_${i}`;
      str = str.replace(RegExp(regex, "g"), num[0].toUpperCase() + num.slice(1));
    });
    for (const i in parse2Data.numbersGt10) {
      if (Object.hasOwnProperty.call(parse2Data.numbersGt10, i)) {
        const num = parse2Data.numbersGt10[i];
        let regex = "([^\\\\])%\\{";
        regex += i;
        regex += "\\}";
        str = str.replace(RegExp(regex, "g"), `$1${num}`);
      }
    }
    // for (const i in parse2Data.numbersGt10) {
    //   if (Object.hasOwnProperty.call(parse2Data.numbersGt10, i)) {
    //     const num = parse2Data.numbersGt10[i];
    //     let regex = '\\\\%\\{';
    //     regex += i;
    //     regex += '\\}';
    //     str = str
    //       .replace(RegExp(regex, 'g'), `%{${i}}`);
    //   }
    // }
    for (const i in parse2Data.numbersGt10) {
      if (Object.hasOwnProperty.call(parse2Data.numbersGt10, i)) {
        const num = parse2Data.numbersGt10[i];
        let regex = "%_\\{";
        regex += i;
        regex += "\\}";
        str = str.replace(RegExp(regex, "g"), num[0].toUpperCase() + num.slice(1));
      }
    }
    str = str.replace(/([^\\])%\{\d*?\}/g, `$1<font color="red">That number is greater than 20</font>`);
    str = str.replace(/\\%\{(\d+)\}/g, "%{$1}");
    return str;
  }
  exports.replaceNumbers = replaceNumbers;
  function replaceHTMLCodes(str) {
    let hasSpace = str.startsWith(" ");
    str = hasSpace ? str : " " + str;
    str = str
      .replace(/%h(\d)\n/g, "%h$1")
      .replace(/%h1\[style="([^]*?)"\]([^]*?)%h1/g, `<h1 style=\\"$1">$2</h1>`)
      .replace(/%h2\[style="([^]*?)"\]([^]*?)%h2/g, `<h2 style=\\"$1">$2</h2>`)
      .replace(/%h3\[style="([^]*?)"\]([^]*?)%h3/g, `<h3 style=\\"$1">$2</h3>`)
      .replace(/%div\[style="([^]*?)"\]([^]*?)%div/g, `<div style=\\"$1">$2</div>`)
      .replace(/%a\[href="([^]*?)"\]([^]*?)%a/g, `<a href=\\"$1">$2</a>`)
      .replace(/%br/g, "<br>");
    for (const key in HTMLElementTagNames) {
      if (Object.prototype.hasOwnProperty.call(HTMLElementTagNames, key)) {
        str = str.replace(new RegExp(`%${key}([^]*?)%${key}`, "g"), `<${key}>$1</${key}>`);
      }
    }
    for (const key in HTMLElementTagNames) {
      if (Object.prototype.hasOwnProperty.call(HTMLElementTagNames, key)) {
        str = str.replace(new RegExp(`%\\${key}([^]*?)%${key}`, "g"), `%${key}$1%${key}`);
      }
    }
    return !hasSpace ? str.slice(1) : str;
    // .replace(/%p([^]*?)%p/g, '<p>$1</p>');
  }
  exports.replaceHTMLCodes = replaceHTMLCodes;
  function customReplace(options, str) {
    options.customReplace.values.forEach((value) => {
      value.flags ||= "";
      if (!value.flags.includes("g")) {
        value.flags += "g";
      }
      str = str.replace(RegExp(value.searchValue, value.flags), value.replaceValue);
    });
    return str;
  }
  exports.customReplace = customReplace;
  function deleteChars(str, options) {
    str = str
      .replace(/style/g, "!1!")
      .replace(/href/g, "!2!")
      .replace(RegExp(`\\B[${options.deleteChars.chars}]`, "gi"), "")
      .replace(/!1!/g, "style")
      .replace(/!2!/g, "href");
    return str;
  }
  exports.deleteChars = deleteChars;
  function testSpellWords(word) {
    let res = false;
    for (const key in parse2Data.spellWords) {
      if (Object.hasOwnProperty.call(parse2Data.spellWords, key)) {
        const element = parse2Data.spellWords[key];
        if (new RegExp(key, "g").test(word)) {
          res = true;
          break;
        }
      }
    }
    return res;
  }
  // const { stopReload } = require("autoReload");
  /**
   * @param {string} str
   * @param {typeof defaultParseOptions} parseOptions
   */
  function highlightMisspelled(str, parseOptions) {
    const splitter = /([^\w’'_])/;
    let wordsArr = str.split(splitter).filter((value) => value);
    let testWordsArr = wordsArr.map(
      (word) => word.toLowerCase()
      // .replace(/’/g, "'")
      // .replace(/[^a-zA-Z\s’']/g, "")
      // .replace(/['’]s$/g, "")
      // .replace(/['’]$/g, "")
      // .replace(/^['’]/g, "")
    );
    if (wordsArr)
      testWordsArr.forEach((word, i) => {
        if (
          word &&
          !splitter.test(word) &&
          !dict.export().corpus?.hasOwnProperty(word) &&
          !/\d/.test(wordsArr[i]) &&
          !/<\w*>/.test(wordsArr[i]) &&
          !/<\/\w*>/.test(wordsArr[i])
        ) {
          wordsArr[i] = `//${(dict.lucky(wordsArr[i]) || "//") + " - " + wordsArr[i]}//`;
          // stopReload();
        }
      });
    str = wordsArr.join("");
    return str;
  }
  exports.highlightMisspelled = highlightMisspelled;

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
  exports.HTMLElementTagNames = HTMLElementTagNames;

  // (await req("./ExtendedWords.js")).defineWords(...Object.keys(HTMLElementTagNames));

  function r() {
    let res = "";
    for (let i = 0; i < arguments[0].length; i++) {
      const element = arguments[0][i];
      res += element + (arguments[i + 1] || "");
    }

    for (let i = 48; i <= 125; i++) {
      if (r.exclude.includes(i)) continue;
      let char = String.fromCharCode(i);
      res = res.replace(new RegExp("\\" + char, "g"), "\\" + char);
    }

    return res;
  }
  exports.r = r;

  r.exclude = ["w", "b", "W", "S", "s", "D", "B", "a", "o", "i", "h", "e", "l", "g", "j", "k", "m", "p"].map((char) =>
    char.charCodeAt(0)
  );
});
