define(async (req, exports) => {
  // const Dictionary_1 = await req("./Dictionary.js");
  const spell = await req("spell");
  const overload = await req("overload.js");

  let dict = spell({
    get: function () {
      // if (window.localStorage.getItem("dict") == null) {
      //   window.localStorage.setItem("dict", JSON.stringify(Dictionary_1.words));
      // }
      return JSON.parse(window.localStorage.getItem("dict"));
    },
    store: function (dict, after_store) {
      window.localStorage.setItem("dict", JSON.stringify(dict));
    }
  });
  exports.dict = dict;

  function defineWords(...words) {
    return overload([words])
      .add(["string[]"], () => {
        for (const word of words) {
          let wordArr = word.split(/([^\w'_])/i);
          if (wordArr)
            for (const element of wordArr) {
              dict.add_word(element);
            }
        }
      })
      .run();
  }
  exports.defineWords = defineWords;

  let words = [
    "Afghanistan",
    "Africa",
    "Albany",
    "Tripoley",
    "America",
    "American",
    "Americans",
    "Antarctica",
    "Arab",
    "Buick",
    "Arkansas",
    "Armenia",
    "AAA",
    "Corvair",
    "wasn't",
    "WA",
    "Bellingham",
    "CO",
    "Greeley",
    "Brandon",
    "Brian",
    "Christianity",
    "Christmas",
    "Clinton",
    "couldn't",
    "Dakota",
    "didn't",
    "DNC",
    "doesn't",
    "don't",
    "Egypt",
    "Ella",
    "Emily",
    "F",
    "Georgia",
    "Gregg",
    "Hebrew",
    "https",
    "II",
    "Iran",
    "Iraq",
    "Islam",
    "Islamic",
    "Israel",
    "Jerusalem",
    "Jewish",
    "Jim",
    "Jr",
    "Judaism",
    "km",
    "Kurdish",
    "Kurds",
    "Lagos, Nigeria",
    "Lausanne",
    "Liuzzo",
    "Luther",
    "Lystrosaurus",
    "Malcolm X",
    "Mexico",
    "misc",
    "NAACP",
    "Nixon",
    "Persian",
    "pg",
    "Philip Randolph",
    "Pietro",
    "Ronald Reagan",
    "Russian",
    "SCLC",
    "Selma",
    "Shi'ite",
    "SNCC",
    "Spanish",
    "Springfield",
    "Sunni",
    "Syria",
    "TCP",
    "Turkish",
    "Venezuela",
    "Vietnam",
    "vs",
    "Washington",
    "Watertown",
    "weren't",
    "WWI",
    "Glencoe",
    "Rushmeyer",
    "you'll",
    "I've",
    "I'm",
    "Mr"
  ];

  // writeLn(JSON.stringify(words.sort((a, b) => a.localeCompare(b))));

  // Dictionary_1.words.push(...words);
  // defineWords(...words);

  // let corpus = {};

  // for (let i = 0; i < Dictionary_1.words.length; i++) {
  //   const element = Dictionary_1.words[i];
  //   corpus[element] = 1;
  // }

  // dict.load({ corpus });
});
