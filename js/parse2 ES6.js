/**
 * @param {string} html An html string
 * @returns Escaped html string
 */
function escapeHTML(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
var parse2Data = {
  "numbersLt10": [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine"
  ],
  "numbersGt10": {
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
  "spellWords": {
    "Avocadoe*s": "Avocados",
    "Bea+tle": "Beetle",
    "Me+t+ings": "Meetings",
    "Rain\\s*forests": "Rain forests",
    "Va+gas": "Vegas",
    "Vocan*b*n*ulary": "Vocabulary",
    "[the]{3}": "the",
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
    "temp": "temperature"
  }
};
console.log = (str1) => {
  var element = document.createElement('pre');
  element.innerHTML = str1;
  element.style.display = 'block';
  document.body.appendChild(element);
};
var done1 = false;
var canvas1 = 'https://csd509j.instructure.com/';
function makeHead({ favicon, canvas, title, styles = '', done = false, editable = false }) {
  done1 = done;
  var elem = document.createElement('link');
  elem.rel = 'shortcut icon',
    elem.type = 'image/x-icon',
    elem.href = favicon,
    document.head.appendChild(elem),
    canvas1 = canvas || canvas1,
    document.title = title,
    assignment = true,
    initiated = true;
  if (!done1) {
    const a = document.createElement('a');
    a.href = canvas1;
    a.innerHTML = 'Canvas';
    a.target = '_blank';
    a.style.display = 'block';
    document.body.appendChild(a);
  }
  if (editable) document.querySelector('html').contentEditable = true;
  const stylesElem = document.createElement('style');
  stylesElem.innerHTML = styles || '';
  document.head.append(stylesElem);
}
var parse2Options = {
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
    "enable": false,
    "chars": 'aeiou'
  },
  "customReplace": {

  }
};
/**
 * @param {string} str The string to parse
 */
function parse2(str) {
  if (parse2Options.deleteChars.enable) {
    str = str
      .replace(/style/g, '!1!')
      .replace(/href/g, '!2!')
      .replace(RegExp(`\\B[${parse2Options.deleteChars.chars}]`, 'gi'), '')
      .replace(/!1!/g, 'style')
      .replace(/!2!/g, 'href');
  }
  for (const key in parse2Options.customReplace) {
    if (Object.hasOwnProperty.call(parse2Options.customReplace, key)) {
      const value = parse2Options.customReplace[key];
      str = str.replace(RegExp(key, 'g'), value);
    }
  }
  if (Array.isArray(str)) str = str.join('');
  if (parse2Options.useDoubleDashes) str = str.replace(/--/g, '&mdash;');
  if (parse2Options.formatMath) {
    str = str
      .replace(/([^(])\+([^\)])/g, '$1 &plus; $2')
      .replace(/([^(])\+([^\)])/g, '$1 &plus; $2')
      .replace(/([^])- ([^])/g, '$1 &minus; $2')
      .replace(/([^(])\*([^\)])/g, '$1 &bullet; $2')
      .replace(/([^(])\*([^\)])/g, '$1 &bullet; $2')
      .replace(/([^(\\])\=([^\)>])/g, '$1 &equals; $2')
      .replace(/([^(\\])\=([^\)>])/g, '$1 &equals; $2');
  }
  str = str.replace(/\\=/g, '=');
  if (parse2Options["replaceHTML%Codes"]) {
    str = str
      .replace(/%h1\n/, '%h1')
      .replace(/%h1\[style=\"([^]*)\"\]([^]*)%h1/g, `<h1 style=\\"$1">$2</h1>`)
      .replace(/%h1([^]*)%h1/g, '<h1>$1</h1>')
      .replace(/%h2\[style=\"([^]*)\"\]([^]*)%h2/g, `<h2 style=\\"$1">$2</h2>`)
      .replace(/%h2([^]*)%h2/g, '<h2>$1</h2>')
      .replace(/%h3\[style=\"([^]*)\"\]([^]*)%h3/g, `<h3 style=\\"$1">$2</h3>`)
      .replace(/%h3([^]*)%h3/g, '<h3>$1</h3>')
      .replace(/%a\[href=\"([^]*)\"\]([^]*)%a/g, `<a href=\\"$1">$2</a>`)
      .replace(/%b([^]*)%b/g, '<b>$1</b>');
    // .replace(/%p([^]*)%p/g, '<p>$1</p>');
  }
  if (parse2Options.replaceSubScript) {
    str = str
      .replace(/_\{([^]*)\}/g, '<sub>$1</sub>')
      .replace(/_(\d)/g, '<sub>$1</sub>');
  }
  if (parse2Options.replaceExponents) {
    str = str
      .replace(/\^\{([^]*)\}/g, '<sup>$1</sup>')
      .replace(/\^(\d)/g, '<sup>$1</sup>');
  }
  if (parse2Options.useFancyQuotes) {
    str = str
      .replace(/([^\\])"([^"]*)"/g, '$1&ldquo;$2&rdquo;')
      .replace(/([^\\])\{'([^\{\}]*)'\}/g, '$1&lsquo;$2&rsquo;')
      .replace(/([^\\])'/g, '$1&rsquo;')
      .replace(/\\'/g, "'")
      .replace(/\\\{'([^]*)'\}/g, "{'$1'}");
  }
  if (parse2Options.replaceTabs) {
    str = str.replace(/\t/g, '&nbsp;'.repeat(parse2Options.tabSize));
  }
  if (parse2Options.replaceNewLines) {
    str = str.replace(/\n/g, '<br>'.repeat(parse2Options.lineSpacing));
  }
  str = str
    .replace(/\\"([^]*)"/g, '"$1"');
  if (parse2Options.replaceNumbers) {
    parse2Data.numbersLt10.forEach((num, i) => {
      var regex = '([^\\\\])%';
      regex += i;
      str = str
        .replace(RegExp(regex, 'g'), `$1${num}`);
    });
    // parse2Data.numbersLt10.forEach((num, i) => {
    //   var regex = '\\\\%';
    //   regex += i;
    //   // regex += '';
    //   str = str
    //     .replace(RegExp(regex, 'g'), `%${i}`);
    // });
    str = str.replace(/\\%(\d)/g, '%$1');
    parse2Data.numbersLt10.forEach((num, i) => {
      var regex = '%_';
      regex += i;
      regex += '';
      str = str
        .replace(RegExp(regex, 'g'), num[0].toUpperCase() + num.slice(1));
    });
    for (const i in parse2Data.numbersGt10) {
      if (Object.hasOwnProperty.call(parse2Data.numbersGt10, i)) {
        const num = parse2Data.numbersGt10[i];
        var regex = '([^\\\\])%\\{';
        regex += i;
        regex += '\\}';
        str = str
          .replace(RegExp(regex, 'g'), `$1${num}`);
      }
    }
    // for (const i in parse2Data.numbersGt10) {
    //   if (Object.hasOwnProperty.call(parse2Data.numbersGt10, i)) {
    //     const num = parse2Data.numbersGt10[i];
    //     var regex = '\\\\%\\{';
    //     regex += i;
    //     regex += '\\}';
    //     str = str
    //       .replace(RegExp(regex, 'g'), `%{${i}}`);
    //   }
    // }
    for (const i in parse2Data.numbersGt10) {
      if (Object.hasOwnProperty.call(parse2Data.numbersGt10, i)) {
        const num = parse2Data.numbersGt10[i];
        var regex = '%_\\{';
        regex += i;
        regex += '\\}';
        str = str
          .replace(RegExp(regex, 'g'), num[0].toUpperCase() + num.slice(1));
      }
    }
    str = str.replace(/([^\\])%\{\d*\}/g, `$1<font color="red">That number is greater than 20</font>`);
    str = str.replace(/\\%\{(\d+)\}/g, '%{$1}');
  }
  if (parse2Options.spellCheck) {
    for (const key in parse2Data.spellWords) {
      if (Object.hasOwnProperty.call(parse2Data.spellWords, key)) {
        const element = parse2Data.spellWords[key];
        var regex = '\\b';
        regex += key;
        regex += '\\b';
        str = str.replace(RegExp(regex, 'g'), element);
      }
    }
  }
  str = str.replace(/,([^ ])/g, ', $1');
  // console.log("Words: ", str.split(' '));
  // console.log(str.split(' ').filter(value => value).join(' '));
  // console.log(str.split(/[aeiouy]/).filter(value => value).join(''));
  // str.split(' ').filter(value => value)
  // return ;
  // return str.split(' ').filter(value => value).join(' ');
  return str;
}
const defaultOptions = {
  "text": {
    "bold": true
  },
  "p": {
    "list": false,
    "bold": false
  },
  "ol": {
    "type": "1",
    "bold": true
  },
  "ul": {
    "bold": true
  },
  "link": {
    "target": ""
  }
};
function makeList(list, type = 'ol', options = { type: '1', lineSpacing: 1 }) {
  var unanswered = 0;
  // if (!initiated)
  //   throw new Error('Not initiated')
  /* if (options.id) {
    var listHTML = document.getElementById(options.id);
  } else  */if (type == 'ol') {
    var isDiv = false;
    var listHTML = document.createElement('ol');
  } else if (type == 'ul') {
    var isDiv = false;
    var listHTML = document.createElement('ul');
  } else if (type == 'div') {
    var isDiv = true;
    var listHTML = document.createElement('div');
  }
  listHTML.type = options.type;
  var answers = '';
  list.forEach(value => {
    var question = value.question;
    if (value.type != 'link' && !/* parse2( */value.answer/* , true) */) {
      value.answer = `${done1 ? '' : '<span style=\\"color:blue;\\">'}I don't have an answer.${done1 ? '' : '</span>'}`;
      unanswered++;
      var answered = false;
    } else var answered = true;
    if (value.type == 'ul') {
      if (!value.options) value.options = defaultOptions.ul;
      answers = `<${isDiv ? 'p' : 'li'}>${parse2(question)}<ul>`;
      value.answer.forEach((answer) => {
        answers += `<li>${value.options.bold ? '<b>' : ''}${parse2(answer)}${value.options.bold ? '</b>' : ''}</li>`;
      });
      listHTML.innerHTML += answers + `</ul></${isDiv ? 'p' : 'li'}>`;
    } else if (value.type == 'ol') {
      if (!value.options) value.options = defaultOptions.ol;
      answers = `<${isDiv ? 'p' : 'li'}>${parse2(question)}<ol type="${value.options.type}">`;
      value.answer.forEach((answer) => {
        answers += `<li>${value.options.bold ? '<b>' : ''}${parse2(answer)}${value.options.bold ? '</b>' : ''}</li>`;
      });
      listHTML.innerHTML += answers + `</ol></${isDiv ? 'p' : 'li'}>`;
    } else if (value.type == 'p') {
      if (!value.options) value.options = defaultOptions.p;
      if (!value.options.list)
        listHTML.innerHTML += `<${isDiv ? 'p' : 'li'}>${isDiv ? '' : parse2(question)}${isDiv ? '' : '<br>'}${value.options.bold ? '<b>' : ''}<p>${parse2(value.answer)}${value.options.bold ? '</b>' : ''}</p></${isDiv ? 'p' : 'li'}>`;
      else {
        answers = `<${isDiv ? 'p' : 'li'}>${parse2(question)}<br>`;
        value.answer.forEach((answer) => {
          answers += `<p>${value.options.bold ? '<b>' : ''}${parse2(answer)}${value.options.bold ? '</b>' : ''}</p>`;
        });
        listHTML.innerHTML += answers + `</${isDiv ? 'p' : 'li'}>`;
      }
    } else if (value.type == 'link') {
      if (!value.options) value.options = defaultOptions.link;
      listHTML.innerHTML += `<${isDiv ? 'p' : 'li'}>${isDiv ? '' : parse2(question)}${isDiv ? '' : '<br>'}${value.options.bold ? '<b>' : ''}<a href="${value.link}" target="${value.options.target}">${parse2(value.text) || "link"}</a>${value.options.bold ? '</b>' : ''}</${isDiv ? 'p' : 'li'}>`;
    } else {
      if (!value.options) value.options = defaultOptions.text;
      listHTML.innerHTML += `<${isDiv ? 'p' : 'li'}>${isDiv ? '' : parse2(question)}${isDiv ? '' : '<br>'}${value.options.bold ? '<b>' : ''}${parse2(value.answer)}${value.options.bold ? '</b>' : ''}</${isDiv ? 'p' : 'li'}>`;
    }
  });
  done1 || console.log(`unanswered: ${unanswered}`);
  options.id || document.body.appendChild(listHTML);
  done1 || console.log(`unanswered: ${unanswered}`);
}